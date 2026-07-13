"use client";

import { useState } from "react";
import { Check, Copy, KeySquare, X } from "lucide-react";
import { useCreateApiKey } from "../hooks/useApiKeys";
import type { ApiKey } from "@/modules/auth/types/api-key";

interface ApiKeyCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyCreateDialog({ open, onClose }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createMutation = useCreateApiKey();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await createMutation.mutateAsync(name);
      setGeneratedKey(res.rawKey);
    } catch (err: any) {
      alert("Failed to create key: " + err.message);
    }
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName("");
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md border border-border shadow-lg rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold flex items-center gap-2">
            <KeySquare className="h-5 w-5 text-primary" />
            {generatedKey ? "Key Generated" : "Create New API Key"}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {generatedKey ? (
            <div className="space-y-4">
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
                <strong>Important:</strong> Copy this key now. You will not be able to see it again after closing this window.
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={generatedKey}
                  className="w-full font-mono text-sm pr-12 rounded-md border border-border bg-muted px-3 py-2"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1.5 p-1 rounded-md hover:bg-background text-muted-foreground transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Integration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name to identify what this key is used for.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? "Generating..." : "Generate Key"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
