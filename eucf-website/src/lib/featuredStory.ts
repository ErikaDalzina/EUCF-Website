import storiesData from "@/data/generated/featuredstory.json";

export type FeaturedStory = {
  title: string;
  body: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  linkLabel?: string;
};

export async function getFeaturedStories(): Promise<FeaturedStory[]> {
  return storiesData as FeaturedStory[];
}
