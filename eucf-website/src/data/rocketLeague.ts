import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const ROCKET_LEAGUE_ROSTER: GameRoster = [
  {
    label: "Rocket League A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Captain",
        bio: "Veteran trios captain known for fast aerials and clean rotations. Two-year roster member and current A-team shotcaller.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Player", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Player", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Player", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Player", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "Rocket League B Team",
    main: [
      { ign: "BPlayer1", role: "Captain", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Player", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Player", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Player", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getRocketLeagueRoster(): Promise<GameRoster> {
  return ROCKET_LEAGUE_ROSTER;
}
