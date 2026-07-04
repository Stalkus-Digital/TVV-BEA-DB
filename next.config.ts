import type { NextConfig } from "next";

/**
 * nodeMiddleware is required to opt src/middleware.ts into the full
 * Node.js runtime instead of the default Edge runtime — necessary because
 * the Auth module's JWT/password-hashing logic uses node:crypto, which the
 * Edge runtime's bundler cannot resolve (verified: build failed with
 * "UnhandledSchemeError: node:crypto" before this flag was added).
 */
// `nodeMiddleware` is a real, working experimental flag (confirmed via `next build`'s
// own "Experiments (use with caution): ✓ nodeMiddleware" output) that this Next.js
// version's TypeScript types haven't caught up to yet — hence the cast.
const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  } as NextConfig["experimental"],
};

export default nextConfig;
