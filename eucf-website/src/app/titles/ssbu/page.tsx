import TitleHeader from "@/components/TitleHeader";
import { TITLES } from "@/data/titles";

export default function SSBUPage() {
  const t = TITLES.find((x) => x.slug === "ssbu")!;
  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
    </div>
  );
}
