/** `const done = startTimer(); ...; const elapsedMs = done();` — used to time each module's health check individually (health-registry's own `runAll()` doesn't expose per-check duration). */
export function startTimer(): () => number {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start) / 1_000_000;
}
