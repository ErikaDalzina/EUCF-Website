import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const APEX_LEGENDS_ROSTER: GameRoster = rosterFor("apex-legends");

export async function getApexLegendsRoster(): Promise<GameRoster> {
  return APEX_LEGENDS_ROSTER;
}
