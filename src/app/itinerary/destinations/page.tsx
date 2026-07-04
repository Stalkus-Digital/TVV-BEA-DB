"use client";

import { useState } from "react";
import { MapPin, Plus, Search, Eye, Compass, Hotel, X, Link as LinkIcon, Upload, Trash2 } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  type: "Andaman" | "Domestic" | "International";
  slug: string;
  coverImage: string;
  packages: number;
  hotels: number;
  status: "Featured" | "Active" | "Draft";
  description?: string;
}

const INITIAL_DESTINATIONS: Destination[] = [
  { id: "DST-101", name: "Havelock Island", type: "Andaman", slug: "havelock-island", coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", packages: 12, hotels: 8, status: "Featured", description: "Pristine white sand beaches and crystal clear waters." },
  { id: "DST-102", name: "Kerala Backwaters", type: "Domestic", slug: "kerala-backwaters", coverImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80", packages: 5, hotels: 12, status: "Active", description: "Tranquil backwaters and lush greenery." },
  { id: "DST-103", name: "Royal Rajasthan", type: "Domestic", slug: "royal-rajasthan", coverImage: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80", packages: 8, hotels: 15, status: "Featured", description: "Majestic forts and vibrant culture." },
  { id: "DST-104", name: "Kyoto, Japan", type: "International", slug: "kyoto-japan", coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", packages: 3, hotels: 4, status: "Active", description: "Timeless temples and beautiful cherry blossoms." },
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"All" | "Andaman" | "Domestic" | "International">("All");

  const [newDest, setNewDest] = useState<Partial<Destination>>({
    name: "",
    type: "Domestic",
    slug: "",
    coverImage: "",
    description: "",
    status: "Active",
  });

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (val: string) => {
    setNewDest(prev => ({
      ...prev,
      name: val,
      slug: prev.slug === generateSlug(prev.name || "") ? generateSlug(val) : prev.slug
    }));
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || dest.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const dest: Destination = {
      id: `DST-${Date.now().toString().slice(-4)}`,
      name: newDest.name || "",
      type: newDest.type as "Andaman" | "Domestic" | "International" || "Domestic",
      slug: newDest.slug || generateSlug(newDest.name || ""),
      coverImage: newDest.coverImage || "",
      description: newDest.description || "",
      packages: 0,
      hotels: 0,
      status: newDest.status as "Featured" | "Active" | "Draft" || "Active",
    };
    
    setDestinations([dest, ...destinations]);
    setIsModalOpen(false);
    
    setNewDest({
      name: "",
      type: "Domestic",
      slug: "",
      coverImage: "",
      description: "",
      status: "Active",
    });
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Destinations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your destination pages. These will appear on the website and fuel the package builder.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Destination
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex bg-muted p-1 rounded-md">
          {["All", "Andaman", "Domestic", "International"].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterType === t ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((dest) => (
          <div key={dest.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between group">
            <div className="relative h-40 bg-slate-200">
              {dest.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dest.coverImage} alt={dest.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400"><MapPin className="h-8 w-8 opacity-20" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm text-white mb-2 inline-block ${
                  dest.type === "Andaman" ? "bg-blue-500" : dest.type === "Domestic" ? "bg-emerald-500" : "bg-purple-500"
                }`}>
                  {dest.type}
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {dest.name}
                </h3>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow-sm ${
                  dest.status === 'Featured' ? 'bg-amber-400 text-amber-900' : 
                  dest.status === 'Active' ? 'bg-white text-slate-800' : 'bg-slate-800 text-white'
                }`}>
                  {dest.status}
                </span>
                <button 
                  onClick={() => removeDestination(dest.id)}
                  className="p-1.5 bg-white/20 hover:bg-red-500 text-white rounded transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1">
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{dest.description || "No description provided."}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-semibold">{dest.packages}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Packages</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-semibold">{dest.hotels}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Hotels</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 border-t border-border flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                <LinkIcon className="h-3 w-3 shrink-0" /> /destinations/{dest.slug}
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground font-medium">No destinations found.</p>
        </div>
      )}

      {/* Add Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-foreground">Add New Destination</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Destination Name *</label>
                  <input 
                    required
                    type="text"
                    value={newDest.name} 
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Destination Type *</label>
                  <select 
                    value={newDest.type} 
                    onChange={(e) => setNewDest({...newDest, type: e.target.value as any})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  >
                    <option value="Andaman">Andaman</option>
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select 
                    value={newDest.status} 
                    onChange={(e) => setNewDest({...newDest, status: e.target.value as any})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Featured">Featured</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">SEO Slug *</label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground text-sm">/destinations/</span>
                    <input 
                      required
                      type="text"
                      value={newDest.slug} 
                      onChange={(e) => setNewDest({...newDest, slug: generateSlug(e.target.value)})}
                      placeholder="rajasthan"
                      className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cover Image (URL or Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newDest.coverImage} 
                      onChange={(e) => setNewDest({...newDest, coverImage: e.target.value})}
                      placeholder="https://..."
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                    />
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <Upload className="h-4 w-4" />
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={async (e) => { 
                          const f = e.target.files?.[0]; 
                          if (f) {
                            const reader = new FileReader();
                            reader.onload = () => setNewDest({...newDest, coverImage: reader.result as string});
                            reader.readAsDataURL(f);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  {newDest.coverImage && (
                    <img src={newDest.coverImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-border" />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Short Description</label>
                  <textarea 
                    value={newDest.description} 
                    onChange={(e) => setNewDest({...newDest, description: e.target.value})}
                    placeholder="Enter a brief description for the destination card..."
                    rows={2}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground resize-none"
                  />
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
                  <Plus className="h-4 w-4" /> Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
