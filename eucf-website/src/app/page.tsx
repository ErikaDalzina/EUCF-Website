import Image from "next/image";
import FeaturedStory from "@/components/FeaturedStory";

export default function Home() {
  return (
    <>
    <section
      aria-label="Esports at UCF hero"
      className="relative w-full min-h-[70dvh] -mt-6 overflow-hidden bg-black"
    >
      <Image
        src="/heroImage.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      {/* Scrim. 
          darkening toward the top buys that contrast where the copy sits while the bottom keeps
          the monitors and players vivid.*/}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-black/85 via-black/70 to-black/10"
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-44 md:pt-56 pb-24 md:pb-32">
        <h1 className="font-(family-name:--font-archivo-black) text-5xl md:text-7xl lg:text-8xl text-white tracking-tight">
          Esports at UCF
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-white/90">
          Competitive gaming at the University of Central Florida.
        </p>
      </div>
    </section>
    <FeaturedStory />
    </>
  );
}
