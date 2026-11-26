import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

/**
 * Everything is crawlable (a page that should stay out of search results says so with
 * `robots: noindex`, which a crawler can only read if it may fetch the page), and the sitemap is
 * announced here so crawlers find it without Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE.origin).toString(),
  };
}
