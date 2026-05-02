import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function SplatoonPage() {
  const t = TITLES.find((x) => x.slug === "splatoon")!;
  return (
    <div className="min-h-screen">
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
