"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/features/admin-auth/store/session";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  BACKEND_GAPS,
  PRIVATE_STORAGE_CATEGORIES,
  PUBLIC_STORAGE_CATEGORIES,
  UPLOAD_CATEGORIES,
} from "../constants";
import { useSignedUrlMutation, useUploadStorageMutation } from "../hooks/useOperationsMutations";
import { useSystemModulesQuery } from "../hooks/useOperationsQueries";
import { findModule, formatBytes, formatDate, resolveModuleMessage } from "../utils";

import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";
import type { StorageCategory } from "../types";

export function StorageOperationsPage() {
  const { user } = useAdminAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const modulesQuery = useSystemModulesQuery();
  const uploadMutation = useUploadStorageMutation();
  const signedUrlMutation = useSignedUrlMutation();
  const [category, setCategory] = useState<StorageCategory>("GALLERY_IMAGE");
  const [signedCategory, setSignedCategory] = useState<StorageCategory>("INVOICE");
  const [signedKey, setSignedKey] = useState("");
  const [signedOwnerId, setSignedOwnerId] = useState("");
  const [signedResult, setSignedResult] = useState<{ url: string; expiresAt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadsQuery = useQuery({
    queryKey: adminQueryKeys.operations.storageUploads,
    queryFn: async () => {
      const res = await fetch("/api/storage/list");
      if (!res.ok) throw new Error("Failed to fetch storage list");
      const data = await res.json();
      const items = (data.data?.items || data.items || []);
      return items.map((item: any) => ({
        ...item,
        uploadedAt: item.uploadedAt || item.createdAt || new Date().toISOString(),
      })) as import("../types").StorageObject[];
    },
    staleTime: 10000,
  });

  const storageModule = findModule(modulesQuery.data ?? [], "storage");
  const uploads = uploadsQuery.data ?? [];

  async function handleUpload(file: File) {
    if (!user?.id) {
      setError("You must be signed in to upload");
      return;
    }
    setError(null);
    try {
      await uploadMutation.mutateAsync({ file, category, ownerId: user.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleSignedUrl() {
    if (!signedKey || !signedOwnerId) {
      setError("Key and owner ID are required for signed URL");
      return;
    }
    setError(null);
    try {
      const result = await signedUrlMutation.mutateAsync({
        category: signedCategory,
        key: signedKey,
        ownerId: signedOwnerId,
      });
      setSignedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signed URL failed");
    }
  }

  return (
    <OperationsPageShell
      title="Storage"
      description="Manage media assets, documents, and secure signed URLs."
      isLoading={modulesQuery.isLoading}
      isError={modulesQuery.isError}
      errorMessage={modulesQuery.error instanceof Error ? modulesQuery.error.message : undefined}
      isRefreshing={modulesQuery.isFetching || uploadMutation.isPending}
      onRefresh={() => void modulesQuery.refetch()}
      onRetry={() => void modulesQuery.refetch()}
    >


      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2 mt-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Storage health</h3>
          {storageModule ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={storageModule.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Message</dt><dd className="text-right max-w-[60%]">{resolveModuleMessage(storageModule)}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Storage module not registered in this process yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Visibility model</h3>
          <div className="text-sm space-y-3">
            <div>
              <p className="font-medium">Public categories</p>
              <p className="text-muted-foreground text-xs mt-1">{PUBLIC_STORAGE_CATEGORIES.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium">Private categories</p>
              <p className="text-muted-foreground text-xs mt-1">{PRIVATE_STORAGE_CATEGORIES.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6 space-y-4">
        <h3 className="font-semibold">Upload panel</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StorageCategory)}
              className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
            >
              {UPLOAD_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }} />
            <button
              type="button"
              disabled={uploadMutation.isPending || !user?.id}
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading…" : "Choose file & upload"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6 space-y-4">
        <h3 className="font-semibold">Signed URL tester</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input type="text" placeholder="Storage key" value={signedKey} onChange={(e) => setSignedKey(e.target.value)} className="bg-background border border-input rounded-md px-3 py-2 text-sm" />
          <input type="text" placeholder="Owner ID" value={signedOwnerId} onChange={(e) => setSignedOwnerId(e.target.value)} className="bg-background border border-input rounded-md px-3 py-2 text-sm" />
          <select value={signedCategory} onChange={(e) => setSignedCategory(e.target.value as StorageCategory)} className="bg-background border border-input rounded-md px-3 py-2 text-sm">
            {[...PUBLIC_STORAGE_CATEGORIES, ...PRIVATE_STORAGE_CATEGORIES].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button type="button" disabled={signedUrlMutation.isPending} onClick={() => void handleSignedUrl()} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50">
            Generate signed URL
          </button>
        </div>
        {signedResult && (
          <div className="rounded-lg border border-border p-3 text-sm space-y-1">
            <p className="font-mono text-xs break-all">{signedResult.url}</p>
            <p className="text-muted-foreground text-xs">Expires {formatDate(new Date(signedResult.expiresAt * 1000).toISOString())}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h3 className="font-semibold text-sm">Uploads this session</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Key</th>
              <th className="text-left px-4 py-3 font-medium">Visibility</th>
              <th className="text-left px-4 py-3 font-medium">Size</th>
              <th className="text-right px-4 py-3 font-medium">URL</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((item) => (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">{item.key}</td>
                <td className="px-4 py-3">{item.visibility}</td>
                <td className="px-4 py-3">{formatBytes(item.size)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => void navigator.clipboard.writeText(item.url)} className="text-xs text-primary hover:underline">Copy</button>
                </td>
              </tr>
            ))}
            {uploads.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No uploads this session</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </OperationsPageShell>
  );
}
