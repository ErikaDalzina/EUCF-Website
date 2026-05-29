import { Fragment } from "react";
import TitleHeader from "@/components/TitleHeader";
import TeamRoster from "@/components/TeamRoster";
import { TITLES } from "@/data/titles";
import { VALORANT_ROSTER } from "@/data/valorant";

export default function ValorantPage() {
  const t = TITLES.find((x) => x.slug === "valorant")!;
  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-12 space-y-16">
        {VALORANT_ROSTER.map((team, i) => (
          <Fragment key={team.label}>
            {i > 0 && <hr className="border-t border-zinc-300" />}
            <TeamRoster
              team={team}
              gameName="Valorant"
              priorityMainRow={i === 0}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
