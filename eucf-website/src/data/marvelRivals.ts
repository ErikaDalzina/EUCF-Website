import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const MARVEL_RIVALS_ROSTER: GameRoster = rosterFor("marvel-rivals");

export async function getMarvelRivalsRoster(): Promise<GameRoster> {
  return MARVEL_RIVALS_ROSTER;
}
