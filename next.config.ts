import type { NextConfig } from "next";

/**
 * Node.js middleware is opted in via `export const config = { runtime: "nodejs" }`
 * in src/middleware.ts (stable since Next.js 15.5). That is required because
 * JwtService uses node:crypto, which the Edge runtime cannot resolve.
 *
 * Do not set experimental.nodeMiddleware here — it was removed from the
 * ExperimentalConfig types once the feature stabilized and fails `next build`.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
