import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "@/shared/logger/console-logger";

describe("ConsoleLogger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits structured JSON with timestamp, level, scope, and message", () => {
    const logger = new ConsoleLogger({ scope: "test.scope" });
    logger.info("hello", { extra: 1 });

    expect(logSpy).toHaveBeenCalledOnce();
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry).toMatchObject({ level: "info", scope: "test.scope", message: "hello", meta: { extra: 1 } });
    expect(entry.timestamp).toEqual(expect.any(String));
  });

  it("routes warn to console.warn and error to console.error, everything else to console.log", () => {
    const logger = new ConsoleLogger({ scope: "s" });
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");

    expect(logSpy).toHaveBeenCalledTimes(2); // debug + info
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("suppresses levels below minLevel", () => {
    const logger = new ConsoleLogger({ scope: "s", minLevel: "warn" });
    logger.debug("suppressed");
    logger.info("suppressed");
    logger.warn("kept");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("omits the meta key entirely when no meta is passed, rather than logging meta: undefined", () => {
    const logger = new ConsoleLogger({ scope: "s" });
    logger.info("no meta");
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry).not.toHaveProperty("meta");
  });
});
