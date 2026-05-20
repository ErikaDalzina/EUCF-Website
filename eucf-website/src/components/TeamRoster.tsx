"use client";

import { useState } from "react";
import PlayerCard from "./PlayerCard";
import PlayerModal from "./PlayerModal";
import type { Team, Player } from "@/types/roster";

interface TeamRosterProps {
  team: Team;
  gameName?: string;
  priorityMainRow?: boolean;
}

export default function TeamRoster({ team, gameName, priorityMainRow }: TeamRosterProps) {
  const [selected, setSelected] = useState<Player | null>(null);
  const headingId = `team-${team.label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="font-heading text-4xl font-semibold text-heading text-center">
        {team.label}
      </h2>

      <h3 className="mt-8 mb-4 text-sm font-bold uppercase tracking-widest text-[#B49758] text-center">
        Main Roster
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {team.main.map((player, i) => (
          <PlayerCard
            key={`main-${i}`}
            player={player}
            gameName={gameName}
            onClick={() => setSelected(player)}
            priority={priorityMainRow && i < 3}
          />
        ))}
      </div>

      {team.subs.length > 0 && (
        <>
          <h3 className="mt-10 mb-4 text-sm font-bold uppercase tracking-widest text-[#B49758] text-center">
            Substitutes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {team.subs.map((player, i) => (
              <PlayerCard
                key={`sub-${i}`}
                player={player}
                gameName={gameName}
                onClick={() => setSelected(player)}
              />
            ))}
          </div>
        </>
      )}

      <PlayerModal player={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
