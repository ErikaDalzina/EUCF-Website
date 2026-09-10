import { describe, expect, it } from "vitest";
import { rosterFor } from "@/data/rosters";
import players from "@/data/generated/players.json";

describe("rosterFor", () => {
  it("returns an empty array for unknown slugs", () => {
    expect(rosterFor("no-such-game")).toEqual([]);
  });

  // players.json is committed empty on purpose; real rosters land only during a
  // Cloudflare build, so this checks shape rather than requiring records.
  it("returns well-formed teams for every slug in the generated JSON", () => {
    for (const slug of Object.keys(players)) {
      const roster = rosterFor(slug);
      expect(roster.length).toBeGreaterThan(0);
      for (const team of roster) {
        expect(team.label).toBeTruthy();
        expect(Array.isArray(team.main)).toBe(true);
        expect(Array.isArray(team.subs)).toBe(true);
      }
    }
  });
});
