import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";
import { PATTERNS } from "@/features/algorithms";

/**
 * Every page that search engines may list. Pages marked `robots: noindex` (/resume, /dating,
 * /native, /ai-workflow, /hide-pages) are left out on purpose: a sitemap is a list of pages we want
 * indexed. When a page becomes indexable, add its path here.
 */
const PATHS = [
  "/",
  "/products",
  "/custom-resume",
  "/ielts",
  "/design-system",
  "/algo-lab",
  "/algorithms",
  "/bloom-pool",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...PATHS, ...PATTERNS.map((p) => `/algorithms/${p.slug}`)];
  return paths.map((path) => ({
    url: new URL(path, SITE.origin).toString(),
    priority: path === "/" ? 1 : path === "/products" ? 0.9 : 0.7,
  }));
}
