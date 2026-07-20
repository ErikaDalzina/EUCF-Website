import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { F, type AirtableRecord } from "../../scripts/lib/airtable";
import {
  PLACEHOLDER,
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

describe("socials", () => {
  it("keeps only present https links", () => {
    const s = socials({
      [F.playerX]: "https://x.com/player",
      [F.playerTwitch]: "https://twitch.tv/player",
    });
    expect(s).toEqual({ x: "https://x.com/player", twitch: "https://twitch.tv/player" });
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
          [F.playerTeamLink]: ["tm2"],
          [F.playerRoster]: "main",
          [F.playerOrder]: 2,
        }),
        player("p2", {
          [F.playerIgn]: "Alpha",
          [F.playerTeamLink]: ["tm2"],
          [F.playerRoster]: "main",
          [F.playerOrder]: 1,
        }),
        player("p3", {
          [F.playerIgn]: "Subby",
          [F.playerTeamLink]: ["tm2"],
          [F.playerRoster]: "Sub",
          [F.playerOrder]: 3,
        }),
        player("p4", {
          [F.playerIgn]: "Benchwarmer",
          [F.playerTeamLink]: ["tm1"],
          [F.playerRoster]: "substitute",
        }),
      ]
    );

    expect(Object.keys(out)).toEqual(["valorant"]);
    // Teams sorted by label: A Team before B Team.
    expect(out.valorant.map((t) => t.label)).toEqual(["VAL A Team", "VAL B Team"]);
    // Main sorted by order; "Sub"/"substitute" prefixes land in subs.
    expect(out.valorant[0].main.map((p) => p.ign)).toEqual(["Alpha", "Bravo"]);
    expect(out.valorant[0].subs.map((p) => p.ign)).toEqual(["Subby"]);
    expect(out.valorant[1].main).toEqual([]);
    expect(out.valorant[1].subs.map((p) => p.ign)).toEqual(["Benchwarmer"]);
  });

  it("coerces string order values numerically and treats missing order as 0", () => {
    const out = groupPlayers(
      [title("t1", "ow")],
      [team("tm1", "OW", "t1")],
      [
        player("p1", { [F.playerIgn]: "Ten", [F.playerTeamLink]: ["tm1"], [F.playerOrder]: "10" }),
        player("p2", { [F.playerIgn]: "Two", [F.playerTeamLink]: ["tm1"], [F.playerOrder]: "2" }),
        player("p3", { [F.playerIgn]: "Zero", [F.playerTeamLink]: ["tm1"] }),
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
        player("p2", { [F.playerIgn]: "EmptySlug", [F.playerTeamLink]: ["tm1"] }),
        player("p3", { [F.playerIgn]: "NoTitleLink", [F.playerTeamLink]: ["tm2"] }),
        player("p4", { [F.playerIgn]: "GhostTeam", [F.playerTeamLink]: ["tmX"] }),
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
          [F.playerTeamLink]: ["tm1"],
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
