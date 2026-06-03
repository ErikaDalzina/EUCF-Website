import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const COUNTER_STRIKE_2_ROSTER: GameRoster = rosterFor("counter-strike");

export async function getCounterStrike2Roster(): Promise<GameRoster> {
  return COUNTER_STRIKE_2_ROSTER;
}
