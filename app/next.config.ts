import type { NextConfig } from "next";
// @ducanh2912/next-pwa is SWC-compatible (drop-in for next-pwa v5)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default;

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/child\/session$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "child-session-api",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/health$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "health-api",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 1, maxAgeSeconds: 60 },
      },
    },
  ],
})(nextConfig);
