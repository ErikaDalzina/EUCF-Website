import Image from "next/image";
import { ABOUT_SECTIONS } from "@/data/about";

export default function About() {
  return (
    <div>
      <h1 className="font-heading text-5xl md:text-6xl font-semibold text-heading text-center">
        About Us
      </h1>

      <div className="mx-auto max-w-6xl px-6 md:px-16 pt-10 pb-20 space-y-16">
        {ABOUT_SECTIONS.map((section) => (
          <section
            key={section.title}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-heading mb-4 text-center">
                {section.title}
              </h2>
              <p className="text-lg text-zinc-900 whitespace-pre-line">{section.description}</p>
            </div>

            <div className="relative w-full aspect-4/3">
              <Image
                src={section.image}
                alt={section.imageAlt}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
