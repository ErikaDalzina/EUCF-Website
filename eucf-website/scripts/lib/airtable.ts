/**
 * Shared Airtable plumbing for the build-time sync scripts
 * (scripts/sync-airtable.ts and scripts/sync-images.ts).
 *
 * Reading env at import time is safe here — this module never exits; each
 * entry point decides what to do when creds are missing (see hasAirtableCreds).
 */

export const TOKEN = process.env.AIRTABLE_TOKEN;
export const BASE_ID = process.env.AIRTABLE_BASE_ID;

export const hasAirtableCreds = (): boolean => Boolean(TOKEN && BASE_ID);

// Table names — override via env if they differ in the base.
export const TABLES = {
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
export const VIEWS = {
  titles: process.env.AIRTABLE_VIEW_TITLES ?? DEFAULT_VIEW,
  teams: process.env.AIRTABLE_VIEW_TEAMS ?? DEFAULT_VIEW,
  officers: process.env.AIRTABLE_VIEW_OFFICERS ?? DEFAULT_VIEW,
  sponsors: process.env.AIRTABLE_VIEW_SPONSORS ?? DEFAULT_VIEW,
  featuredStory: process.env.AIRTABLE_VIEW_FEATUREDSTORY ?? DEFAULT_VIEW,
};

// === Airtable field names — ADJUST THESE TO MATCH THE BASE EXACTLY ===
export const F = {
  // titles
  titleName: "name",
  titleSlug: "slug",
  titleImage: "icon",
  titleImageUpload: "icon upload",
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
  playerImageUpload: "image upload",
  playerX: "x",
  playerTwitch: "twitch",
  playerInstagram: "instagram",
  playerDiscord: "discord",
  // officers
  officerName: "name",
  officerPosition: "position",
  officerImage: "image",
  officerImageUpload: "image upload",
  // sponsors
  sponsorName: "name",
  sponsorWebsite: "website",
  sponsorImage: "logo",
  sponsorImageUpload: "logo upload",
  // featuredstory
  storyTitle: "title",
  storyBody: "body",
  storyHref: "href",
  storyImage: "image",
  storyImageUpload: "image upload",
  storyImageAlt: "image alt",
};

export type AirtableRecord = { id: string; fields: Record<string, unknown> };

// Shape of one entry in an Airtable attachment field's array.
export type Attachment = {
  id: string;
  url: string;
  filename?: string;
  type?: string;
  size?: number;
};

export async function fetchAll(table: string, view?: string): Promise<AirtableRecord[]> {
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

export type RecordUpdate = { id: string; fields: Record<string, unknown> };

// PATCH records back into a table (needs a token with data.records:write).
// The API caps updates at 10 records per request; chunks run sequentially with
// a small gap to stay under the 5 req/s base limit shared with the reads.
export async function patchRecords(table: string, updates: RecordUpdate[]): Promise<void> {
  const endpoint = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;

  for (let i = 0; i < updates.length; i += 10) {
    const chunk = updates.slice(i, i + 10);
    if (i > 0)
    {
      await new Promise((r) => setTimeout(r, 250));
    }

    const request = () =>
      fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: chunk }),
      });

    let res = await request();
    for (let attempt = 0; res.status === 429 && attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      res = await request();
    }

    if (!res.ok) {
      throw new Error(`Airtable PATCH "${table}" ${res.status}: ${await res.text()}`);
    }
  }
}
