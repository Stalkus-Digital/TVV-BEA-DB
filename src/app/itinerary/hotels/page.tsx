"use client";

import { useState } from "react";
import { Hotel, Plus, Search, Star, MapPin, X, EyeOff, Edit, ImageIcon } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertModal } from "@/components/layout/AlertModal";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { InventoryDetailDrawer } from "@/features/admin-inventory/components/InventoryDetailDrawer";
import Link from "next/link";

interface HotelProperty {
  id: string;
  name: string;
  location: string;
  stars: number;
  rooms: number;
  avgRate: number;
  status: "ACTIVE" | "MAINTENANCE";
  destinationId?: string | null;
  image?: string | null;
}

export default function HotelsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const [searchResults, setSearchResults] = useState<HotelProperty[] | null>(null);
  const [searchParams, setSearchParams] = useState({
    city: "BOM",
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    rooms: 1,
    guests: 2
  });

  const [newHotel, setNewHotel] = useState<Partial<HotelProperty>>({
    name: "",
    location: "",
    stars: 3,
    rooms: 10,
    avgRate: 5000,
    status: "ACTIVE",
    destinationId: null,
  });

  const destinationsQuery = useDestinationsQuery();

  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: ["admin", "inventory", "HOTEL"],
    queryFn: async () => {
      const res = await adminApiClient.get<any>(adminEndpoints.inventory, { params: { kind: "HOTEL", pageSize: 100 } });
      if (!res) return [];
      return res.items.map((item: any) => ({
        id: item.id,
        name: item.title,
        location: item.details?.address || "",
        stars: item.details?.rating || item.details?.starRating || 3,
        rooms: item.details?.rooms || 0,
        avgRate: item.details?.avgRate || 0,
        status: item.status,
        destinationId: item.destinationId || null,
        image: item.details?.images?.[0] || item.details?.bannerImage?.[0] || null,
        shortDescription: item.details?.shortDescription || "",
      })) as (HotelProperty & { shortDescription?: string })[];
    }
  });

  const hotels = inventoryData || [];

  const createMutation = useMutation({
    mutationFn: async (hotel: HotelProperty) => {
      const payload = {
        kind: "HOTEL",
        title: hotel.name,
        status: hotel.status,
        destinationId: hotel.destinationId || null,
        details: {
          address: hotel.location,
          starRating: hotel.stars,
          rooms: hotel.rooms,
          avgRate: hotel.avgRate,
        }
      };
      return adminApiClient.post(adminEndpoints.inventory, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "HOTEL"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (hotel: HotelProperty) => {
      const payload = {
        title: hotel.name,
        status: hotel.status,
        destinationId: hotel.destinationId || null,
        details: {
          address: hotel.location,
          starRating: hotel.stars,
          rooms: hotel.rooms,
          avgRate: hotel.avgRate,
        }
      };
      return adminApiClient.patch(`${adminEndpoints.inventory}/${hotel.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "HOTEL"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiClient.delete(`${adminEndpoints.inventory}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "HOTEL"] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApiClient.patch(`${adminEndpoints.inventory}/${id}`, { status: "ACTIVE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "HOTEL"] });
    }
  });

  const filteredHotels = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const hotel: HotelProperty = {
      id: editingHotelId || "",
      name: newHotel.name || "",
      location: newHotel.location || "",
      stars: Number(newHotel.stars) || 3,
      rooms: Number(newHotel.rooms) || 0,
      avgRate: Number(newHotel.avgRate) || 0,
      status: newHotel.status as "ACTIVE" | "MAINTENANCE" || "ACTIVE",
    };

    if (editingHotelId) {
      await updateMutation.mutateAsync(hotel);
    } else {
      await createMutation.mutateAsync(hotel);
    }

    setIsModalOpen(false);
    setEditingHotelId(null);

    // Reset form
    setNewHotel({
      name: "",
      location: "",
      stars: 3,
      rooms: 10,
      avgRate: 5000,
      status: "ACTIVE",
    });
  };

  const removeHotel = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteId);
      setAlertState({ isOpen: true, message: "Hotel deleted successfully" });
      setConfirmDeleteId(null);
    } catch (err) {
      setAlertState({ isOpen: true, message: "Failed to delete hotel" });
    }
  };

  const publishHotel = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
      setAlertState({ isOpen: true, message: "Hotel published successfully!" });
    } catch (err) {
      setAlertState({ isOpen: true, message: "Failed to publish hotel" });
    }
  };

  const openAddModal = () => {
    setEditingHotelId(null);
    setNewHotel({
      name: "",
      location: "",
      stars: 3,
      rooms: 10,
      avgRate: 5000,
      status: "ACTIVE",
      destinationId: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: HotelProperty) => {
    setEditingHotelId(hotel.id);
    setNewHotel(hotel);
    setIsModalOpen(true);
  };

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchResults(null);
    try {
      const data = await adminApiClient.post<{ success: boolean; data?: any; error?: any }>('/api/supplier/search', {
        capability: "HOTELS",
        criteria: {
          capability: "HOTELS",
          cityCode: searchParams.city,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          rooms: searchParams.rooms,
          guests: searchParams.guests,
        }
      });
      if (data && data.success && data.data?.results) {
        const mapped: HotelProperty[] = data.data.results.map((res: any) => ({
          id: res.referenceId || `HTL-${Date.now()}`,
          name: res.hotelName || "Unknown Hotel",
          location: res.location || searchParams.city,
          stars: res.rating || 3,
          rooms: res.availableRooms || searchParams.rooms,
          avgRate: res.price || 0,
          status: "ACTIVE"
        }));
        setSearchResults(mapped);
      } else {
        setAlertState({ isOpen: true, message: data?.error?.message || "Failed to search hotels" });
      }
    } catch (err) {
      setAlertState({ isOpen: true, message: "Network error while searching hotels" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLiveHotel = async (hotel: HotelProperty) => {
    if (!hotels.find(h => h.name === hotel.name)) {
      await createMutation.mutateAsync(hotel);
    }
  };

  // Stats Calculations
  const activeContracts = hotels.filter(h => h.status === "ACTIVE").length;
  const totalRooms = hotels.reduce((acc, h) => acc + h.rooms, 0);
  const avgRoomRate = hotels.length
    ? hotels.reduce((acc, h) => acc + h.avgRate, 0) / hotels.length
    : 0;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hotels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage contracted hotels or search live TripJack hotel inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsSearchMode(!isSearchMode);
              setSearchResults(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 font-semibold rounded-md shadow-sm hover:bg-slate-200 transition-colors"
          >
            <Search className="h-4 w-4" />
            {isSearchMode ? "Back to Managed Hotels" : "Live API Search"}
          </button>
          <Link
            href="/inventory/hotels/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </div>
      </div>

      {isSearchMode ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              TripJack Live Hotel Search
            </h2>
            <form onSubmit={handleLiveSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City Code</label>
                <div className="relative">
                  <input required type="text" value={searchParams.city} onChange={e => setSearchParams({ ...searchParams, city: e.target.value.toUpperCase() })} className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-bold uppercase" />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-in</label>
                <input required type="date" value={searchParams.checkIn} onChange={e => setSearchParams({ ...searchParams, checkIn: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-out</label>
                <input required type="date" value={searchParams.checkOut} onChange={e => setSearchParams({ ...searchParams, checkOut: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rooms/Guests</label>
                <input required type="text" value={`${searchParams.rooms}R / ${searchParams.guests}G`} readOnly className="w-full bg-slate-50 text-slate-600 border border-slate-300 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50">
                {isLoading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {searchResults && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                TripJack Results ({searchResults.length} properties found)
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map(hotel => {
                  const isSaved = hotels.some(h => h.id === hotel.id);
                  return (
                    <div key={hotel.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-foreground text-lg leading-tight">{hotel.name}</h4>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`h-3 w-3 ${idx < hotel.stars ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="h-3 w-3" /> {hotel.location}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Nightly Rate from</p>
                          <p className="text-xl font-black text-primary">₹{(hotel.avgRate || 0).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => saveLiveHotel(hotel)}
                          disabled={isSaved}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isSaved ? "bg-slate-100 text-slate-400 border border-slate-200" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            }`}
                        >
                          {isSaved ? "Saved" : "Save to Inventory"}
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

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Properties Managed</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{hotels.length} Properties</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Allotted Rooms</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{totalRooms} Rooms</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active Contracts</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{activeContracts} Active</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg. Room Rate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  ₹{avgRoomRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by hotel name or location..."
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                />
              </div>
            </div>

            {/* Hotel Grid */}
            <div className="p-6 bg-slate-50/50">
              {filteredHotels.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  No properties found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel: any) => {
                    const image = hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800";
                    
                    return (
                      <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                        <div className="relative h-48 w-full bg-slate-100">
                          <img src={image} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">{hotel.name}</h3>
                            <div className="flex items-center gap-2 text-slate-600 shrink-0 mt-0.5">
                              <button title={hotel.status === "Maintenance" ? "Maintenance" : "Hide"} className="hover:text-slate-900 transition-colors">
                                <EyeOff className="h-4 w-4" />
                              </button>
                              <Link href={`/inventory/hotels/new?id=${hotel.id}`} className="hover:text-slate-900 transition-colors">
                                <Edit className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-4 text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm line-clamp-1">{destinationsQuery.data?.find(d => d.id === hotel.destinationId)?.name || hotel.location || "Unknown Location"}</span>
                          </div>
                          
                          {hotel.shortDescription && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{hotel.shortDescription}</p>
                          )}

                          <div className="space-y-2.5 text-sm text-slate-600 mb-6 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">Rating:</span>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star key={idx} className={`h-3.5 w-3.5 ${idx < hotel.stars ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                                ))}
                              </div>
                            </div>
                            {hotel.rooms > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">Total Rooms:</span>
                                <span>{hotel.rooms}</span>
                              </div>
                            )}
                            {hotel.avgRate > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900">Avg. Nightly Rate:</span>
                                <span>₹{(hotel.avgRate || 0).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${hotel.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                {hotel.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-2 flex-wrap">
                            <button 
                              onClick={() => setSelectedId(hotel.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors text-center flex-1"
                            >
                              View Detail
                            </button>
                            {hotel.status === 'DRAFT' && (
                              <button 
                                disabled={publishMutation.isPending}
                                onClick={() => publishHotel(hotel.id)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex-1"
                              >
                                Publish
                              </button>
                            )}
                            <button 
                              disabled={deleteMutation.isPending}
                              onClick={() => removeHotel(hotel.id)}
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

          {/* Add Hotel Modal removed */}
        </>
      )}

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
            <h3 className="font-semibold text-foreground">Remove Hotel</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this hotel? This action cannot be undone.</p>
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
