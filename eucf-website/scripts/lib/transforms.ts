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

// A player links to every team they play for, so their memberships come from the
// whole array — firstLink is still right for a team's single title link.
export const allLinks = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export function socials(f: Record<string, unknown>): Record<string, string> | undefined {
  const s: Record<string, string> = {};
  const add = (key: string, field: string) => {
    const url = httpsUrl(f[field], `player ${key}`);
    if (url) s[key] = url;
  };
  add("x", F.playerX);
  add("twitch", F.playerTwitch);
  add("youtube", F.playerYoutube);
  add("instagram", F.playerInstagram);
  add("tiktok", F.playerTiktok);
  add("discord", F.playerDiscord);
  return Object.keys(s).length ? s : undefined;
}

// Group players: title slug -> team label -> { main, subs }, sorted by `order`.
// A player may link to several teams (across titles or within one), so each
// player fans out into one entry per team they're on.
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
  let multiTeam = 0;

  for (const p of sortedPlayers) {
    // Main first, so a team picked in *both* form questions wins as main and is
    // dropped by the seen-guard below.
    const memberships = [
      ...allLinks(p.fields[F.playerMainTeams]).map((id) => ({ id, isSub: false })),
      ...allLinks(p.fields[F.playerSubTeams]).map((id) => ({ id, isSub: true })),
    ];

    // Resolve every membership before building the player, so a record that
    // lands nowhere stays silent instead of emitting image/social warnings.
    const placements: { titleSlug: string; label: string; isSub: boolean }[] = [];
    const seen = new Set<string>();

    for (const { id, isSub } of memberships) {
      const team = teamById.get(id);

      if (!team || !team.titleSlug)
      {
        continue; // skip this membership, not the whole player
      }

      // Rosters bucket by team label, so two team records sharing a name merge
      // into one — don't list the same player on it twice.
      const key = `${team.titleSlug}\u0000${team.label}`;

      if (seen.has(key))
      {
        continue;
      }

      seen.add(key);
      placements.push({ titleSlug: team.titleSlug, label: team.label, isSub });
    }

    if (placements.length === 0)
    {
      continue;
    }

    // Built once and shared by reference across every team the player is on:
    // rebuilding per team would re-emit the imageUrl/socials warnings each time.
    const player: Player = {
      ign: str(p.fields[F.playerIgn]),
      realName: str(p.fields[F.playerRealName]) || undefined,
      role: str(p.fields[F.playerRole]) || undefined,
      bio: str(p.fields[F.playerBio]) || undefined,
      image: imageUrl(p.fields[F.playerImage], "player image"),
      socials: socials(p.fields),
    };

    if (placements.length > 1)
    {
      multiTeam++;
    }

    for (const { titleSlug, label, isSub } of placements) {
      if (!byGame.has(titleSlug))
      {
        byGame.set(titleSlug, new Map());
      }

      const teamsMap = byGame.get(titleSlug)!;

      if (!teamsMap.has(label)) {
        teamsMap.set(label, { label, main: [], subs: [] });
      }

      const bucket = teamsMap.get(label)!;
      (isSub ? bucket.subs : bucket.main).push(player);
    }
  }

  if (multiTeam > 0) {
    console.log(`[sync-airtable] ${multiTeam} player(s) on more than one team.`);
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
