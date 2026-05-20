"use client";

import Image from "next/image";
import { useState } from "react";
import type { Player } from "@/types/roster";

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  gameName?: string;
  priority?: boolean;
}

export default function PlayerCard({ player, onClick, gameName, priority }: PlayerCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center text-left p-0 bg-transparent border-0 cursor-pointer"
      aria-label={`Open details for ${player.ign}`}
    >
      <div
        className="relative w-full aspect-3/4 bg-neutral-900 rounded-lg overflow-hidden border-2 border-transparent
                   transition-transform duration-300 group-hover:scale-105 group-hover:border-black
                   group-focus-visible:scale-105 group-focus-visible:border-black"
      >
        <Image
          src={player.image}
          alt={`${player.ign}, EUCF${gameName ? ` ${gameName}` : ""} player`}
          fill
          priority={priority}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          sizes="(min-width: 768px) 30vw, (min-width: 640px) 45vw, 90vw"
        />
      </div>
      <div className="mt-3 w-full text-left">
        <p className="text-lg font-semibold text-zinc-900 leading-tight">{player.ign}</p>
        {player.role && (
          <p className="text-sm font-semibold uppercase tracking-wide text-[#B49758] mt-0.5">
            {player.role}
          </p>
        )}
      </div>
    </button>
  );
}
