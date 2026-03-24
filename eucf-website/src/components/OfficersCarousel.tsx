"use client";

import { useState } from "react";
import OfficerCard from "./OfficerCard";
import type { Officer } from "./OfficerCard";

const officers: Officer[] = [
  { name: "Gavin Groth", position: "President", image: "/knighto.png" },
  { name: "Yasser Ouazran", position: "Vice President", image: "/knighto.png" },
  { name: "Aleksandra Hila", position: "Treasurer", image: "/knighto.png" },
  { name: "Grady Roberts", position: "General Manager", image: "/knighto.png" },
  { name: "Serena Tranchino", position: "Event Coordinator", image: "/knighto.png" },
  { name: "Isabella Marrero", position: "Marketing Director", image: "/knighto.png" },
  { name: "Andrea Herrera", position: "Content Coordinator", image: "/andrea.jpg" },
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
