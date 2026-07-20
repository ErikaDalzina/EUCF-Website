/**
 * Post-sync content validation: checks the objects about to be written to
 * src/data/generated/*.json. Airtable-webhook rebuilds never run CI, so this
 * is the only automated gate on content — sync-airtable.ts exits non-zero on
 * errors, failing the Cloudflare Pages build and keeping the last good deploy
 * live instead of publishing a broken site.
 */
import type { Team } from "./transforms";

type TitleOut = { name: string; slug: string; icon: string; description: string };
type OfficerOut = { name: string; position: string; image: string };
type SponsorOut = { name: string; logo: string; website: string };
type StoryOut = { title: string; body: string; href: string; imageSrc: string; imageAlt: string };

export type GeneratedContent = {
  titles: TitleOut[];
  officers: OfficerOut[];
  sponsors: SponsorOut[];
  featuredstory: StoryOut[];
  players: Record<string, Team[]>;
};

// Everything ends up in src/href attributes of the static export; only https
// URLs and site-relative public/ paths are safe.
const isSafeUrl = (v: string): boolean => v.startsWith("https://") || v.startsWith("/");

export function validateContent(c: GeneratedContent): string[] {
  const errors: string[] = [];

  // An empty titles table almost certainly means a broken view/table rename,
  // not intentionally empty content — the whole site hangs off it.
  if (c.titles.length === 0) {
    errors.push(`titles: no records — check the Airtable table/view before deploying.`);
  }

  const slugs = new Set<string>();
  c.titles.forEach((t, i) => {
    const at = `titles[${i}]${t.name ? ` ("${t.name}")` : ""}`;
    if (!t.name) errors.push(`${at}: empty name.`);
    if (!t.slug) errors.push(`${at}: empty slug.`);
    if (t.slug && slugs.has(t.slug)) errors.push(`${at}: duplicate slug "${t.slug}".`);
    if (t.slug) slugs.add(t.slug);
    if (!isSafeUrl(t.icon)) errors.push(`${at}: icon "${t.icon}" is not https or site-relative.`);
  });

  c.officers.forEach((o, i) => {
    const at = `officers[${i}]${o.name ? ` ("${o.name}")` : ""}`;
    if (!o.name) errors.push(`${at}: empty name.`);
    if (!isSafeUrl(o.image)) errors.push(`${at}: image "${o.image}" is not https or site-relative.`);
  });

  c.sponsors.forEach((s, i) => {
    const at = `sponsors[${i}]${s.name ? ` ("${s.name}")` : ""}`;
    if (!s.name) errors.push(`${at}: empty name.`);
    if (!isSafeUrl(s.logo)) errors.push(`${at}: logo "${s.logo}" is not https or site-relative.`);
    if (s.website && !s.website.startsWith("https://")) {
      errors.push(`${at}: website "${s.website}" is not https.`);
    }
  });

  c.featuredstory.forEach((s, i) => {
    const at = `featuredstory[${i}]${s.title ? ` ("${s.title}")` : ""}`;
    if (!s.title) errors.push(`${at}: empty title.`);
    if (!isSafeUrl(s.imageSrc)) {
      errors.push(`${at}: imageSrc "${s.imageSrc}" is not https or site-relative.`);
    }
    if (s.href && !s.href.startsWith("https://")) errors.push(`${at}: href "${s.href}" is not https.`);
  });

  for (const [slug, teams] of Object.entries(c.players)) {
    if (!slugs.has(slug)) {
      errors.push(`players["${slug}"]: no matching title slug — check the team→title links.`);
    }
    teams.forEach((team, i) => {
      const at = `players["${slug}"][${i}]`;
      if (!team.label) errors.push(`${at}: empty team label.`);
      [...team.main, ...team.subs].forEach((p, j) => {
        if (!p.ign) errors.push(`${at} player[${j}]: empty ign.`);
        if (!isSafeUrl(p.image)) {
          errors.push(`${at} player[${j}]${p.ign ? ` ("${p.ign}")` : ""}: image "${p.image}" is not https or site-relative.`);
        }
      });
    });
  }

  return errors;
}
