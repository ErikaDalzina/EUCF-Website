export interface PlayerSocials {
  x?: string;
  twitch?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
}

export interface Player {
  ign: string;
  realName?: string;
  role?: string;
  bio?: string;
  image: string;
  socials?: PlayerSocials;
}

export interface Team {
  label: string;
  main: Player[];
  subs: Player[];
}

export type GameRoster = Team[];
