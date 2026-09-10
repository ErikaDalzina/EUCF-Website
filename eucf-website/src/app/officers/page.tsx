import type { Metadata } from "next";
import OfficersCarousel from "@/components/OfficersCarousel";
import TitleHeader from "@/components/TitleHeader";
import type { Officer } from "@/components/OfficerCard";
import officersData from "@/data/generated/officers.json";

export const metadata: Metadata = {
  title: "Officers",
  description:
    "Meet the officers who lead Esports at UCF and grow the university's " +
    "esports scene through competition, collaboration, and community.",
};

const officers: Officer[] = officersData as Officer[];

export default function Officers() {
  return (
    <div>
      <TitleHeader
        title="Officers"
        description="Meet the leaders behind EUCF. Our officers dedicate their time to growing UCF’s Esports scene through competition, collaboration, and community on and off campus, creating opportunities for students to connect and level up together."
      />
      <div className="mt-11">
        <OfficersCarousel officers={officers} />
      </div>
    </div>
  );
}
