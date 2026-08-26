import aboutData from "@/data/generated/about.json";

export interface AboutSection {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  /**
   * Kicker above the heading, from the `eyebrow` column in Airtable. Optional
   * because the column is allowed to be blank a pillar with no kicker just
   * renders without one.
   */
  eyebrow?: string;
  /** Chips under the description. Presentation-only, set in TAGS below. */
  tags?: string[];
}

/** The fields scripts/sync-airtable.ts writes. `eyebrow` is "" when unset. */
type GeneratedAboutSection = {
  title: string;
  eyebrow?: string;
  description: string;
  image: string;
  imageAlt: string;
};

/**
 * Tag chips stay in code rather than Airtable: they are a list in a table where
 * every other About field is a single string, so a text column would mean
 * teaching editors a comma-splitting convention for one cell. They are also
 * sized to fit a row design, not information. Move them to an Airtable
 * *multi-select* (which returns a real array) if they ever need editing often.
 *
 * Keyed by normalized title so casing/article drift doesn't detach them.
 */
const TAGS: Record<string, string[]> = {
  compete: ["Tactical FPS", "Hero Shooter", "MOBA", "Battle Royale", "Fighting", "Rocket League"],
};

/** Airtable title -> TAGS key. Exported for tests. */
export function presentationKey(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ABOUT_SECTIONS: AboutSection[] = (aboutData as GeneratedAboutSection[]).map(
  (section) => {
    const tags = TAGS[presentationKey(section.title)];
    return {
      ...section,
      title: section.title.trim(),
      // Collapse "" to undefined so the component's `section.eyebrow &&` guard
      // doesn't render an empty kicker element.
      eyebrow: section.eyebrow?.trim() || undefined,
      ...(tags ? { tags } : {}),
    };
  }
);
