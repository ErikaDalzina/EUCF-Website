import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const LEAGUE_OF_LEGENDS_ROSTER: GameRoster = rosterFor("league-of-legends");

export async function getLeagueOfLegendsRoster(): Promise<GameRoster> {
  return LEAGUE_OF_LEGENDS_ROSTER;
}
