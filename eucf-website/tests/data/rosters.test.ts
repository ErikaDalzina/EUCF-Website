import { describe, expect, it } from "vitest";
import { rosterFor } from "@/data/rosters";
import players from "@/data/generated/players.json";

describe("rosterFor", () => {
  it("returns the roster for a known slug from the generated JSON", () => {
    const slug = Object.keys(players)[0];
    const roster = rosterFor(slug);
    expect(roster.length).toBeGreaterThan(0);
    for (const team of roster) {
      expect(team.label).toBeTruthy();
      expect(Array.isArray(team.main)).toBe(true);
      expect(Array.isArray(team.subs)).toBe(true);
    }
  });

  it("returns an empty array for unknown slugs", () => {
    expect(rosterFor("no-such-game")).toEqual([]);
  });
});
