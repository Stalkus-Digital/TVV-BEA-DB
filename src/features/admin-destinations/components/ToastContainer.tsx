"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { subscribeToToasts, subscribeToDismiss } from "../hooks/useToast";
import type { ToastType } from "../hooks/useToast";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  error: <XCircle className="w-5 h-5 text-red-600" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
};

const bgMap: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const textMap: Record<ToastType, string> = {
  success: "text-emerald-900",
  error: "text-red-900",
  warning: "text-amber-900",
  info: "text-blue-900",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribeAdd = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    const unsubscribeDismiss = subscribeToDismiss((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      unsubscribeAdd();
      unsubscribeDismiss();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${bgMap[toast.type]} animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${textMap[toast.type]}`}>{toast.title}</p>
            {toast.message && (
              <p className={`text-xs mt-1 ${textMap[toast.type]} opacity-90`}>{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
