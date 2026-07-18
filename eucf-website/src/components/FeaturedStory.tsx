import Image from "next/image";
import { getFeaturedStories } from "@/lib/featuredStory";

export default async function FeaturedStory() {
  const stories = await getFeaturedStories();
  if (stories.length === 0) return null;

  return (
    <section
      aria-label="Featured stories"
      className="w-full bg-white py-20 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 space-y-20 md:space-y-32">
        {stories.map((story, index) => {
          const linkLabel = story.linkLabel ?? "Read the full story!";
          const headingId = `featured-story-heading-${index}`;
          return (
            <div
              key={story.href}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-25 items-center"
            >
              <div>
                <h2
                  id={headingId}
                  className="font-heading text-heading text-4xl sm:text-5xl md:text-5xl font-semibold"
                >
                  {story.title}
                </h2>
                <p className="mt-8 md:mt-10 text-lg sm:text-xl md:text-xl text-zinc-800 leading-relaxed">
                  {story.body}
                </p>
                <a
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${linkLabel}: ${story.title}`}
                  className="mt-8 md:mt-10 inline-block py-2 text-gold-deep font-semibold underline underline-offset-4 hover:no-underline"
                >
                  {linkLabel}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden h-48 md:h-75">
                <Image
                  src={story.imageSrc}
                  alt={story.imageAlt}
                  width={400}
                  height={400}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
