import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icon" },
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
    ];
  },
};

export default nextConfig;
