import { Fragment } from "react";
import { notFound } from "next/navigation";
import TitleHeader from "@/components/TitleHeader";
import TeamRoster from "@/components/TeamRoster";
import { TITLES } from "@/data/titles";
import { rosterFor } from "@/data/rosters";

export const dynamicParams = false;

export function generateStaticParams() {
  return TITLES.map((t) => ({ slug: t.slug }));
}

interface TitlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TitlePageProps) {
  const { slug } = await params;
  const t = TITLES.find((x) => x.slug === slug);
  return { title: t?.name, description: t?.description };
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const t = TITLES.find((x) => x.slug === slug);
  if (!t) notFound();

  const roster = rosterFor(slug);

  return (
    <div>
      <TitleHeader title={t.name} description={t.description} />
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-12 space-y-16">
        {roster.length === 0 && (
          <p className="text-center text-lg text-zinc-600">
            Roster coming soon — check back later!
          </p>
        )}
        {roster.map((team, i) => (
          <Fragment key={team.label}>
            {i > 0 && <hr className="border-t border-zinc-300" />}
            <TeamRoster
              team={team}
              gameName={t.name}
              priorityMainRow={i === 0}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
