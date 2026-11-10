import type { NextConfig } from "next";

const backendOrigin = (
  process.env.EFFECOM_BACKEND_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://effecom-backend.onrender.com"
    : "http://localhost:8000")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*/`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
