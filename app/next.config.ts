import type { NextConfig } from "next";
// @ducanh2912/next-pwa is SWC-compatible (drop-in for next-pwa v5)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default;

// When CANONICAL_REDIRECT_URL is set (Render), bounce all traffic to Vercel.
// This keeps old Render URLs working for existing beta testers.
const CANONICAL_URL = process.env.CANONICAL_REDIRECT_URL;

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  // Next 16 defaults build to Turbopack. Keep an explicit empty config so
  // plugin-added webpack hooks don't fail the build-mode compatibility check.
  turbopack: {},
  ...(CANONICAL_URL
    ? {
        async redirects() {
          return [
            {
              source: "/:path*",
              destination: `${CANONICAL_URL}/:path*`,
              permanent: true,
            },
          ];
        },
      }
    : {}),
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
