import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function OverwatchPage() {
  const t = TITLES.find((x) => x.slug === "overwatch")!;
  return (
    <div className="min-h-screen">
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
