import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function RainbowSixSiegePage() {
  const t = TITLES.find((x) => x.slug === "rainbow-six-siege")!;
  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
