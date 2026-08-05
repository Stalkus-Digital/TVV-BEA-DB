"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Square, RefreshCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";

export default function TripJackSyncSettings() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await adminApiClient.get<any>("/api/admin/integrations/tripjack/sync/status");
      // adminApiClient automatically unwraps 'data' if the response was standard envelope format
      // But the API route returns { success: true, data: status } manually. 
      // adminApiClient strips `{ data }` envelope from `{ success: true, data: ... }` if standard, 
      // let's safely check if data has a nested data property or is the object directly.
      setStatus(data?.data || data);
    } catch (err: any) {
      setError(err.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, executionId?: string) => {
    setActionLoading(true);
    try {
      await adminApiClient.post("/api/admin/integrations/tripjack/sync", { action, executionId });
      await fetchStatus();
    } catch (err: any) {
      alert("Action failed: " + (err.message || "Network error"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">TripJack Integration Settings</h1>
        <p className="text-slate-500">
          Manage your live connection to TripJack and synchronize the global hotel catalog into your local database.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hotel Catalog Sync Engine</h2>
            <p className="text-sm text-slate-500 mt-1">Downloads metadata for thousands of global hotels securely.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!status?.execution || status.execution.status === "COMPLETED" ? (
              <button 
                onClick={() => handleAction("START")}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Start New Sync
              </button>
            ) : null}

            {status?.execution?.status === "RUNNING" && (
              <button 
                onClick={() => handleAction("PAUSE")}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}

            {(status?.execution?.status === "PAUSED" || status?.execution?.status === "FAILED") && (
              <button 
                onClick={() => handleAction("RESUME", status.execution.executionId)}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                <RefreshCcw className="w-4 h-4" /> Resume Failed Sync
              </button>
            )}

            {(status?.execution?.status === "RUNNING" || status?.execution?.status === "PAUSED") && (
              <button 
                onClick={() => handleAction("STOP")}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCcw className="w-5 h-5 animate-spin" /> Fetching status...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-bold">Error loading sync engine</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : !status ? (
             <div className="text-center py-8 text-slate-500">
                <p>No active or previous syncs found. Start a new sync to begin populating the catalog.</p>
             </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Current Stage</span>
                    <span className="text-xl font-bold text-slate-900">{status.execution.currentStage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Status</span>
                    {status.execution.status === "RUNNING" && <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold animate-pulse">Running</span>}
                    {status.execution.status === "PAUSED" && <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">Paused</span>}
                    {status.execution.status === "COMPLETED" && <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Completed</span>}
                    {status.execution.status === "FAILED" && <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">Failed</span>}
                  </div>
               </div>

               <div>
                 <div className="flex items-center justify-between text-sm font-medium text-slate-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{status.execution.progress.toFixed(2)}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${status.execution.status === 'FAILED' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(100, Math.max(0, status.execution.progress))}%` }} 
                    />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="block text-xl font-bold text-slate-900">{status.execution.processedCountries.toLocaleString()}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Countries</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="block text-xl font-bold text-slate-900">{status.execution.processedCities.toLocaleString()}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cities</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="block text-xl font-bold text-slate-900">{status.execution.processedHotels.toLocaleString()}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hotels</span>
                 </div>
               </div>
               
               {status.execution.errorDetails && (
                 <div className="p-4 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-3 mt-4 text-sm">
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p>{status.execution.errorDetails}</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
