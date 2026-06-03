import titlesData from "@/data/generated/titles.json";

export interface Title {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const TITLES: Title[] = titlesData as Title[];
