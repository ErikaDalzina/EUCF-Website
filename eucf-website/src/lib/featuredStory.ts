export type FeaturedStory = {
  title: string;
  body: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  linkLabel?: string;
};

export async function getFeaturedStory(): Promise<FeaturedStory> {
  return {
    title: "Placeholder headline goes here",
    body: "Short paragraph describing the event, news item, or update. This text will be swapped per post but the layout and styling stay the same.",
    href: "https://example.com",
    imageSrc: "/knighto.png",
    imageAlt: "UCF Knighto mascot",
  };
}
