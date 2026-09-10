import Image from "next/image";
import Link from "next/link";

interface RosterComingSoonProps {
  gameName: string;
  icon: string;
}

export default function RosterComingSoon({ gameName, icon }: RosterComingSoonProps) {
  return (
    <section aria-labelledby="roster-coming-soon" className="mx-auto max-w-xl">
      <div
        className="flex flex-col items-center text-center border-2 border-black rounded-lg bg-white
                   px-6 py-10 md:px-10 md:py-12"
      >
        <div className="relative w-full max-w-65 h-28">
          <Image
            src={icon}
            alt=""
            fill
            sizes="260px"
            className="object-contain"
          />
        </div>

        <span aria-hidden="true" className="mt-6 h-0.75 w-12 bg-gold-deep" />

        <h2
          id="roster-coming-soon"
          className="mt-6 font-heading text-3xl md:text-4xl font-semibold text-heading"
        >
          Roster coming soon!
        </h2>

        <p className="mt-4 text-lg text-zinc-700 text-pretty">
          We&rsquo;re still finalizing the {gameName} lineup. Check back soon to meet the team.
        </p>

        <Link
          href="/titles"
          className="mt-8 rounded-lg border-2 border-black px-6 py-3 text-lg font-semibold text-heading
                     transition-transform duration-300 hover:scale-105"
        >
          Browse other titles
        </Link>
      </div>
    </section>
  );
}
