"use client";

import Image from "next/image";
import { useState } from "react";

export interface Officer {
  name: string;
  position: string;
  image: string;
  isActive?: boolean;
  onTap?: () => void;
  hidden?: boolean;
  priority?: boolean;
}

export default function OfficerCard({ name, position, image, isActive, onTap, hidden, priority }: Officer) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onTap}
      aria-pressed={!!isActive}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`shrink-0 relative w-65 sm:w-85 md:w-100 aspect-3/4 bg-neutral-900 transition-transform duration-300 hover:scale-105 border-2
                  hover:border-black rounded-lg overflow-hidden text-left p-0
                  ${isActive ? "scale-105 border-black" : "border-transparent"}`}
    >
      <Image
        src={image}
        alt={`${name}, ${position} of EUCF`}
        fill
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/85 text-white p-3">
        <p className="text-sm font-bold uppercase tracking-wide text-[#B49758]">
          {position}
        </p>
        <p className="text-lg font-semibold">{name}</p>
      </div>
    </button>
  );
}
