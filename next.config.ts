import type { NextConfig } from "next";

/**
 * Next.js blocks dev-only assets (the chunks React hydrates from) for any hostname other than
 * `localhost`. Opening the dev server from a phone on the same Wi-Fi, at http://192.168.x.x:3000,
 * then renders the HTML but never hydrates it, so every button on the page does nothing. These are
 * the private network ranges and Bonjour (`*.local`) names; it only affects `next dev`.
 */
const lanOrigins = [
  "127.0.0.1",
  "*.local",
  "10.*.*.*",
  "192.168.*.*",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: lanOrigins,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the workspace root; a stray lockfile in ~ otherwise confuses root detection.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
