import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { generateMetadata, generateStaticParams } from "@/app/titles/[slug]/page";
import { SITE_URL } from "@/lib/site";
import { TITLES } from "@/data/titles";

describe("sitemap", () => {
  it("lists the site root, static routes, and one entry per title", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(SITE_URL);
    for (const path of ["/about", "/connect", "/officers", "/sponsors", "/titles"]) {
      expect(urls).toContain(`${SITE_URL}${path}`);
    }
    for (const t of TITLES) {
      expect(urls).toContain(`${SITE_URL}/titles/${t.slug}`);
    }
    expect(urls).toHaveLength(6 + TITLES.length);
  });
});

describe("robots", () => {
  it("allows everything and points at the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});

describe("title pages", () => {
  it("generates one static param per title", () => {
    expect(generateStaticParams()).toEqual(TITLES.map((t) => ({ slug: t.slug })));
  });

  it("derives page metadata from the title record", async () => {
    const t = TITLES[0];
    const meta = await generateMetadata({ params: Promise.resolve({ slug: t.slug }) });
    expect(meta).toEqual({ title: t.name, description: t.description });
  });

  it("returns empty metadata for unknown slugs", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "no-such-game" }) });
    expect(meta).toEqual({ title: undefined, description: undefined });
  });
});
