import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Links werden aus Kunden-Slugs zusammengesetzt, daher keine statisch
  // typisierten Routen.
  typedRoutes: false,
  // Eigenständiger Server für den Betrieb im Container (Coolify).
  output: "standalone",
};

export default nextConfig;
