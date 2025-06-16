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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Basic configuration
  trailingSlash: true,
  staticPageGenerationTimeout: 60,
  // Configure Prisma compatibility
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
};

export default nextConfig;
