"use client";

export function StatusIndicator({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: string; pulse: boolean }> = {
    CONNECTED: { color: "bg-emerald-500", icon: "●", pulse: false },
    CONFIGURED: { color: "bg-blue-500", icon: "●", pulse: false },
    NOT_CONFIGURED: { color: "bg-slate-400", icon: "●", pulse: false },
    FAILED: { color: "bg-red-500", icon: "●", pulse: false },
    TESTING: { color: "bg-amber-500", icon: "●", pulse: true },
    DISABLED: { color: "bg-slate-400", icon: "●", pulse: false },
    AUTHENTICATION_FAILED: { color: "bg-red-500", icon: "●", pulse: false },
    RATE_LIMITED: { color: "bg-orange-500", icon: "●", pulse: false },
    SERVICE_UNAVAILABLE: { color: "bg-red-500", icon: "●", pulse: false },
    WARNING: { color: "bg-yellow-500", icon: "●", pulse: false },
    UNKNOWN: { color: "bg-slate-400", icon: "●", pulse: false },
  };

  const c = config[status] || config.UNKNOWN;

  return (
    <span className={`inline-flex items-center ${c.pulse ? "animate-pulse" : ""}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${c.color}`} />
    </span>
  );
}
