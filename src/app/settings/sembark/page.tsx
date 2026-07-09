"use client";

import { useState } from "react";
import { RefreshCw, Server, CheckCircle } from "lucide-react";


export default function SembarkSettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync/sembark", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(data.message || "Sync successful");
      } else {
        setResult(data.error || "Sync failed");
      }
    } catch (e) {
      setResult("Network error during sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sembark Integration</h1>
        <p className="text-muted-foreground mt-1">Manage webhooks and synchronize inventory from your Sembark CRM.</p>
      </div>

      <div className="grid gap-6">
        {/* Webhook Status */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Lead Webhook Active</h3>
              <p className="text-sm text-muted-foreground">Automatically pushing new leads and enquiries to Sembark.</p>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs text-muted-foreground">
            Endpoint: {process.env.NEXT_PUBLIC_SEMBARK_WEBHOOK_URL || "https://api.sembark.com/v1/leads"}
          </div>
        </div>

        {/* Sync Inventory */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Inventory Synchronization</h3>
              <p className="text-sm text-muted-foreground">Pull the latest Destinations, Hotels, and Packages from Sembark into TVV OS.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Synchronizing..." : "Trigger Manual Sync"}
          </button>

          {result && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
