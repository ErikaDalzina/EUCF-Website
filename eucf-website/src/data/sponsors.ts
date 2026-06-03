import sponsorsData from "@/data/generated/sponsors.json";

export interface Sponsor {
  name: string;
  logo: string;
  website: string;
}

export const SPONSORS: Sponsor[] = sponsorsData as Sponsor[];
