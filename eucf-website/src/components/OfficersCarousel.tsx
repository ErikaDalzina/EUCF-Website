"use client";

import { useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleTap = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="overflow-hidden">
      <div className="carousel-track flex w-max gap-8 sm:gap-10 py-6 animate-scroll-left">
        {[...officers, ...officers].map((officer, i) => (
          <OfficerCard
            key={i}
            {...officer}
            isActive={activeIndex === i}
            onTap={() => handleTap(i)}
          />
        ))}
      </div>
    </div>
  );
}
