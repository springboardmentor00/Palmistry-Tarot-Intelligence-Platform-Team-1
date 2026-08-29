import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.ENABLE_PYTHON_PROXY === "true") {
      return [
        {
          source: "/api/auth/:path*",
          destination: "http://127.0.0.1:8000/api/auth/:path*",
        },
        {
          source: "/api/consultations/:path*",
          destination: "http://127.0.0.1:8000/api/consultations/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;