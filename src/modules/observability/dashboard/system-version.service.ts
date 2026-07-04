import packageJson from "../../../../package.json";
import type { SystemVersionInfo } from "../types/system-version";

const startedAt = new Date().toISOString();

/** `startedAt` is captured at module-load time (process/Fluid Compute instance start), not per-request — `uptimeSeconds` is derived from it on every call. */
export function getSystemVersion(): SystemVersionInfo {
  return {
    name: packageJson.name,
    version: packageJson.version,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV ?? "development",
    startedAt,
    uptimeSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
  };
}
