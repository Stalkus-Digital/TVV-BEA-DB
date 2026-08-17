"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { archivePackage, unpublishPackage, restorePackage } from "../api/packages";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { ToastContainer } from "@/features/admin-destinations/components/ToastContainer";
import { useToast } from "@/features/admin-destinations/hooks/useToast";
import { PackageDetailDrawer } from "./PackageDetailDrawer";
import { PackageFiltersBar } from "./PackageFiltersBar";
import { PackagesGrid } from "./PackagesGrid";
import { usePackagesQueryState } from "../hooks/usePackagesQuery";
import type { PackageListFilters } from "../types";

export function PackagesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<PackageListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);
  const toast = useToast();

  const queryFilters: PackageListFilters = { ...filters, search: debouncedSearch };
  const packagesQuery = usePackagesQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => archivePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restorePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/packages/new?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Archive this package? It is hidden from the website and can be restored later.")) {
      setIsDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Package archived", "Open it from the list to restore.");
      } catch (error) {
        toast.error("Archive failed", error instanceof Error ? error.message : undefined);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const handleHide = async (id: string) => {
    if (window.confirm("Unpublish this package? It will revert to Draft status and be hidden from the website.")) {
      setIsUpdatingId(id);
      try {
        await unpublishMutation.mutateAsync(id);
        toast.success("Package hidden", "It has been reverted to draft status.");
      } catch (error) {
        toast.error("Hide failed", error instanceof Error ? error.message : undefined);
      } finally {
        setIsUpdatingId(null);
      }
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Restore this package? It will be moved out of the archive as a Draft.")) {
      setIsUpdatingId(id);
      try {
        await restoreMutation.mutateAsync(id);
        toast.success("Package restored", "It is now back in draft status.");
      } catch (error) {
        toast.error("Restore failed", error instanceof Error ? error.message : undefined);
      } finally {
        setIsUpdatingId(null);
      }
    }
  };

  const handleSelect = (id: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id) {
      next.set("selected", id);
    } else {
      next.delete("selected");
    }
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : pathname || "?", { scroll: false });
    setSelectedId(id);
  };

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all standard and dynamically built travel packages.
          </p>
        </div>
        <PackageFiltersBar
          filters={filters}
          searchInput={searchInput}
          destinations={packagesQuery.destinations}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void packagesQuery.refetch()}
          isRefreshing={packagesQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-slate-50/50 border-t border-border">
        <PackagesGrid
          data={packagesQuery.data}
          isLoading={packagesQuery.isLoading}
          isError={packagesQuery.isError}
          errorMessage={packagesQuery.error instanceof Error ? packagesQuery.error.message : undefined}
          onRetry={() => void packagesQuery.refetch()}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHide={handleHide}
          onRestore={handleRestore}
          isDeleting={isDeletingId}
          isUpdating={isUpdatingId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <PackageDetailDrawer
        packageId={selectedId}
        destinations={packagesQuery.destinations}
        onClose={() => handleSelect(null)}
      />

      <ToastContainer />
    </div>
  );
}
