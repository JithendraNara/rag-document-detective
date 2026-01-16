import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack by using webpack
  experimental: {
    turbo: {
      enabled: false,
    },
  },
};

export default nextConfig;
