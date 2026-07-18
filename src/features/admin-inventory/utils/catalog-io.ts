export async function downloadCatalogExport(filters: {
  kind?: string;
  destinationId?: string;
  status?: string;
  search?: string;
}): Promise<void> {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.destinationId) params.set("destinationId", filters.destinationId);
  if (filters.status) params.set("status", filters.status);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  const qs = params.toString();
  const res = await fetch(`/api/admin/inventory/export${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    let message = "Export failed";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `tvv-catalog-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
