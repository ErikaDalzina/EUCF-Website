import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function ApexLegendsPage() {
  const t = TITLES.find((x) => x.slug === "apex-legends")!;
  return (
    <div className="min-h-screen">
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
