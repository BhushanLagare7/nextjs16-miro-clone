import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/constants/site";

/**
 * Generates the robots.txt configuration for search engine crawlers.
 *
 * @returns {MetadataRoute.Robots} Robots rule configuration.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
