import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 CRITICAL FOR DOCKER: Tells Next.js to compile a standalone server
  output: 'standalone',
  
  async rewrites() {
    // Uses the Docker network URL if running in Docker, otherwise uses localhost for local dev
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    
    return [
      {
        // 🚀 Rewrites ALL /api/ paths to your Python backend
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;