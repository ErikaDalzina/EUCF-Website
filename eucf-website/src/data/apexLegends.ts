import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const APEX_LEGENDS_ROSTER: GameRoster = [
  {
    label: "Apex Legends A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "IGL",
        bio: "Veteran in-game leader with a love for aggressive edge rotations. Two-year roster member and current A-team shotcaller for ring positioning and engages.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Fragger", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Apex Legends B Team",
    main: [
      { ign: "BPlayer1", role: "IGL", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Fragger", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getApexLegendsRoster(): Promise<GameRoster> {
  return APEX_LEGENDS_ROSTER;
}
