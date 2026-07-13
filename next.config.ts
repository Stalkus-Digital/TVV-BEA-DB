import type { NextConfig } from "next";

/**
 * nodeMiddleware is required to opt src/middleware.ts into the full
 * Node.js runtime instead of the default Edge runtime — necessary because
 * the Auth module's JWT/password-hashing logic uses node:crypto, which the
 * Edge runtime's bundler cannot resolve (verified: build failed with
 * "UnhandledSchemeError: node:crypto" before this flag was added).
 */
const nextConfig: NextConfig = {};

export default nextConfig;
