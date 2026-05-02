import TitleHeader from "@/components/TitleHeader";
import TitleCard from "@/components/TitleCard";
import { TITLES } from "@/data/titles";

export default function Titles() {
  return (
    <div className="min-h-screen">
      <TitleHeader
        title="Titles"
        description="Explore the games EUCF competes in. Click any title to meet the team and learn more."
      />
      <div className="mx-auto max-w-6xl px-6 md:px-16 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {TITLES.map((t) => (
            <TitleCard
              key={t.slug}
              name={t.name}
              slug={t.slug}
              icon={t.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
