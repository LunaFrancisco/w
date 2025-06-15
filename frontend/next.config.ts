import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip linting during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Basic configuration
  trailingSlash: true,
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
