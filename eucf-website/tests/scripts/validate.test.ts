import { describe, expect, it } from "vitest";
import { validateContent, type GeneratedContent } from "../../scripts/lib/validate";
import committedTitles from "../../src/data/generated/titles.json";
import committedOfficers from "../../src/data/generated/officers.json";
import committedSponsors from "../../src/data/generated/sponsors.json";
import committedStories from "../../src/data/generated/featuredstory.json";
import committedPlayers from "../../src/data/generated/players.json";

const valid = (): GeneratedContent => ({
  titles: [
    { name: "Valorant", slug: "valorant", icon: "/val.png", description: "5v5 tac shooter" },
  ],
  officers: [{ name: "Prez", position: "President", image: "https://img.example/p.webp" }],
  sponsors: [{ name: "Acme", logo: "/acme.png", website: "https://acme.example" }],
  featuredstory: [
    { title: "Big win", body: "We won", href: "https://news.example/win", imageSrc: "/win.png", imageAlt: "Trophy" },
  ],
  players: {
    valorant: [
      {
        label: "VAL A Team",
        main: [{ ign: "Alpha", image: "/knighto.png" }],
        subs: [],
      },
    ],
  },
});

describe("validateContent", () => {
  it("accepts well-formed content", () => {
    expect(validateContent(valid())).toEqual([]);
  });

  it("flags an empty titles table", () => {
    const c = valid();
    c.titles = [];
    c.players = {};
    expect(validateContent(c)).toEqual([expect.stringContaining("titles: no records")]);
  });

  it("flags titles with missing name or slug", () => {
    const c = valid();
    c.titles[0].name = "";
    c.titles[0].slug = "";
    c.players = {};
    const errors = validateContent(c);
    expect(errors).toContainEqual(expect.stringContaining("empty name"));
    expect(errors).toContainEqual(expect.stringContaining("empty slug"));
  });

  it("flags duplicate slugs", () => {
    const c = valid();
    c.titles.push({ ...c.titles[0], name: "Valorant 2" });
    expect(validateContent(c)).toEqual([expect.stringContaining('duplicate slug "valorant"')]);
  });

  it("flags unsafe URLs wherever they appear", () => {
    const c = valid();
    c.titles[0].icon = "http://insecure.example/icon.png";
    c.officers[0].image = "javascript:alert(1)";
    c.sponsors[0].website = "http://insecure.example";
    c.featuredstory[0].href = "ftp://old.example";
    c.players.valorant[0].main[0].image = "data:image/png;base64,xxx";
    const errors = validateContent(c);
    expect(errors).toHaveLength(5);
    expect(errors).toContainEqual(expect.stringContaining("icon"));
    expect(errors).toContainEqual(expect.stringContaining("officers[0]"));
    expect(errors).toContainEqual(expect.stringContaining("website"));
    expect(errors).toContainEqual(expect.stringContaining("href"));
    expect(errors).toContainEqual(expect.stringContaining('("Alpha")'));
  });

  it("allows empty sponsor website and story href (optional fields)", () => {
    const c = valid();
    c.sponsors[0].website = "";
    c.featuredstory[0].href = "";
    expect(validateContent(c)).toEqual([]);
  });

  it("flags players keyed to a slug with no matching title", () => {
    const c = valid();
    c.players["no-such-game"] = c.players.valorant;
    expect(validateContent(c)).toEqual([expect.stringContaining('players["no-such-game"]')]);
  });

  it("flags empty team labels and empty igns", () => {
    const c = valid();
    c.players.valorant[0].label = "";
    c.players.valorant[0].subs.push({ ign: "", image: "/knighto.png" });
    const errors = validateContent(c);
    expect(errors).toContainEqual(expect.stringContaining("empty team label"));
    expect(errors).toContainEqual(expect.stringContaining("empty ign"));
  });

  // The committed JSON is both the no-secrets build fallback and the test
  // fixture set — every PR re-certifies it deployable.
  it("accepts the committed generated JSON", () => {
    expect(
      validateContent({
        titles: committedTitles,
        officers: committedOfficers,
        sponsors: committedSponsors,
        featuredstory: committedStories,
        players: committedPlayers as GeneratedContent["players"],
      })
    ).toEqual([]);
  });
});
