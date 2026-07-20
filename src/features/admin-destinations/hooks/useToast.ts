"use client";

import { useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Simple toast management - in production, use a proper toast library
const listeners: ((toast: Toast) => void)[] = [];
const dismissListeners: ((id: string) => void)[] = [];

function generateId() {
  return `${Date.now()}-${Math.random()}`;
}

export function useToast() {
  const show = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = generateId();
      const toast: Toast = { id, type, title, message, duration };
      listeners.forEach((listener) => listener(toast));

      if (duration > 0) {
        setTimeout(() => {
          dismissListeners.forEach((listener) => listener(id));
        }, duration);
      }
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => show("success", title, message, 3000),
    [show]
  );

  const error = useCallback(
    (title: string, message?: string) => show("error", title, message, 5000),
    [show]
  );

  const info = useCallback(
    (title: string, message?: string) => show("info", title, message, 4000),
    [show]
  );

  const warning = useCallback(
    (title: string, message?: string) => show("warning", title, message, 4000),
    [show]
  );

  return { show, success, error, info, warning };
}

export function subscribeToToasts(listener: (toast: Toast) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

export function subscribeToDismiss(listener: (id: string) => void) {
  dismissListeners.push(listener);
  return () => {
    const index = dismissListeners.indexOf(listener);
    if (index > -1) dismissListeners.splice(index, 1);
  };
}
