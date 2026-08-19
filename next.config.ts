import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.USE_EXTERNAL_AUTH === 'true') {
      return [
        {
          source: "/api/auth/:path*",
          destination: "http://127.0.0.1:8000/api/auth/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;