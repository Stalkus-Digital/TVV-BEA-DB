#!/usr/bin/env node
/**
 * Confirms the frontend can reach the local monolith API (USE_MOCK=false setup).
 * Run while API is on :5001. Usage: npm run verify:local
 */

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

const checks = [
  { name: "health", url: `${API.replace(/\/api\/?$/, "")}/api/health` },
  { name: "packages", url: `${API}/v1/packages` },
  { name: "destinations", url: `${API}/v1/destinations` },
  { name: "guides", url: `${API}/v1/guides?limit=1` },
  { name: "reviews", url: `${API}/v1/reviews` },
];

let failed = 0;

for (const { name, url } of checks) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const json = await res.json().catch(() => ({}));
    const ok = res.ok && json.success !== false;
    const extra =
      name === "packages" && json.data?.data
        ? ` (${json.data.data.length} packages)`
        : name === "destinations" && Array.isArray(json.data)
          ? ` (${json.data.length} destinations)`
          : "";
    console.log(ok ? `✓ ${name}${extra}` : `✗ ${name} HTTP ${res.status}`);
    if (!ok) failed++;
  } catch (err) {
    console.log(`✗ ${name} — ${err.message}`);
    failed++;
  }
}

if (failed) {
  console.log("\nStart the API: cd Tvv\\ bE/vacation-voice-source-main/api && npm run dev");
  process.exit(1);
}

console.log("\nAPI OK. Frontend should use:");
console.log("  NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api");
console.log("  NEXT_PUBLIC_USE_MOCK=false");
console.log("Then: npm run dev  →  http://localhost:3001");
