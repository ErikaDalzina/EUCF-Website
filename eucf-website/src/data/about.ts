import aboutData from "@/data/generated/about.json";

export interface AboutSection {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const ABOUT_SECTIONS: AboutSection[] = aboutData as AboutSection[];
