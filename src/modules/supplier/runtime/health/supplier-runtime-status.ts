export interface SupplierRuntimeStatus {
  key: string;
  supplierCode: string;
  capability: string;
  circuitState: string;
  successRate: number;
  avgLatencyMs: number;
  totalExecutions: number;
  lastExecutedAt: string | null;
}
