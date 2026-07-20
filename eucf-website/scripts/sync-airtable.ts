/**
 * Build-time content sync: Airtable -> src/data/generated/*.json
 *
 * Images: editors drop attachments into the `* upload` columns in Airtable.
 * Before JSON generation, scripts/sync-images.ts optimizes each new upload,
 * puts it on R2, writes the public R2 URL into the main image column
 * (`icon`/`image`/`logo` — which may also hold site-relative public/ paths),
 * and clears the upload attachment (Airtable *attachment* URLs expire ~2h
 * after fetch and must not be baked into the static export — the sync warns
 * if it sees one).
 * If AIRTABLE_TOKEN / AIRTABLE_BASE_ID are not set, the script logs a warning
 * and exits 0 so builds without secrets still succeed against the committed
 * generated JSON; missing R2_* vars skip only the image step.
 *
 * Run with:  npm run sync:content   (or it runs automatically via `prebuild`)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { F, TABLES, VIEWS, fetchAll, hasAirtableCreds } from "./lib/airtable";
import { groupPlayers, httpsUrl, imageUrl, str } from "./lib/transforms";
import { validateContent } from "./lib/validate";
import { buildImageJobs, syncImages } from "./sync-images";

// Env vars come from the host environment in CI, and from .env.local locally —
// loaded by `node --env-file-if-exists=.env.local` in the npm scripts (see
// package.json: `sync:content` / `prebuild`). Run with `npm run sync:content`.

const OUT_DIR = resolve(process.cwd(), "src/data/generated");

if (!hasAirtableCreds()) {
  console.warn(
    "[sync-airtable] AIRTABLE_TOKEN/AIRTABLE_BASE_ID not set — skipping sync, using committed generated JSON."
  );
  process.exit(0);
}

async function main(): Promise<void> {
  const [titles, teams, players, officers, sponsors, stories] = await Promise.all([
    fetchAll(TABLES.titles, VIEWS.titles),
    fetchAll(TABLES.teams, VIEWS.teams),
    fetchAll(TABLES.players),
    fetchAll(TABLES.officers, VIEWS.officers),
    fetchAll(TABLES.sponsors, VIEWS.sponsors),
    fetchAll(TABLES.featuredStory, VIEWS.featuredStory),
  ]);

  // Optimize new attachments into R2 and write the URLs back — both to
  // Airtable and to the in-memory records the JSON below is generated from.
  // The build must never fail on images; records keep their old URL field
  // value (or the placeholder) and the next build retries.
  try {
    await syncImages(buildImageJobs({ titles, players, officers, sponsors, stories }));
  } catch (e) {
    console.warn("[sync-images] image pipeline failed — continuing with existing URLs:", e);
  }

  const playersOut = groupPlayers(titles, teams, players);

  const titlesOut = titles.map((t) => ({
    name: str(t.fields[F.titleName]),
    slug: str(t.fields[F.titleSlug]),
    icon: imageUrl(t.fields[F.titleImage], "title icon"),
    description: str(t.fields[F.titleDescription]),
  }));

  const officersOut = officers.map((o) => ({
    name: str(o.fields[F.officerName]),
    position: str(o.fields[F.officerPosition]),
    image: imageUrl(o.fields[F.officerImage], "officer image"),
  }));

  const sponsorsOut = sponsors.map((s) => ({
    name: str(s.fields[F.sponsorName]),
    logo: imageUrl(s.fields[F.sponsorImage], "sponsor logo"),
    website: httpsUrl(s.fields[F.sponsorWebsite], "sponsor website"),
  }));

  const storiesOut = stories.map((s) => ({
    title: str(s.fields[F.storyTitle]),
    body: str(s.fields[F.storyBody]),
    href: httpsUrl(s.fields[F.storyHref], "story href"),
    imageSrc: imageUrl(s.fields[F.storyImage], "story image"),
    imageAlt: str(s.fields[F.storyImageAlt]),
  }));

  // Sanity warnings — surface a mistyped F field name or table name immediately
  // (the script still completes; placeholders remain the fallback).
  const tableCounts: Record<string, number> = {
    titles: titles.length,
    teams: teams.length,
    players: players.length,
    officers: officers.length,
    sponsors: sponsors.length,
    featuredstory: stories.length,
  };
  for (const [name, n] of Object.entries(tableCounts)) {
    if (n === 0) {
      console.warn(`[sync-airtable] 0 records from "${name}" — check the table name/view.`);
    }
  }
  if (titles.length && titlesOut.every((t) => !t.slug)) {
    console.warn(`[sync-airtable] every title slug is empty — check F.titleSlug ("${F.titleSlug}").`);
  }
  if (players.length && Object.keys(playersOut).length === 0) {
    console.warn(
      `[sync-airtable] ${players.length} players fetched but none grouped into a game — ` +
        `check F.playerTeamLink ("${F.playerTeamLink}") / F.teamTitleLink ("${F.teamTitleLink}").`
    );
  }
  const allPlayers = Object.values(playersOut).flatMap((teamList) =>
    teamList.flatMap((tm) => [...tm.main, ...tm.subs])
  );
  if (allPlayers.length && allPlayers.every((p) => !p.ign)) {
    console.warn(`[sync-airtable] every player ign is empty — check F.playerIgn ("${F.playerIgn}").`);
  }

  // Airtable-webhook rebuilds never run CI, so bad content is gated here:
  // failing the build keeps the last good deploy live, and the reasons show up
  // in the Cloudflare build log. No fallback to committed JSON — the fetch
  // succeeded, the data itself is wrong, and the fix belongs in Airtable.
  const validationErrors = validateContent({
    titles: titlesOut,
    officers: officersOut,
    sponsors: sponsorsOut,
    featuredstory: storiesOut,
    players: playersOut,
  });
  if (validationErrors.length) {
    for (const err of validationErrors) {
      console.error(`[sync-airtable] content validation failed: ${err}`);
    }
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const write = (name: string, data: unknown) =>
    writeFileSync(resolve(OUT_DIR, name), JSON.stringify(data, null, 2) + "\n");
  write("players.json", playersOut);
  write("titles.json", titlesOut);
  write("officers.json", officersOut);
  write("sponsors.json", sponsorsOut);
  write("featuredstory.json", storiesOut);

  console.log(
    `[sync-airtable] wrote generated JSON — ${titlesOut.length} titles, ` +
      `${players.length} players across ${Object.keys(playersOut).length} games, ` +
      `${officersOut.length} officers, ${sponsorsOut.length} sponsors, ${storiesOut.length} stories.`
  );
}

main().catch((e) => {
  console.error("[sync-airtable] sync failed:", e);
  // Fall back to the committed generated JSON if it's all present, so a
  // transient Airtable/network failure doesn't break the build.
  const names = ["players", "titles", "officers", "sponsors", "featuredstory"];
  if (names.every((n) => existsSync(resolve(OUT_DIR, `${n}.json`)))) {
    console.warn("[sync-airtable] using existing committed generated JSON.");
    process.exit(0);
  }
  process.exit(1);
});
