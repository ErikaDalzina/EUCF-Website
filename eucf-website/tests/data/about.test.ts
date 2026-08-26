import { describe, expect, it } from "vitest";
import { ABOUT_SECTIONS, presentationKey } from "@/data/about";
import aboutData from "@/data/generated/about.json";

describe("presentationKey", () => {
  it("normalizes casing, whitespace and punctuation", () => {
    expect(presentationKey("Compete")).toBe("compete");
    expect(presentationKey("  compete ")).toBe("compete");
    expect(presentationKey("Give Back")).toBe("give-back");
  });

  it("drops a leading article so 'Dungeon' and 'The Dungeon' agree", () => {
    expect(presentationKey("Dungeon")).toBe("dungeon");
    expect(presentationKey("The Dungeon")).toBe("dungeon");
  });
});

describe("ABOUT_SECTIONS", () => {
  it("passes the CMS fields through unchanged", () => {
    expect(ABOUT_SECTIONS).toHaveLength(aboutData.length);
    ABOUT_SECTIONS.forEach((section, i) => {
      expect(section.title).toBe(aboutData[i].title.trim());
      expect(section.description).toBe(aboutData[i].description);
      expect(section.image).toBe(aboutData[i].image);
      expect(section.imageAlt).toBe(aboutData[i].imageAlt);
    });
  });

  // The eyebrow is an Airtable column now, so there is deliberately no test
  // asserting every section has one: a blank column is legitimate content, and
  // failing the build over it would block a deploy for a missing kicker.
  it("carries the eyebrow through from the generated JSON", () => {
    const overview = ABOUT_SECTIONS.find((s) => s.title === "Overview");
    expect(overview?.eyebrow).toBe(aboutData[0].eyebrow);
  });

  it("treats a blank eyebrow as absent rather than an empty string", () => {
    for (const section of ABOUT_SECTIONS) {
      expect(section.eyebrow).not.toBe("");
    }
  });

  it("attaches tags to Compete only", () => {
    const withTags = ABOUT_SECTIONS.filter((section) => section.tags);
    expect(withTags.map((section) => section.title)).toEqual(["Compete"]);
    expect(withTags[0].tags).toEqual([
      "Tactical FPS",
      "Hero Shooter",
      "MOBA",
      "Battle Royale",
      "Fighting",
      "Rocket League",
    ]);
  });
});
