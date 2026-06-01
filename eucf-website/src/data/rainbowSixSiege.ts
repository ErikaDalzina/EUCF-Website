import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const RAINBOW_SIX_SIEGE_ROSTER: GameRoster = [
  {
    label: "Rainbow Six Siege A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "IGL",
        bio: "Veteran in-game leader with a sharp read on the round and crisp mid-round calls. Two-year roster member and current A-team shotcaller.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Entry Fragger", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Hard Breach", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Roamer", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Rainbow Six Siege B Team",
    main: [
      { ign: "BPlayer1", role: "IGL", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Entry Fragger", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Hard Breach", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Roamer", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getRainbowSixSiegeRoster(): Promise<GameRoster> {
  return RAINBOW_SIX_SIEGE_ROSTER;
}
