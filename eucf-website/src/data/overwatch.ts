import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const OVERWATCH_ROSTER: GameRoster = rosterFor("overwatch");

export async function getOverwatchRoster(): Promise<GameRoster> {
  return OVERWATCH_ROSTER;
}
