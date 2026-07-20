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
import { buildImageJobs, syncImages } from "./sync-images";

// Env vars come from the host environment in CI, and from .env.local locally —
// loaded by `node --env-file-if-exists=.env.local` in the npm scripts (see
// package.json: `sync:content` / `prebuild`). Run with `npm run sync:content`.

const PLACEHOLDER = "/knighto.png";
const OUT_DIR = resolve(process.cwd(), "src/data/generated");

type Player = {
  ign: string;
  realName?: string;
  role?: string;
  bio?: string;
  image: string;
  socials?: Record<string, string>;
};
type Team = { label: string; main: Player[]; subs: Player[] };

if (!hasAirtableCreds()) {
  console.warn(
    "[sync-airtable] AIRTABLE_TOKEN/AIRTABLE_BASE_ID not set — skipping sync, using committed generated JSON."
  );
  process.exit(0);
}

const str = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : String(v);

// Airtable *attachment* URLs expire ~2 hours after fetch; baked into the static
// export they become broken images. Images belong in R2, with the R2 URL stored
// in the Airtable URL field (sync-images.ts does this automatically).
const EXPIRING_URL = /airtableusercontent\.com|dl\.airtable\.com/i;

// Synced URLs are written verbatim into href/src attributes, so only allow
// https: (this also blocks javascript:/data: schemes typed into the base).
function httpsUrl(v: unknown, field: string): string {
  const url = str(v).trim();
  if (!url) return "";
  if (EXPIRING_URL.test(url)) {
    console.warn(
      `[sync-airtable] "${field}" is an Airtable attachment URL that expires ~2h after sync — ` +
        `it should have been replaced by the image pipeline; check the R2_* env vars: ${url.slice(0, 80)}…`
    );
  }
  if (url.startsWith("https://")) return url;
  console.warn(`[sync-airtable] dropping "${field}" — not an https URL: ${url.slice(0, 80)}`);
  return "";
}

// Image field may be a URL string (an R2 URL) or an attachment array.
function imageUrl(v: unknown, field: string): string {
  let raw = "";
  if (typeof v === "string") {
    raw = v.trim();
  } else if (Array.isArray(v)) {
    const first = v[0];
    if (
      first &&
      typeof first === "object" &&
      "url" in first &&
      typeof (first as { url: unknown }).url === "string"
    )
    {
      raw = (first as { url: string }).url;
    }
  }

  if (!raw) return PLACEHOLDER;
  if (raw.startsWith("/")) return raw; // site-relative, served from public/
  return httpsUrl(raw, field) || PLACEHOLDER;
}

const firstLink = (v: unknown): string | undefined =>
  Array.isArray(v) && typeof v[0] === "string" ? (v[0] as string) : undefined;

function socials(f: Record<string, unknown>): Record<string, string> | undefined {
  const s: Record<string, string> = {};
  const add = (key: string, field: string) => {
    const url = httpsUrl(f[field], `player ${key}`);
    if (url) s[key] = url;
  };
  add("x", F.playerX);
  add("twitch", F.playerTwitch);
  add("instagram", F.playerInstagram);
  add("discord", F.playerDiscord);
  return Object.keys(s).length ? s : undefined;
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

  // title record id -> slug
  const titleSlugById = new Map<string, string>();
  for (const t of titles)
  {
    titleSlugById.set(t.id, str(t.fields[F.titleSlug]));
  }

  // team record id -> { titleSlug, label }
  const teamById = new Map<string, { titleSlug: string; label: string }>();
  for (const tm of teams) {
    const titleId = firstLink(tm.fields[F.teamTitleLink]);
    teamById.set(tm.id, {
      titleSlug: titleId ? titleSlugById.get(titleId) ?? "" : "",
      label: str(tm.fields[F.teamName]),
    });
  }

  // group players: title slug -> team label -> { main, subs }, sorted by `order`
  const byGame = new Map<string, Map<string, Team>>();
  const sortedPlayers = [...players].sort(
    (a, b) => Number(a.fields[F.playerOrder] ?? 0) - Number(b.fields[F.playerOrder] ?? 0)
  );

  for (const p of sortedPlayers) {
    const teamId = firstLink(p.fields[F.playerTeamLink]);
    const team = teamId ? teamById.get(teamId) : undefined;

    if (!team || !team.titleSlug)
    {
      continue;
    }

    if (!byGame.has(team.titleSlug))
    {
      byGame.set(team.titleSlug, new Map());
    }

    const teamsMap = byGame.get(team.titleSlug)!;

    if (!teamsMap.has(team.label)) {
      teamsMap.set(team.label, { label: team.label, main: [], subs: [] });
    }

    const player: Player = {
      ign: str(p.fields[F.playerIgn]),
      realName: str(p.fields[F.playerRealName]) || undefined,
      role: str(p.fields[F.playerRole]) || undefined,
      bio: str(p.fields[F.playerBio]) || undefined,
      image: imageUrl(p.fields[F.playerImage], "player image"),
      socials: socials(p.fields),
    };

    const isSub = str(p.fields[F.playerRoster]).toLowerCase().startsWith("sub");
    const bucket = teamsMap.get(team.label)!;
    (isSub ? bucket.subs : bucket.main).push(player);
  }
  // Order teams within each game by label so "… A Team" comes before "… B Team".
  const playersOut: Record<string, Team[]> = {};
  for (const [slug, teamsMap] of byGame) {
    playersOut[slug] = [...teamsMap.values()].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }

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
