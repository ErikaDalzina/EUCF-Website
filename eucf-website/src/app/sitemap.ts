import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TITLES } from "@/data/titles";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/connect", "/officers", "/sponsors", "/titles"];
  return [
    ...staticRoutes.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...TITLES.map((t) => ({ url: `${SITE_URL}/titles/${t.slug}` })),
  ];
}
