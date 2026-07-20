/**
 * SECURITY-002C Task 10: the abstraction only — no vendor is integrated
 * here. Same "define the interface, swap the implementation" principle as
 * `StorageProvider` (providers/storage-provider.ts): a real scanner
 * (ClamAV daemon, VirusTotal API, AWS/GCP malware-scan hooks, etc.) is a
 * future `VirusScanner` implementation wired into `module.ts` in place of
 * `NoopVirusScanner`, with zero change anywhere else — `StorageService`
 * only ever depends on this interface, never a concrete scanner.
 */
export interface VirusScanResult {
  clean: boolean;
  /** Present only when clean is false — never logged verbatim with any scanner-vendor-specific detail beyond a short reason (see storage.service.ts's logging). */
  reason?: string;
}

export interface VirusScanner {
  scan(buffer: Buffer, contentType: string): Promise<VirusScanResult>;
}

/**
 * Default wired in module.ts today — always reports clean. This is a
 * deliberate, visible no-op (not a silent stub): its own health check
 * (StorageModuleHealthCheck in module.ts) flags storage as "degraded" so
 * this is never mistaken for a real scanning guarantee in production.
 */
export class NoopVirusScanner implements VirusScanner {
  async scan(): Promise<VirusScanResult> {
    return { clean: true };
  }
}
