import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function LeagueOfLegendsPage() {
  const t = TITLES.find((x) => x.slug === "league-of-legends")!;
  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
