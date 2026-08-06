import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/constants/site";

/**
 * Generates the application sitemap for search engine indexing.
 *
 * @returns {MetadataRoute.Sitemap} Array of sitemap route entries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      images: [`${baseUrl}${SITE_CONFIG.ogImage}`],
    },
  ];
}
