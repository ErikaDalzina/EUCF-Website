import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const MARVEL_RIVALS_ROSTER: GameRoster = [
  {
    label: "Marvel Rivals A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Duelist",
        bio: "Veteran flex DPS with a love for Iron Man dives. Two-year roster member and current A-team shotcaller for engages.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Vanguard", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Strategist", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Duelist", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Vanguard", image: PLACEHOLDER_IMAGE },
      { ign: "Player6", role: "Strategist", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Marvel Rivals B Team",
    main: [
      { ign: "BPlayer1", role: "Duelist", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Vanguard", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Strategist", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Duelist", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Vanguard", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer6", role: "Strategist", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getMarvelRivalsRoster(): Promise<GameRoster> {
  return MARVEL_RIVALS_ROSTER;
}
