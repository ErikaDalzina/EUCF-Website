import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { F, type AirtableRecord } from "../../scripts/lib/airtable";
import {
  PLACEHOLDER,
  allLinks,
  firstLink,
  groupPlayers,
  httpsUrl,
  imageUrl,
  socials,
  str,
} from "../../scripts/lib/transforms";

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe("str", () => {
  it("passes strings through", () => {
    expect(str("hello")).toBe("hello");
  });

  it("maps null and undefined to empty string", () => {
    expect(str(null)).toBe("");
    expect(str(undefined)).toBe("");
  });

  it("stringifies other values", () => {
    expect(str(42)).toBe("42");
  });
});

describe("httpsUrl", () => {
  it("returns https URLs trimmed", () => {
    expect(httpsUrl("  https://example.com/a  ", "f")).toBe("https://example.com/a");
  });

  it("returns empty string for empty/whitespace input without warning", () => {
    expect(httpsUrl("", "f")).toBe("");
    expect(httpsUrl("   ", "f")).toBe("");
    expect(warn).not.toHaveBeenCalled();
  });

  it("drops http:// URLs with a warning", () => {
    expect(httpsUrl("http://example.com", "myfield")).toBe("");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("myfield"));
  });

  it("drops javascript: and data: schemes", () => {
    expect(httpsUrl("javascript:alert(1)", "f")).toBe("");
    expect(httpsUrl("data:text/html,<script>", "f")).toBe("");
  });

  it("keeps expiring Airtable attachment URLs (they are https) but warns", () => {
    const url = "https://v5.airtableusercontent.com/v3/u/1/1/abc";
    expect(httpsUrl(url, "f")).toBe(url);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("expires"));
  });
});

describe("imageUrl", () => {
  it("returns an https string as-is", () => {
    expect(imageUrl("https://cdn.example.com/x.webp", "f")).toBe(
      "https://cdn.example.com/x.webp"
    );
  });

  it("returns site-relative paths verbatim", () => {
    expect(imageUrl("/photo.png", "f")).toBe("/photo.png");
  });

  it("takes the first attachment's url from an array", () => {
    expect(imageUrl([{ url: "https://a.example/1.png" }, { url: "https://a.example/2.png" }], "f")).toBe(
      "https://a.example/1.png"
    );
  });

  it("falls back to the placeholder for empty values", () => {
    expect(imageUrl(undefined, "f")).toBe(PLACEHOLDER);
    expect(imageUrl(null, "f")).toBe(PLACEHOLDER);
    expect(imageUrl("", "f")).toBe(PLACEHOLDER);
    expect(imageUrl([], "f")).toBe(PLACEHOLDER);
  });

  it("falls back to the placeholder when the first attachment has no string url", () => {
    expect(imageUrl([{ id: "att1" }], "f")).toBe(PLACEHOLDER);
  });

  it("falls back to the placeholder for non-https strings", () => {
    expect(imageUrl("http://example.com/x.png", "f")).toBe(PLACEHOLDER);
  });
});

describe("firstLink", () => {
  it("returns the first string of an array", () => {
    expect(firstLink(["rec1", "rec2"])).toBe("rec1");
  });

  it("returns undefined for empty arrays and non-arrays", () => {
    expect(firstLink([])).toBeUndefined();
    expect(firstLink("rec1")).toBeUndefined();
    expect(firstLink(undefined)).toBeUndefined();
  });
});

describe("allLinks", () => {
  it("returns every string in the array", () => {
    expect(allLinks(["rec1", "rec2"])).toEqual(["rec1", "rec2"]);
  });

  it("drops non-string entries", () => {
    expect(allLinks(["rec1", 42, null, "rec2"])).toEqual(["rec1", "rec2"]);
  });

  it("returns an empty array for empty arrays and non-arrays", () => {
    expect(allLinks([])).toEqual([]);
    expect(allLinks("rec1")).toEqual([]);
    expect(allLinks(undefined)).toEqual([]);
  });
});

describe("socials", () => {
  it("keeps only present https links", () => {
    const s = socials({
      [F.playerX]: "https://x.com/player",
      [F.playerTwitch]: "https://twitch.tv/player",
      [F.playerYoutube]: "https://youtube.com/@player",
      [F.playerTiktok]: "https://tiktok.com/@player",
    });
    expect(s).toEqual({
      x: "https://x.com/player",
      twitch: "https://twitch.tv/player",
      youtube: "https://youtube.com/@player",
      tiktok: "https://tiktok.com/@player",
    });
  });

  it("drops non-https links", () => {
    const s = socials({ [F.playerDiscord]: "discord.gg/abc" });
    expect(s).toBeUndefined();
  });

  it("returns undefined when nothing is set", () => {
    expect(socials({})).toBeUndefined();
  });
});

describe("groupPlayers", () => {
  const title = (id: string, slug: string): AirtableRecord => ({
    id,
    fields: { [F.titleSlug]: slug },
  });
  const team = (id: string, name: string, titleId?: string): AirtableRecord => ({
    id,
    fields: {
      [F.teamName]: name,
      ...(titleId ? { [F.teamTitleLink]: [titleId] } : {}),
    },
  });
  const player = (
    id: string,
    fields: Record<string, unknown>
  ): AirtableRecord => ({ id, fields });

  it("groups players by title slug and team, splitting main vs subs", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL B Team", "t1"), team("tm2", "VAL A Team", "t1")],
      [
        player("p1", {
          [F.playerIgn]: "Bravo",
          [F.playerMainTeams]: ["tm2"],
          [F.playerOrder]: 2,
        }),
        player("p2", {
          [F.playerIgn]: "Alpha",
          [F.playerMainTeams]: ["tm2"],
          [F.playerOrder]: 1,
        }),
        player("p3", {
          [F.playerIgn]: "Subby",
          [F.playerSubTeams]: ["tm2"],
          [F.playerOrder]: 3,
        }),
        player("p4", {
          [F.playerIgn]: "Benchwarmer",
          [F.playerSubTeams]: ["tm1"],
        }),
      ]
    );

    expect(Object.keys(out)).toEqual(["valorant"]);
    // Teams sorted by label: A Team before B Team.
    expect(out.valorant.map((t) => t.label)).toEqual(["VAL A Team", "VAL B Team"]);
    // Main sorted by order; "sub teams" links land in subs.
    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Alpha", "Bravo"]);
    expect(out.valorant[0].subs.map((p) => p.ign)).toEqual(["Subby"]);
    expect(out.valorant[1].main).toEqual([]);
    expect(out.valorant[1].subs.map((p) => p.ign)).toEqual(["Benchwarmer"]);
  });

  it("fans a player out across teams in different titles", () => {
    const out = groupPlayers(
      [title("t1", "marvel-rivals"), title("t2", "overwatch")],
      [team("tm1", "MR A Team", "t1"), team("tm2", "OW A Team", "t2")],
      [player("p1", { [F.playerIgn]: "Ghost", [F.playerMainTeams]: ["tm1", "tm2"] })]
    );

    expect(out["marvel-rivals"][0].main.map((p) => p.ign)).toEqual(["Ghost"]);
    expect(out.overwatch[0].main.map((p) => p.ign)).toEqual(["Ghost"]);
  });

  it("fans a player out across two teams in the same title", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL A Team", "t1"), team("tm2", "VAL B Team", "t1")],
      [player("p1", { [F.playerIgn]: "Ghost", [F.playerMainTeams]: ["tm1", "tm2"] })]
    );

    expect(out.valorant.map((t) => t.label)).toEqual(["VAL A Team", "VAL B Team"]);
    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Ghost"]);
    expect(out.valorant[1].main.map((p) => p.ign)).toEqual(["Ghost"]);
  });

  it("tracks main vs sub per team, not per player", () => {
    const out = groupPlayers(
      [title("t1", "marvel-rivals"), title("t2", "overwatch")],
      [team("tm1", "MR A Team", "t1"), team("tm2", "OW A Team", "t2")],
      [
        player("p1", {
          [F.playerIgn]: "Ghost",
          [F.playerMainTeams]: ["tm1"],
          [F.playerSubTeams]: ["tm2"],
        }),
      ]
    );

    expect(out["marvel-rivals"][0].main.map((p) => p.ign)).toEqual(["Ghost"]);
    expect(out["marvel-rivals"][0].subs).toEqual([]);
    expect(out.overwatch[0].main).toEqual([]);
    expect(out.overwatch[0].subs.map((p) => p.ign)).toEqual(["Ghost"]);
  });

  it("keeps a player on the teams that resolve when another link is broken", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL A Team", "t1")],
      [player("p1", { [F.playerIgn]: "Ghost", [F.playerMainTeams]: ["tmGone", "tm1"] })]
    );

    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Ghost"]);
  });

  it("lists a player once per team when the same team is picked as main and sub", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL A Team", "t1")],
      [
        player("p1", {
          [F.playerIgn]: "Ghost",
          [F.playerMainTeams]: ["tm1"],
          [F.playerSubTeams]: ["tm1"],
        }),
      ]
    );

    // Main wins — the main links are resolved first.
    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Ghost"]);
    expect(out.valorant[0].subs).toEqual([]);
  });

  it("lists a player once when two team records share a label in one title", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL A Team", "t1"), team("tm2", "VAL A Team", "t1")],
      [player("p1", { [F.playerIgn]: "Ghost", [F.playerMainTeams]: ["tm1", "tm2"] })]
    );

    expect(out.valorant).toHaveLength(1);
    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Ghost"]);
  });

  it("coerces string order values numerically and treats missing order as 0", () => {
    const out = groupPlayers(
      [title("t1", "ow")],
      [team("tm1", "OW", "t1")],
      [
        player("p1", { [F.playerIgn]: "Ten", [F.playerMainTeams]: ["tm1"], [F.playerOrder]: "10" }),
        player("p2", { [F.playerIgn]: "Two", [F.playerMainTeams]: ["tm1"], [F.playerOrder]: "2" }),
        player("p3", { [F.playerIgn]: "Zero", [F.playerMainTeams]: ["tm1"] }),
      ]
    );
    expect(out.ow[0].main.map((p) => p.ign)).toEqual(["Zero", "Two", "Ten"]);
  });

  it("skips players without a team link or whose team has no title slug", () => {
    const out = groupPlayers(
      [title("t1", "valorant"), title("t2", "")],
      [team("tm1", "Orphans", "t2"), team("tm2", "No Title")],
      [
        player("p1", { [F.playerIgn]: "NoTeam" }),
        player("p2", { [F.playerIgn]: "EmptySlug", [F.playerMainTeams]: ["tm1"] }),
        player("p3", { [F.playerIgn]: "NoTitleLink", [F.playerMainTeams]: ["tm2"] }),
        player("p4", { [F.playerIgn]: "GhostTeam", [F.playerMainTeams]: ["tmX"] }),
      ]
    );
    expect(out).toEqual({});
  });

  it("normalizes player fields: empty optionals become undefined, image falls back", () => {
    const out = groupPlayers(
      [title("t1", "valorant")],
      [team("tm1", "VAL", "t1")],
      [
        player("p1", {
          [F.playerIgn]: "Solo",
          [F.playerMainTeams]: ["tm1"],
          [F.playerRealName]: "",
          [F.playerImage]: [],
        }),
      ]
    );
    const p = out.valorant[0].main[0];
    expect(p).toEqual({
      ign: "Solo",
      realName: undefined,
      role: undefined,
      bio: undefined,
      image: PLACEHOLDER,
      socials: undefined,
    });
  });
});
