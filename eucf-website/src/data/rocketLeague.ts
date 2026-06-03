import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const ROCKET_LEAGUE_ROSTER: GameRoster = rosterFor("rocket-league");

export async function getRocketLeagueRoster(): Promise<GameRoster> {
  return ROCKET_LEAGUE_ROSTER;
}
