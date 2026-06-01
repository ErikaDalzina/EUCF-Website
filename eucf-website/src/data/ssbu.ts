import type { GameRoster } from "@/types/roster";

const PLACEHOLDER_IMAGE = "/knighto.png";

export const SSBU_ROSTER: GameRoster = [
  {
    label: "SSBU A Team",
    main: [
      {
        ign: "The Goat",
        realName: "Real Name",
        role: "Joker",
        bio: "Veteran Joker main with a love for aggressive Arsene reads. Two-year roster member and current A-team captain at locals and collegiate brackets.",
        image: PLACEHOLDER_IMAGE,
        socials: {
          x: "https://x.com/example",
          twitch: "https://twitch.tv/example",
          instagram: "https://instagram.com/example",
        },
      },
      { ign: "Player2", role: "Steve", image: PLACEHOLDER_IMAGE },
      { ign: "Player3", role: "Fox", image: PLACEHOLDER_IMAGE },
      { ign: "Player4", role: "Sephiroth", image: PLACEHOLDER_IMAGE },
      { ign: "Player5", role: "Pikachu", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubA1", role: "Flex", image: PLACEHOLDER_IMAGE },
      { ign: "SubA2", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
  {
    label: "SSBU B Team",
    main: [
      { ign: "BPlayer1", role: "Roy", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer2", role: "Snake", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer3", role: "Pyra/Mythra", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer4", role: "Palutena", image: PLACEHOLDER_IMAGE },
      { ign: "BPlayer5", role: "Diddy Kong", image: PLACEHOLDER_IMAGE },
    ],
    subs: [
      { ign: "SubB1", role: "Flex", image: PLACEHOLDER_IMAGE },
    ],
  },
];

export async function getSSBURoster(): Promise<GameRoster> {
  return SSBU_ROSTER;
}
