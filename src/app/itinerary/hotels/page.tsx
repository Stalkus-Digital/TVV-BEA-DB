"use client";

import { useState } from "react";
import { Hotel, Plus, Search, Star, MapPin, X } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertModal } from "@/components/layout/AlertModal";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";

interface HotelProperty {
  id: string;
  name: string;
  location: string;
  stars: number;
  rooms: number;
  avgRate: number;
  status: "Active" | "Maintenance";
  destinationId?: string | null;
}

export default function HotelsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
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
    status: "Active",
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
        location: item.details?.address || "Unknown",
        stars: item.details?.starRating || 3,
        rooms: item.details?.rooms || 0,
        avgRate: item.details?.avgRate || 0,
        status: item.status,
        destinationId: item.destinationId || null,
      })) as HotelProperty[];
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
      status: newHotel.status as "Active" | "Maintenance" || "Active",
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
      status: "Active",
    });
  };

  const openAddModal = () => {
    setEditingHotelId(null);
    setNewHotel({
      name: "",
      location: "",
      stars: 3,
      rooms: 10,
      avgRate: 5000,
      status: "Active",
      destinationId: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: HotelProperty) => {
    setEditingHotelId(hotel.id);
    setNewHotel(hotel);
    setIsModalOpen(true);
  };

  const removeHotel = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await deleteMutation.mutateAsync(confirmDeleteId);
      setConfirmDeleteId(null);
    }
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
          status: "Active"
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
  const activeContracts = hotels.filter(h => h.status === "Active").length;
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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Property
          </button>
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
                          <p className="text-xl font-black text-primary">₹{hotel.avgRate.toLocaleString()}</p>
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

            {/* Hotel Grid/List */}
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Hotel ID</th>
                    <th className="px-6 py-4 font-semibold">Property</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Rating</th>
                    <th className="px-6 py-4 font-semibold">Total Rooms</th>
                    <th className="px-6 py-4 font-semibold">Avg. Nightly Rate</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHotels.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No properties found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredHotels.map((hotel) => (
                      <tr key={hotel.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {hotel.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Hotel className="h-4 w-4 text-slate-400" />
                            {hotel.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-slate-500 text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {hotel.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`h-3.5 w-3.5 ${idx < hotel.stars ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                          {hotel.rooms} Rooms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-600">
                          ₹{hotel.avgRate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${hotel.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {hotel.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openEditModal(hotel)} className="text-blue-500 hover:underline font-medium mr-3">Edit</button>
                          <button
                            onClick={() => removeHotel(hotel.id)}
                            className="text-slate-500 hover:text-red-600 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Hotel Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">{editingHotelId ? "Edit Hotel Property" : "Add New Hotel Property"}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-md hover:bg-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Property Name *</label>
                    <input
                      required
                      type="text"
                      value={newHotel.name}
                      onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                      placeholder="e.g. Taj Exotica Resort & Spa"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Destination</label>
                      <select
                        value={newHotel.destinationId || ""}
                        onChange={(e) => setNewHotel({ ...newHotel, destinationId: e.target.value || null })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                      >
                        <option value="">Select Destination</option>
                        {destinationsQuery.data?.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location / Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="text"
                          value={newHotel.location}
                          onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                          placeholder="e.g. Swaraj Dweep"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Star Rating</label>
                      <select
                        value={newHotel.stars}
                        onChange={(e) => setNewHotel({ ...newHotel, stars: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                      >
                        {[1, 2, 3, 4, 5].map(s => (
                          <option key={s} value={s}>{s} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Rooms Allotted</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={newHotel.rooms || ""}
                        onChange={(e) => setNewHotel({ ...newHotel, rooms: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Avg. Nightly Rate (₹)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={newHotel.avgRate || ""}
                        onChange={(e) => setNewHotel({ ...newHotel, avgRate: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                      <select
                        value={newHotel.status}
                        onChange={(e) => setNewHotel({ ...newHotel, status: e.target.value as "Active" | "Maintenance" })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-900"
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 mt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingHotelId ? "Update Property" : "Save Property"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <AlertModal
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: "" })}
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
