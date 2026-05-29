import TitleHeader from "@/components/TitleHeader";
import SponsorCard, { SponsorPlaceholderCard } from "@/components/SponsorCard";
import { SPONSORS } from "@/data/sponsors";

export default function Sponsors() {
  const placeholders = 4 - SPONSORS.length;

  return (
    <div>
      <TitleHeader
        title="Sponsors"
        description="Meet the sponsors of Esports at UCF."
      />
      <div className="mx-auto max-w-6xl px-6 md:px-16 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {SPONSORS.map((s) => (
            <SponsorCard
              key={s.name}
              name={s.name}
              logo={s.logo}
              website={s.website}
            />
          ))}
          {Array.from({ length: placeholders }).map((_, i) => (
            <SponsorPlaceholderCard key={`placeholder-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
