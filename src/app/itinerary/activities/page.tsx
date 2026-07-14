"use client";

import { useState, useEffect } from "react";
import { Compass, Plus, Search, MapPin, Clock, X, EyeOff, Edit, ImageIcon } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertModal } from "@/components/layout/AlertModal";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { InventoryDetailDrawer } from "@/features/admin-inventory/components/InventoryDetailDrawer";
import Link from "next/link";

interface Activity {
  id: string;
  name: string;
  location: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  status: "ACTIVE" | "INACTIVE";
  destinationId?: string | null;
  image?: string | null;
}

export default function ActivitiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const [searchResults, setSearchResults] = useState<Activity[] | null>(null);
  const [searchParams, setSearchParams] = useState({
    city: "BOM",
    date: new Date().toISOString().split('T')[0]
  });

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: "",
    location: "Havelock Island",
    duration: "2 Hours",
    adultPrice: 1000,
    childPrice: 500,
    status: "ACTIVE",
    destinationId: null,
  });

  const destinationsQuery = useDestinationsQuery();

  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: ["admin", "inventory", "ACTIVITY"],
    queryFn: async () => {
      const res = await adminApiClient.get<any>(adminEndpoints.inventory, { params: { kind: "ACTIVITY", pageSize: 100 } });
      if (!res) return [];
      return res.items.map((item: any) => ({
        id: item.id,
        name: item.title,
        location: item.details?.location || "",
        duration: item.details?.duration || "",
        adultPrice: item.details?.adultPrice || item.details?.starterPrice || 0,
        childPrice: item.details?.childPrice || item.details?.offerPrice || 0,
        status: item.status,
        destinationId: item.destinationId || null,
        image: item.details?.images?.[0] || item.details?.bannerImage?.[0] || null,
        description: item.details?.description || "",
      })) as (Activity & { description?: string })[];
    }
  });

  const activities = inventoryData || [];

  const createMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      const payload = {
        kind: "ACTIVITY",
        title: activity.name,
        status: activity.status,
        destinationId: activity.destinationId || null,
        details: {
          location: activity.location,
          duration: activity.duration,
          adultPrice: activity.adultPrice,
          childPrice: activity.childPrice,
        }
      };
      return adminApiClient.post(adminEndpoints.inventory, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "ACTIVITY"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      const payload = {
        title: activity.name,
        status: activity.status,
        destinationId: activity.destinationId || null,
        details: {
          location: activity.location,
          duration: activity.duration,
          adultPrice: activity.adultPrice,
          childPrice: activity.childPrice,
        }
      };
      return adminApiClient.patch(`${adminEndpoints.inventory}/${activity.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "ACTIVITY"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiClient.delete(`${adminEndpoints.inventory}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "ACTIVITY"] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiClient.patch(`${adminEndpoints.inventory}/${id}`, { status: "ACTIVE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "ACTIVITY"] });
    }
  });

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  const removeActivity = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteId);
      setAlertState({ isOpen: true, message: "Activity deleted successfully" });
      setConfirmDeleteId(null);
    } catch (err) {
      setAlertState({ isOpen: true, message: "Failed to delete activity" });
    }
  };

  const publishActivity = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
      setAlertState({ isOpen: true, message: "Activity published successfully!" });
    } catch (err) {
      setAlertState({ isOpen: true, message: "Failed to publish activity" });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const activity: Activity = {
      id: editingActivityId || "",
      name: newActivity.name || "",
      location: newActivity.location || "",
      duration: newActivity.duration || "1 Hour",
      adultPrice: Number(newActivity.adultPrice) || 0,
      childPrice: Number(newActivity.childPrice) || 0,
      status: newActivity.status as "ACTIVE" | "INACTIVE" || "ACTIVE",
      destinationId: newActivity.destinationId || null,
    };

    if (editingActivityId) {
      await updateMutation.mutateAsync(activity);
    } else {
      await createMutation.mutateAsync(activity);
    }

    setIsModalOpen(false);
    setEditingActivityId(null);

    setNewActivity({
      name: "",
      location: "Havelock Island",
      duration: "2 Hours",
      adultPrice: 1000,
      childPrice: 500,
      status: "ACTIVE",
      destinationId: null,
    });
  };

  const openAddModal = () => {
    setEditingActivityId(null);
    setNewActivity({
      name: "",
      location: "Havelock Island",
      duration: "2 Hours",
      adultPrice: 1000,
      childPrice: 500,
      status: "ACTIVE",
      destinationId: null,
    });
    setIsModalOpen(true);
  };

  const activeCatalogCount = activities.filter(a => a.status === "ACTIVE").length;
  const operatorsCount = new Set(activities.map(a => a.location)).size;

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingLive(true);
    setSearchResults(null);
    try {
      const data = await adminApiClient.post<{ success: boolean; data?: any; error?: any }>('/api/supplier/search', {
        capability: "ACTIVITIES",
        criteria: {
          capability: "ACTIVITIES",
          cityCode: searchParams.city,
          date: searchParams.date
        }
      });
      if (data && data.success && data.data?.results) {
        const mapped: Activity[] = data.data.results.map((res: any) => ({
          id: res.referenceId || `ACT-${Date.now()}`,
          name: res.activityName || "Unknown Activity",
          location: res.location || searchParams.city,
          duration: res.duration || "2 Hours",
          adultPrice: res.adultPrice || 0,
          childPrice: res.childPrice || 0,
          status: "ACTIVE"
        }));
        setSearchResults(mapped);
      } else {
        setAlertState({ isOpen: true, message: data?.error?.message || "Failed to search activities" });
      }
    } catch (err) {
      setAlertState({ isOpen: true, message: "Network error while searching activities" });
    } finally {
      setIsSearchingLive(false);
    }
  };

  const saveLiveActivity = async (activity: Activity) => {
    if (!activities.find(a => a.name === activity.name)) {
      await createMutation.mutateAsync(activity);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activities & Excursions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your excursion catalog, ticket rates, provider payouts, and time-slot limits.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsSearchMode(!isSearchMode);
              setSearchResults(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 font-semibold rounded-md shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            {isSearchMode ? "Back to Managed Activities" : "Live API Search"}
          </button>
          <Link
            href="/inventory/activities/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Activity
          </Link>
        </div>
      </div>

      {isSearchMode ? (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Live Activity Search
            </h2>
            <form onSubmit={handleLiveSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City Code</label>
                <div className="relative">
                  <input required type="text" value={searchParams.city} onChange={e => setSearchParams({ ...searchParams, city: e.target.value.toUpperCase() })} className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-bold uppercase" />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <input required type="date" value={searchParams.date} onChange={e => setSearchParams({ ...searchParams, date: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={isSearchingLive} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50">
                {isSearchingLive ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {searchResults && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                API Results ({searchResults.length} activities found)
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map(activity => {
                  const isSaved = activities.some(a => a.id === activity.id);
                  return (
                    <div key={activity.id} className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-foreground text-lg leading-tight mb-2">{activity.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" /> {activity.location}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <Clock className="h-3 w-3" /> {activity.duration}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Adult Rate</p>
                          <p className="text-xl font-black text-primary">₹{activity.adultPrice.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => saveLiveActivity(activity)}
                          disabled={isSaved}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isSaved ? "bg-slate-100 text-slate-400 border border-slate-200" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                        >
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grid Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catalog Items</p>
                  <h3 className="text-2xl font-bold">{activeCatalogCount} Activities</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Locations Covered</p>
                  <h3 className="text-2xl font-bold">{operatorsCount} Zones</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Additions</p>
                  <h3 className="text-2xl font-bold">This Month</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by activity name or location..."
                  className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Activity Grid */}
            <div className="p-6 bg-slate-50/50">
              {isInventoryLoading ? (
                <div className="py-12 text-center text-muted-foreground bg-white rounded-xl border border-slate-200">
                  Loading activities...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground bg-white rounded-xl border border-slate-200">
                  No activities found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((activity: any) => {
                    const image = activity.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800";
                    
                    return (
                      <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                        <div className="relative h-48 w-full bg-slate-100">
                          <img src={image} alt={activity.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">{activity.name}</h3>
                            <div className="flex items-center gap-2 text-slate-600 shrink-0 mt-0.5">
                              <button title={activity.status === "INACTIVE" ? "Inactive" : "Hide"} className="hover:text-slate-900 transition-colors">
                                <EyeOff className="h-4 w-4" />
                              </button>
                              <Link href={`/inventory/activities/new?id=${activity.id}`} className="hover:text-slate-900 transition-colors">
                                <Edit className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-4 text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm line-clamp-1">{destinationsQuery.data?.find(d => d.id === activity.destinationId)?.name || activity.location || "Unknown Location"}</span>
                          </div>

                          {activity.description && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{activity.description}</p>
                          )}

                          <div className="space-y-2.5 text-sm text-slate-600 mb-6 flex-1">
                            {activity.duration && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">Duration:</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {activity.duration}
                                </div>
                              </div>
                            )}
                            {activity.adultPrice > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">Starter Price:</span>
                                <span>₹{activity.adultPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {activity.childPrice > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">Offer Price:</span>
                                <span>₹{activity.childPrice.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${activity.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-2 flex-wrap">
                            <button 
                              onClick={() => setSelectedId(activity.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors text-center flex-1"
                            >
                              View Detail
                            </button>
                            {activity.status === 'DRAFT' && (
                              <button 
                                disabled={publishMutation.isPending}
                                onClick={() => publishActivity(activity.id)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex-1"
                              >
                                Publish
                              </button>
                            )}
                            <button 
                              disabled={deleteMutation.isPending}
                              onClick={() => removeActivity(activity.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Activity Modal removed */}

      <AlertModal
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: "" })}
      />

      <InventoryDetailDrawer
        itemId={selectedId}
        destinations={destinationsQuery.data || []}
        onClose={() => setSelectedId(null)}
      />

      {/* Confirm delete dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Remove Activity</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this activity? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
