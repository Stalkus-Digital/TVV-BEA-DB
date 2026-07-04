"use client";

import { useState } from "react";
import { Compass, Plus, Search, MapPin, Clock, X } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  location: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  status: "Active" | "Inactive";
}

const INITIAL_ACTIVITIES: Activity[] = [
  { id: "ACT-401", name: "Scuba Diving at Elephant Beach", location: "Havelock Island", duration: "2 Hours", adultPrice: 3500, childPrice: 3500, status: "Active" },
  { id: "ACT-402", name: "Radhanagar Sunset Tour", location: "Havelock Island", duration: "3 Hours", adultPrice: 1200, childPrice: 600, status: "Active" },
  { id: "ACT-403", name: "Coral Safari Semi Submarine", location: "Port Blair", duration: "1.5 Hours", adultPrice: 2200, childPrice: 1500, status: "Active" },
  { id: "ACT-404", name: "Baratang Limestone Caves Tour", location: "Baratang Island", duration: "10 Hours", adultPrice: 4500, childPrice: 3500, status: "Active" },
  { id: "ACT-405", name: "Jet Ski Ride at Water Sports Complex", location: "Port Blair", duration: "15 Mins", adultPrice: 800, childPrice: 800, status: "Active" },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: "",
    location: "Havelock Island",
    duration: "2 Hours",
    adultPrice: 1000,
    childPrice: 500,
    status: "Active",
  });

  const filteredActivities = activities.filter((a) => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const activity: Activity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      name: newActivity.name || "",
      location: newActivity.location || "",
      duration: newActivity.duration || "1 Hour",
      adultPrice: Number(newActivity.adultPrice) || 0,
      childPrice: Number(newActivity.childPrice) || 0,
      status: newActivity.status as "Active" | "Inactive" || "Active",
    };
    
    setActivities([activity, ...activities]);
    setIsModalOpen(false);
    
    // Reset form
    setNewActivity({
      name: "",
      location: "Havelock Island",
      duration: "2 Hours",
      adultPrice: 1000,
      childPrice: 500,
      status: "Active",
    });
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const activeCatalogCount = activities.filter(a => a.status === "Active").length;
  // Use unique locations as operators count
  const operatorsCount = new Set(activities.map(a => a.location)).size; 

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activities & Excursions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your excursion catalog, ticket rates, provider payouts, and time-slot limits.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Activity ID</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Adult Rate</th>
                <th className="px-6 py-4 font-semibold">Child Rate</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No activities found matching your search.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {activity.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      {activity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-muted-foreground text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                      ₹{activity.adultPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      ₹{activity.childPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-primary hover:underline font-medium mr-3">Edit</button>
                      <button 
                        onClick={() => removeActivity(activity.id)}
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

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-foreground">Add New Activity</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Activity Name *</label>
                <input 
                  required
                  type="text"
                  value={newActivity.name} 
                  onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                  placeholder="e.g. Snorkelling at North Bay"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location *</label>
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      value={newActivity.location} 
                      onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                      placeholder="e.g. Havelock Island"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration</label>
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      value={newActivity.duration} 
                      onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                      placeholder="e.g. 2 Hours"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Adult Price (₹)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newActivity.adultPrice} 
                    onChange={(e) => setNewActivity({...newActivity, adultPrice: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Child Price (₹)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newActivity.childPrice} 
                    onChange={(e) => setNewActivity({...newActivity, childPrice: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select 
                  value={newActivity.status} 
                  onChange={(e) => setNewActivity({...newActivity, status: e.target.value as "Active" | "Inactive"})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  <Plus className="h-4 w-4" /> Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
