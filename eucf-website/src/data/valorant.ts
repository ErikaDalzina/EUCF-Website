import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const VALORANT_ROSTER: GameRoster = [
  {
    label: "Valorant A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Duelist",
        bio: "Veteran entry fragger with a love for aggressive Jett dashes. Two-year roster member and current A-team IGL for site executes.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Controller", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Initiator", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Sentinel", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Flex / IGL", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Valorant B Team",
    main: [
      { ign: "BPlayer1", role: "Duelist", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Controller", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Initiator", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Sentinel", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Flex / IGL", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getValorantRoster(): Promise<GameRoster> {
  return VALORANT_ROSTER;
}
