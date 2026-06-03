import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const SSBU_ROSTER: GameRoster = rosterFor("ssbu");

export async function getSSBURoster(): Promise<GameRoster> {
  return SSBU_ROSTER;
}
