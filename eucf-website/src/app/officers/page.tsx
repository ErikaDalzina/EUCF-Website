import OfficersCarousel from "@/components/OfficersCarousel";
import type { Officer } from "@/components/OfficerCard";
import officersData from "@/data/generated/officers.json";

const officers: Officer[] = officersData as Officer[];

export default function Officers() {
  return (
    <div className="pb-20">
      <h1 className="font-heading text-6xl font-semibold text-heading text-center">
        Officers
      </h1>
      <p className="text-xl text-zinc-900 text-center max-w-5xl mx-auto px-8 pt-4 pb-10">
        Meet the leaders behind EUCF. Our officers dedicate their time to growing UCF’s 
        Esports scene through competition, collaboration, and community on and off campus, 
        creating opportunities for students to connect and level up together.
      </p>
      <OfficersCarousel officers={officers} />
    </div>
  );
}
