"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/features/admin-auth/store/session";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { BACKEND_GAPS, UPLOAD_CATEGORIES } from "../constants";
import { useDeleteMediaMutation, useUploadMediaMutation } from "../hooks/useCmsMutations";
import { formatBytes, formatDate } from "../utils";
import { CmsPageShell } from "./CmsPageShell";
import type { StorageCategory } from "../types";
import { adminApiClient } from "@/lib/admin-api/client";

export function MediaBrowserPage() {
  const { user } = useAdminAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<StorageCategory>("GALLERY_IMAGE");
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const [fileToDelete, setFileToDelete] = useState<{ key: string, category: StorageCategory } | null>(null);

  const uploadsQuery = useQuery({
    queryKey: adminQueryKeys.cms.uploads,
    queryFn: async () => {
      const res = await adminApiClient.get<{ items: any[] }>("/api/storage/list");
      return res?.items ?? [];
    },
    staleTime: 0,
  });

  const uploads = uploadsQuery.data ?? [];

  async function handleUpload(file: File) {
    if (!user?.id) {
      setError("You must be signed in to upload files");
      return;
    }
    setError(null);
    try {
      await uploadMutation.mutateAsync({ file, category, ownerId: user.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleDelete() {
    if (!user?.id || !fileToDelete) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync({ key: fileToDelete.key, category: fileToDelete.category, ownerId: user.id });
      setFileToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <CmsPageShell
      title="Media Browser"
      description="Upload, browse, and manage media assets for the website."
      isRefreshing={uploadMutation.isPending || deleteMutation.isPending}
      onRefresh={() => uploadsQuery.refetch()}
    >

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-6 space-y-4">
        <h3 className="font-semibold">Upload file</h3>
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
            <span className="text-xs text-muted-foreground mt-1 block">
              {UPLOAD_CATEGORIES.find((c) => c.value === category)?.description}
            </span>
          </label>
          <div className="flex items-end">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
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

      <div className="rounded-xl border border-border overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h3 className="font-semibold text-sm">Media Library</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Preview</th>
              <th className="text-left px-4 py-3 font-medium">Key</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Size</th>
              <th className="text-left px-4 py-3 font-medium">Uploaded</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((item) => (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  {item.contentType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="h-10 w-10 object-cover rounded border border-border" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{item.contentType}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">{item.key}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                <td className="px-4 py-3">{formatBytes(item.sizeBytes || item.size || 0)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt || item.uploadedAt)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(item.url)}
                    className="text-xs text-primary hover:underline"
                  >
                    Copy URL
                  </button>
                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={() => setFileToDelete({ key: item.key, category: item.category })}
                        className="text-destructive hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                </td>
              </tr>
            ))}
            {uploads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No uploads yet — upload a file to see it here
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {fileToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setFileToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete File</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this file from storage?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFileToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}
