import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const OVERWATCH_ROSTER: GameRoster = [
  {
    label: "Overwatch A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Tank",
        bio: "Veteran main tank and current A-team shotcaller. Two-year roster member known for aggressive Winston dives and reading enemy cooldowns to set up clean team fights.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Damage", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Damage", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Overwatch B Team",
    main: [
      { ign: "BPlayer1", role: "Tank", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Damage", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Damage", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getOverwatchRoster(): Promise<GameRoster> {
  return OVERWATCH_ROSTER;
}
