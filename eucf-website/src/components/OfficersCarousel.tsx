import OfficerCard from "./OfficerCard";
import type { Officer } from "./OfficerCard";

const officers: Officer[] = [
  { name: "John Doe", position: "President", image: "/knighto.png" },
  { name: "Jane Smith", position: "Vice President", image: "/knighto.png" },
  { name: "Alex Johnson", position: "Treasurer", image: "/knighto.png" },
  { name: "Sam Williams", position: "Secretary", image: "/knighto.png" },
  { name: "Chris Brown", position: "Event Coordinator", image: "/knighto.png" },
  { name: "Taylor Davis", position: "Social Media Manager", image: "/knighto.png" },
];

export default function OfficersCarousel() {
  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-8 sm:gap-10 py-6 animate-scroll-left has-[:hover]:[animation-play-state:paused]">
        {[...officers, ...officers].map((officer, i) => (
          <OfficerCard key={i} {...officer} />
        ))}
      </div>
    </div>
  );
}
