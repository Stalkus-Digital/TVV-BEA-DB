import type { NextConfig } from "next";

/**
 * Node.js middleware is opted in via `export const config = { runtime: "nodejs" }`
 * in src/middleware.ts (stable since Next.js 15.5). That is required because
 * JwtService uses node:crypto, which the Edge runtime cannot resolve.
 *
 * `experimental.nodeMiddleware` remains enabled for toolchain versions that
 * still gate the nodejs middleware runtime behind this flag.
 */
const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
};

export default nextConfig;
