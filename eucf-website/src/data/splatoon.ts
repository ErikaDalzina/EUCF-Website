import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const SPLATOON_ROSTER: GameRoster = rosterFor("splatoon");

export async function getSplatoonRoster(): Promise<GameRoster> {
  return SPLATOON_ROSTER;
}
