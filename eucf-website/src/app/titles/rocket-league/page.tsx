import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function RocketLeaguePage() {
  const t = TITLES.find((x) => x.slug === "rocket-league")!;
  return (
    <div className="min-h-screen">
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
