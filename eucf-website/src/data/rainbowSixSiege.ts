import type { GameRoster } from "@/types/roster";
import { rosterFor } from "@/data/rosters";

export const RAINBOW_SIX_SIEGE_ROSTER: GameRoster = rosterFor("rainbow-six-siege");

export async function getRainbowSixSiegeRoster(): Promise<GameRoster> {
  return RAINBOW_SIX_SIEGE_ROSTER;
}
