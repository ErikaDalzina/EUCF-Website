import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const VALORANT_ROSTER: GameRoster = rosterFor("valorant");

export async function getValorantRoster(): Promise<GameRoster> {
  return VALORANT_ROSTER;
}
