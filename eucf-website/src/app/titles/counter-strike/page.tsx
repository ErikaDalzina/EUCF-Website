import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function CounterStrikePage() {
  const t = TITLES.find((x) => x.slug === "counter-strike")!;
  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
