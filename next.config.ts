import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sprofile.line-scdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
