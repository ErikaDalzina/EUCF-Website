import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const SPLATOON_ROSTER: GameRoster = [
  {
    label: "Splatoon A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Slayer",
        bio: "Veteran frontline slayer with a love for aggressive Splattershot pushes. Two-year roster member and current A-team shotcaller for engages.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Skirmisher", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Anchor", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Splatoon B Team",
    main: [
      { ign: "BPlayer1", role: "Slayer", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Support", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Skirmisher", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Anchor", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getSplatoonRoster(): Promise<GameRoster> {
  return SPLATOON_ROSTER;
}
