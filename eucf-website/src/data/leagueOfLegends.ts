import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const LEAGUE_OF_LEGENDS_ROSTER: GameRoster = [
  {
    label: "League of Legends A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Mid",
        bio: "Veteran mid laner with a deep champion pool and a love for roaming. Two-year roster member and current A-team shotcaller for mid-game macro.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Top", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Jungle", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Bot", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "League of Legends B Team",
    main: [
      { ign: "BPlayer1", role: "Top", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Jungle", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Mid", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Bot", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Support", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getLeagueOfLegendsRoster(): Promise<GameRoster> {
  return LEAGUE_OF_LEGENDS_ROSTER;
}
