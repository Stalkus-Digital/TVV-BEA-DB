import type { NextConfig } from "next";

/**
 * Node.js middleware is opted in via `export const config = { runtime: "nodejs" }`
 * in src/middleware.ts (stable since Next.js 15.5). That is required because
 * JwtService uses node:crypto, which the Edge runtime cannot resolve.
 *
 * Do not set experimental.nodeMiddleware here — it was removed from the
 * ExperimentalConfig types once the feature stabilized and fails `next build`.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cms.thevacationvoice.com" },
      { protocol: "https", hostname: "**.thevacationvoice.com" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
