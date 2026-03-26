import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Strip trailing /api/v1 if present so we can append it ourselves
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://insurak-caaab14b31d7.herokuapp.com";
    const backendBase = rawBackendUrl
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/$/, "");
    return [
      {
        source: "/api/v1/users",
        destination: `${backendBase}/api/v1/users/`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${backendBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
