export interface Title {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const TITLES: Title[] = [
  {
    name: "Valorant",
    slug: "valorant",
    icon: "/VALlogo.png",
    description:
      "EUCF's Valorant teams compete in collegiate leagues across North America, sharpening tactical play and pushing for bracket placements every season.",
  },
  {
    name: "Overwatch",
    slug: "overwatch",
    icon: "/OWlogo.png",
    description:
      "Our Overwatch roster scrims and competes in collegiate Overwatch circuits, focusing on coordinated team comps and high-tempo play.",
  },
  {
    name: "Marvel Rivals",
    slug: "marvel-rivals",
    icon: "/MRlogo.png",
    description:
      "EUCF's Marvel Rivals squad represents UCF in the newest hero shooter on the block, learning the meta and competing in early collegiate events.",
  },
  {
    name: "Rocket League",
    slug: "rocket-league",
    icon: "/RLlogo.png",
    description:
      "Our Rocket League trios compete in CRL and other collegiate circuits, mixing mechanical flair with rotation discipline.",
  },
  {
    name: "Counter Strike 2",
    slug: "counter-strike",
    icon: "/CS2logo.png",
    description:
      "EUCF's CS team battles in collegiate Counter-Strike leagues, drilling executes, utility, and clutch decision-making week after week.",
  },
  {
    name: "Apex Legends",
    slug: "apex-legends",
    icon: "/APEXlogo.png",
    description:
      "Our Apex Legends squad competes in CCS and other collegiate Apex events, prioritizing rotations, edge play, and clean team fights.",
  },
  {
    name: "League of Legends",
    slug: "league-of-legends",
    icon: "/LOLlogo.png",
    description:
      "EUCF's League of Legends roster competes in collegiate leagues including CLoL, scrimming regularly to stay sharp on macro and draft.",
  },
  {
    name: "Rainbow Six Siege",
    slug: "rainbow-six-siege",
    icon: "/R6logo.png",
    description:
      "Our Rainbow Six Siege team competes in collegiate Siege leagues, focusing on map control, utility usage, and disciplined site executes.",
  },
  {
    name: "Splatoon",
    slug: "splatoon",
    icon: "/SPLATOONlogo.png",
    description:
      "EUCF's Splatoon crew represents UCF in collegiate Splatoon competitions, bringing color and chaos to the inkling battlefield.",
  },
  {
    name: "SSBU",
    slug: "ssbu",
    icon: "/SSBUlogo.png",
    description:
      "Our Super Smash Bros. Ultimate players compete in collegiate Smash brackets and weekly community events around the UCF area.",
  },
];
