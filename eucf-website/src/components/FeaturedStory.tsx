import Image from "next/image";
import { getFeaturedStory } from "@/lib/featuredStory";

export default async function FeaturedStory() {
  const story = await getFeaturedStory();
  const linkLabel = story.linkLabel ?? "Read the full story!";

  return (
    <section
      aria-labelledby="featured-story-heading"
      className="w-full bg-white py-20 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-25 items-center">
        <div>
          <h2
            id="featured-story-heading"
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
            className="mt-8 md:mt-10 inline-block py-2 text-[#B49758] font-semibold underline underline-offset-4 hover:no-underline"
          >
            {linkLabel}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt}
            width={400}
            height={400}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
}
