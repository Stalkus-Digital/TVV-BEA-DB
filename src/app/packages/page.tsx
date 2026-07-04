import { PackageTable } from "@/components/packages/PackageTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all standard and dynamically built travel packages.</p>
        </div>
        <Link 
          href="/packages/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Package
        </Link>
      </div>
      <PackageTable />
    </div>
  );
}
