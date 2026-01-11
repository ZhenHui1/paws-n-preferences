import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/paws-n-preferences",
  images: {
    unoptimized: true,
    remotePatterns: [
      // Whitelisting external image domains
      { protocol: "https", hostname: "cataas.com" },
    ],
  },
};

export default nextConfig;
