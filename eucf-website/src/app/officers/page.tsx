import OfficersCarousel from "@/components/OfficersCarousel";
import TitleHeader from "@/components/TitleHeader";
import type { Officer } from "@/components/OfficerCard";
import officersData from "@/data/generated/officers.json";

const officers: Officer[] = officersData as Officer[];

export default function Officers() {
  return (
    <div className="pb-20">
      <TitleHeader
        title="Officers"
        description="Meet the leaders behind EUCF. Our officers dedicate their time to growing UCF’s Esports scene through competition, collaboration, and community on and off campus, creating opportunities for students to connect and level up together."
      />
      <OfficersCarousel officers={officers} />
    </div>
  );
}
