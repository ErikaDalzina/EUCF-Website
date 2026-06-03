/**
 * Build-time content sync: Airtable -> src/data/generated/*.json
 *
 * Phase 1: image fields are copied through as plain URL strings (no R2 / no
 * optimization yet). If AIRTABLE_TOKEN / AIRTABLE_BASE_ID are not set, the
 * script logs a warning and exits 0 so builds without secrets still succeed
 * against the committed generated JSON.
 *
 * Run with:  npm run sync:content   (or it runs automatically via `prebuild`)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Env vars come from the host environment in CI, and from .env.local locally —
// loaded by `node --env-file-if-exists=.env.local` in the npm scripts (see
// package.json: `sync:content` / `prebuild`). Run with `npm run sync:content`.

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

// Table names — override via env if they differ in the base.
const TABLES = {
  titles: process.env.AIRTABLE_TABLE_TITLES ?? "titles",
  teams: process.env.AIRTABLE_TABLE_TEAMS ?? "teams",
  players: process.env.AIRTABLE_TABLE_PLAYERS ?? "players",
  officers: process.env.AIRTABLE_TABLE_OFFICERS ?? "officers",
  sponsors: process.env.AIRTABLE_TABLE_SPONSORS ?? "sponsors",
  featuredStory: process.env.AIRTABLE_TABLE_FEATUREDSTORY ?? "featuredstory",
};

// View names give deterministic ordering (the grid's top-down order) on tables
// that lack an `order` field. Defaults to Airtable's standard "Grid view"; if a
// table's view is renamed, the fetch falls back to unordered (with a warning) —
// set the matching AIRTABLE_VIEW_* env var to the real view name.
const DEFAULT_VIEW = "Grid view";
const VIEWS = {
  titles: process.env.AIRTABLE_VIEW_TITLES ?? DEFAULT_VIEW,
  teams: process.env.AIRTABLE_VIEW_TEAMS ?? DEFAULT_VIEW,
  officers: process.env.AIRTABLE_VIEW_OFFICERS ?? DEFAULT_VIEW,
  sponsors: process.env.AIRTABLE_VIEW_SPONSORS ?? DEFAULT_VIEW,
  featuredStory: process.env.AIRTABLE_VIEW_FEATUREDSTORY ?? DEFAULT_VIEW,
};

// === Airtable field names — ADJUST THESE TO MATCH THE BASE EXACTLY ===
const F = {
  // titles
  titleName: "name",
  titleSlug: "slug",
  titleImage: "icon",
  titleDescription: "description",
  // teams
  teamName: "team name",
  teamTitleLink: "title", // link → titles
  // players
  playerIgn: "ign",
  playerRealName: "real name",
  playerTeamLink: "team", // link → teams
  playerRoster: "roster", // single-select: main / sub
  playerRole: "role",
  playerOrder: "order",
  playerBio: "bio",
  playerImage: "image",
  playerX: "x",
  playerTwitch: "twitch",
  playerInstagram: "instagram",
  playerDiscord: "discord",
  // officers
  officerName: "name",
  officerPosition: "position",
  officerImage: "image",
  // sponsors
  sponsorName: "name",
  sponsorWebsite: "website",
  sponsorImage: "logo",
  // featuredstory
  storyTitle: "title",
  storyBody: "body",
  storyHref: "href",
  storyImage: "image",
  storyImageAlt: "image alt",
};

const PLACEHOLDER = "/knighto.png";
const OUT_DIR = resolve(process.cwd(), "src/data/generated");

type AirtableRecord = { id: string; fields: Record<string, unknown> };
type Player = {
  ign: string;
  realName?: string;
  role?: string;
  bio?: string;
  image: string;
  socials?: Record<string, string>;
};
type Team = { label: string; main: Player[]; subs: Player[] };

if (!TOKEN || !BASE_ID) {
  console.warn(
    "[sync-airtable] AIRTABLE_TOKEN/AIRTABLE_BASE_ID not set — skipping sync, using committed generated JSON."
  );
  process.exit(0);
}

async function fetchAll(table: string, view?: string): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`
    );
    if (view) 
    {
      url.searchParams.set("view", view);
    }
    url.searchParams.set("pageSize", "100");
    if (offset) 
    {
      url.searchParams.set("offset", offset);
    }

    let res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

    for (let attempt = 0; res.status === 429 && attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    }

    if (!res.ok) {
      if (res.status === 422 && view) {
        console.warn(
          `[sync-airtable] view "${view}" not found on "${table}" — fetching ` +
            `without a view (order may not match the grid). Set AIRTABLE_VIEW_* to fix.`
        );
        return fetchAll(table);
      }
      throw new Error(`Airtable "${table}" ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as { records: AirtableRecord[]; offset?: string };
    records.push(...json.records);
    offset = json.offset;
  } while (offset);

  return records;
}

const str = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : String(v);

// Image field may be a URL string (Phase 1) or an attachment array (Phase 2).
function imageUrl(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();

  if (Array.isArray(v)) {
    const first = v[0];
    if (
      first &&
      typeof first === "object" &&
      "url" in first &&
      typeof (first as { url: unknown }).url === "string"
    ) 
    {
      return (first as { url: string }).url;
    }
  }

  return PLACEHOLDER;
}

const firstLink = (v: unknown): string | undefined =>
  Array.isArray(v) && typeof v[0] === "string" ? (v[0] as string) : undefined;

function socials(f: Record<string, unknown>): Record<string, string> | undefined {
  const s: Record<string, string> = {};
  if (str(f[F.playerX])) s.x = str(f[F.playerX]);
  if (str(f[F.playerTwitch])) s.twitch = str(f[F.playerTwitch]);
  if (str(f[F.playerInstagram])) s.instagram = str(f[F.playerInstagram]);
  if (str(f[F.playerDiscord])) s.discord = str(f[F.playerDiscord]);
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
      image: imageUrl(p.fields[F.playerImage]),
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
    icon: imageUrl(t.fields[F.titleImage]),
    description: str(t.fields[F.titleDescription]),
  }));

  const officersOut = officers.map((o) => ({
    name: str(o.fields[F.officerName]),
    position: str(o.fields[F.officerPosition]),
    image: imageUrl(o.fields[F.officerImage]),
  }));

  const sponsorsOut = sponsors.map((s) => ({
    name: str(s.fields[F.sponsorName]),
    logo: imageUrl(s.fields[F.sponsorImage]),
    website: str(s.fields[F.sponsorWebsite]),
  }));

  const storiesOut = stories.map((s) => ({
    title: str(s.fields[F.storyTitle]),
    body: str(s.fields[F.storyBody]),
    href: str(s.fields[F.storyHref]),
    imageSrc: imageUrl(s.fields[F.storyImage]),
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
