/**
 * Pure transforms for the build-time content sync (scripts/sync-airtable.ts):
 * Airtable field values -> the shapes written to src/data/generated/*.json.
 * No env reads, no I/O — kept side-effect free so tests can import them
 * without triggering the sync entry point.
 */
import { F, type AirtableRecord } from "./airtable";

export const PLACEHOLDER = "/knighto.png";

export type Player = {
  ign: string;
  realName?: string;
  role?: string;
  bio?: string;
  image: string;
  socials?: Record<string, string>;
};
export type Team = { label: string; main: Player[]; subs: Player[] };

export const str = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : String(v);

// Airtable *attachment* URLs expire ~2 hours after fetch; baked into the static
// export they become broken images. Images belong in R2, with the R2 URL stored
// in the Airtable URL field (sync-images.ts does this automatically).
export const EXPIRING_URL = /airtableusercontent\.com|dl\.airtable\.com/i;

// Synced URLs are written verbatim into href/src attributes, so only allow
// https: (this also blocks javascript:/data: schemes typed into the base).
export function httpsUrl(v: unknown, field: string): string {
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
export function imageUrl(v: unknown, field: string): string {
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

export const firstLink = (v: unknown): string | undefined =>
  Array.isArray(v) && typeof v[0] === "string" ? (v[0] as string) : undefined;

export function socials(f: Record<string, unknown>): Record<string, string> | undefined {
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

// Group players: title slug -> team label -> { main, subs }, sorted by `order`.
export function groupPlayers(
  titles: AirtableRecord[],
  teams: AirtableRecord[],
  players: AirtableRecord[]
): Record<string, Team[]> {
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
  return playersOut;
}
