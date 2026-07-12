"use client";

import { X, AlertCircle } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function AlertModal({ isOpen, title = "Alert", message, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button 
        type="button" 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose} 
        aria-label="Close modal" 
      />
      <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 text-destructive rounded-full">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 -mt-1 -mr-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
