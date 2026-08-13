import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Links werden aus Kunden-Slugs zusammengesetzt, daher keine statisch
  // typisierten Routen.
  typedRoutes: false,
};

export default nextConfig;
