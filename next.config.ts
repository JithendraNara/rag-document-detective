import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack by using webpack
  experimental: {
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
