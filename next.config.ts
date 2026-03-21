import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://insurak-caaab14b31d7.herokuapp.com";
    const normalizedBackendUrl = rawBackendUrl.endsWith("/api/v1")
      ? rawBackendUrl
      : `${rawBackendUrl.replace(/\/$/, "")}/api/v1`;
    return [
      {
        source: "/api/v1/users",
        destination: `${normalizedBackendUrl}/users/`,
      },
      {
        source: "/api/v1/:path*",
        // If not set, fallback to heroku app. This proxies the request from the NextJS server
        // so the browser does not fail preflight CORS checks.
        destination: `${normalizedBackendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
