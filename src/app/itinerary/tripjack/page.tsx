import { Layers, RefreshCw, CheckCircle, AlertTriangle, Search, Sliders } from "lucide-react";

const MOCK_TRIPJACK_PACKAGES = [
  { id: "TJ-PKG-201", name: "Andaman Family Fiesta (Trip Jack)", days: "5N/6D", syncStatus: "Synced", lastSynced: "2 Hours ago", markup: "10%" },
  { id: "TJ-PKG-202", name: "Maldives Premium Water Villa Special", days: "4N/5D", syncStatus: "Synced", lastSynced: "1 Day ago", markup: "12%" },
  { id: "TJ-PKG-203", name: "Seychelles Adventure Package", days: "6N/7D", syncStatus: "Out of Sync", lastSynced: "3 Days ago", markup: "8%" },
];

export default function TripJackPackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Jack Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Map and sync package feeds, pricing schedules, and live availability via the Trip Jack API integrations.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors">
          <RefreshCw className="h-4 w-4" /> Trigger Global Sync
        </button>
      </div>

      {/* Connection Info */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">API Connection Active</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Connected to Trip Jack Travel Gateway Production API</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className="px-3 py-2 border border-border rounded-lg bg-slate-50/50">
            <span className="text-muted-foreground">API Quota:</span> 48,291 / 100,000 requests
          </div>
          <div className="px-3 py-2 border border-border rounded-lg bg-slate-50/50">
            <span className="text-muted-foreground">Global Markup:</span> +10.0%
          </div>
        </div>
      </div>

      {/* Sync Packages Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search synced packages..."
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Sliders className="h-4 w-4" /> Global Markup Rules
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">TJ Package ID</th>
                <th className="px-6 py-4 font-semibold">Package Name</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Custom Markup</th>
                <th className="px-6 py-4 font-semibold">Last Sync</th>
                <th className="px-6 py-4 font-semibold">Sync Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_TRIPJACK_PACKAGES.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {pkg.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {pkg.days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {pkg.markup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                    {pkg.lastSynced}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${
                      pkg.syncStatus === 'Synced' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pkg.syncStatus === 'Synced' ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Synced
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          Out of Sync
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-primary hover:underline font-semibold text-xs mr-3">Sync Now</button>
                    <button className="text-muted-foreground hover:text-foreground font-semibold text-xs">Edit Rules</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
