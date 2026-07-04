export interface SlowQueryEntry {
  query: string;
  durationMs: number;
  timestamp: string;
  isSlow: boolean;
}
