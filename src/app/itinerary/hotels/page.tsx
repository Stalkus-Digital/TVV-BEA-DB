"use client";

import { useState } from "react";
import { Hotel, Plus, Search, Star, MapPin, X } from "lucide-react";

interface HotelProperty {
  id: string;
  name: string;
  location: string;
  stars: number;
  rooms: number;
  avgRate: number;
  status: "Active" | "Maintenance";
}

const INITIAL_HOTELS: HotelProperty[] = [
  { id: "HTL-301", name: "Symphony Palms Beach Resort", location: "Havelock Island", stars: 4, rooms: 45, avgRate: 8500, status: "Active" },
  { id: "HTL-302", name: "Taj Exotica Resort & Spa", location: "Radhanagar Beach, Havelock", stars: 5, rooms: 72, avgRate: 38000, status: "Active" },
  { id: "HTL-303", name: "Sea Shell Port Blair", location: "Marine Hill, Port Blair", stars: 4, rooms: 30, avgRate: 7500, status: "Active" },
  { id: "HTL-304", name: "Summer Sands Beach Resort", location: "Neil Island", stars: 4, rooms: 64, avgRate: 9200, status: "Active" },
  { id: "HTL-305", name: "Silver Sand Beach Resort", location: "Neil Island", stars: 3, rooms: 22, avgRate: 6000, status: "Maintenance" },
];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelProperty[]>(INITIAL_HOTELS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newHotel, setNewHotel] = useState<Partial<HotelProperty>>({
    name: "",
    location: "",
    stars: 3,
    rooms: 10,
    avgRate: 5000,
    status: "Active",
  });

  const filteredHotels = hotels.filter((h) => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const hotel: HotelProperty = {
      id: `HTL-${Date.now().toString().slice(-4)}`,
      name: newHotel.name || "",
      location: newHotel.location || "",
      stars: Number(newHotel.stars) || 3,
      rooms: Number(newHotel.rooms) || 0,
      avgRate: Number(newHotel.avgRate) || 0,
      status: newHotel.status as "Active" | "Maintenance" || "Active",
    };
    
    setHotels([hotel, ...hotels]);
    setIsModalOpen(false);
    
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

  const removeHotel = (id: string) => {
    setHotels(hotels.filter(h => h.id !== id));
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
            Manage your contracted hotels, room inventories, seasonal pricing, and check-in allotments.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Hotel Property
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Properties Managed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{hotels.length} Properties</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Allotted Rooms</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{totalRooms} Rooms</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{activeContracts} Active</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Avg. Room Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary">
              ₹{avgRoomRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hotel name or location..."
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Hotel Grid/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
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
            <tbody className="divide-y divide-border">
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No properties found matching your search.
                  </td>
                </tr>
              ) : (
                filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {hotel.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        {hotel.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-muted-foreground text-xs flex items-center gap-1">
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
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                      {hotel.rooms} Rooms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                      ₹{hotel.avgRate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        hotel.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-primary hover:underline font-medium mr-3">Edit</button>
                      <button 
                        onClick={() => removeHotel(hotel.id)}
                        className="text-muted-foreground hover:text-destructive font-medium"
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-foreground">Add New Hotel Property</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Property Name *</label>
                <input 
                  required
                  type="text"
                  value={newHotel.name} 
                  onChange={(e) => setNewHotel({...newHotel, name: e.target.value})}
                  placeholder="e.g. Taj Exotica Resort & Spa"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location *</label>
                <div className="relative">
                  <input 
                    required
                    type="text"
                    value={newHotel.location} 
                    onChange={(e) => setNewHotel({...newHotel, location: e.target.value})}
                    placeholder="e.g. Radhanagar Beach, Havelock"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Star Rating</label>
                  <select 
                    value={newHotel.stars} 
                    onChange={(e) => setNewHotel({...newHotel, stars: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  >
                    {[1,2,3,4,5].map(s => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total Rooms Allotted</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={newHotel.rooms} 
                    onChange={(e) => setNewHotel({...newHotel, rooms: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Avg. Nightly Rate (₹)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newHotel.avgRate} 
                    onChange={(e) => setNewHotel({...newHotel, avgRate: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select 
                    value={newHotel.status} 
                    onChange={(e) => setNewHotel({...newHotel, status: e.target.value as "Active" | "Maintenance"})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3 mt-2 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
