"use client";

import { useState } from "react";
import { Plane, Search, Calendar, Users, Briefcase, Plus, Filter, ArrowRight, Check } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { AlertModal } from "@/components/layout/AlertModal";

interface Flight {
  id: string;
  carrier: string;
  flightNo: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  fare: number;
  baggage: string;
}

// Removed TRIPJACK_MOCK_RESULTS

export default function FlightsPage() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const [searchResults, setSearchResults] = useState<Flight[] | null>(null);
  
  // Tracked/Saved flights
  const [savedFlights, setSavedFlights] = useState<Flight[]>([]);

  const [searchParams, setSearchParams] = useState({
    origin: "DEL",
    destination: "IXZ",
    date: new Date().toISOString().split('T')[0],
    passengers: 1,
    class: "Economy"
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchResults(null);
    try {
      const data = await adminApiClient.post<{ success: boolean; data?: any; error?: any }>('/api/supplier/search', {
        capability: "FLIGHTS",
        criteria: {
          capability: "FLIGHTS",
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.date,
          adults: searchParams.passengers,
          cabinClass: searchParams.class === "Premium" ? "PREMIUM_ECONOMY" : searchParams.class === "Business" ? "BUSINESS" : "ECONOMY",
        }
      });
      if (data && data.success && data.data?.results) {
        // Map backend response to UI structure
        const mapped = data.data.results.map((res: any) => ({
          id: res.referenceId,
          carrier: res.airlineName || res.airlineCode,
          flightNo: `${res.airlineCode}-${res.flightNumber}`,
          origin: res.origin,
          destination: res.destination,
          departure: res.departureTime ? new Date(res.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
          arrival: res.arrivalTime ? new Date(res.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
          duration: `${Math.floor((res.durationMinutes || 0)/60)}h ${(res.durationMinutes || 0)%60}m`,
          fare: res.price,
          baggage: res.baggageAllowance || "15 KG",
        }));
        setSearchResults(mapped);
      } else {
        setAlertState({ isOpen: true, message: data?.error?.message || "Failed to search flights" });
      }
    } catch (err) {
      setAlertState({ isOpen: true, message: "Network error while searching flights" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFlight = (flight: Flight) => {
    if (!savedFlights.find(f => f.id === flight.id)) {
      setSavedFlights([flight, ...savedFlights]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flight Management (TripJack API)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search live flights via TripJack API and add them to your managed itineraries.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsSearchMode(!isSearchMode);
            setSearchResults(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          {isSearchMode ? <ArrowRight className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          {isSearchMode ? "Back to Saved Flights" : "Search New Flights"}
        </button>
      </div>

      {isSearchMode ? (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              TripJack Live Flight Search
            </h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Origin</label>
                <div className="relative">
                  <input 
                    required type="text" value={searchParams.origin} onChange={e => setSearchParams({...searchParams, origin: e.target.value.toUpperCase()})}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 font-bold uppercase"
                  />
                  <Plane className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Destination</label>
                <div className="relative">
                  <input 
                    required type="text" value={searchParams.destination} onChange={e => setSearchParams({...searchParams, destination: e.target.value.toUpperCase()})}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 font-bold uppercase"
                  />
                  <Plane className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Departure Date</label>
                <div className="relative">
                  <input 
                    required type="date" value={searchParams.date} onChange={e => setSearchParams({...searchParams, date: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Passengers / Class</label>
                <div className="relative">
                  <select 
                    value={searchParams.class} onChange={e => setSearchParams({...searchParams, class: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="Economy">1 PAX - Economy</option>
                    <option value="Premium">1 PAX - Premium</option>
                    <option value="Business">1 PAX - Business</option>
                  </select>
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <button 
                type="submit" disabled={isLoading}
                className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Searching..." : "Search Flights"}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                TripJack Results ({searchResults.length} flights found)
              </h3>
              <div className="grid gap-3">
                {searchResults.map(flight => {
                  const isSaved = savedFlights.some(f => f.id === flight.id);
                  return (
                    <div key={flight.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                          <Plane className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{flight.carrier}</p>
                          <p className="text-xs text-muted-foreground">{flight.flightNo}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-1 px-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{flight.departure}</p>
                          <p className="text-xs font-semibold text-slate-500">{flight.origin}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4 relative">
                          <p className="text-[10px] text-muted-foreground mb-1 font-medium">{flight.duration}</p>
                          <div className="w-full h-px bg-slate-200 relative">
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 rotate-90" />
                          </div>
                          <p className="text-[10px] text-emerald-600 mt-1 font-medium">Non-stop</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{flight.arrival}</p>
                          <p className="text-xs font-semibold text-slate-500">{flight.destination}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                        <div className="text-right">
                          <p className="text-xl font-black text-primary">₹{flight.fare.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                            <Briefcase className="h-3 w-3" /> {flight.baggage}
                          </p>
                        </div>
                        <button 
                          onClick={() => saveFlight(flight)}
                          disabled={isSaved}
                          className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                            isSaved 
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                        >
                          {isSaved ? <span className="flex items-center gap-1"><Check className="h-4 w-4"/> Saved</span> : "Select"}
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
        /* Saved Flights View */
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Plane className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Managed Flights</p>
                  <h3 className="text-2xl font-bold">{savedFlights.length} Tracked</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Search className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TripJack API Status</p>
                  <h3 className="text-2xl font-bold text-emerald-600">Connected</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-lg">Saved Flights for Itineraries</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Airline</th>
                    <th className="px-6 py-4 font-semibold">Route</th>
                    <th className="px-6 py-4 font-semibold">Timing</th>
                    <th className="px-6 py-4 font-semibold">Baggage</th>
                    <th className="px-6 py-4 font-semibold">Fare (Live)</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {savedFlights.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No flights saved yet. Use the search to add flights.</td></tr>
                  ) : (
                    savedFlights.map((flight) => (
                      <tr key={flight.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{flight.carrier}</div>
                          <div className="text-muted-foreground text-[10px] uppercase">{flight.flightNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                          {flight.origin} <ArrowRight className="inline h-3 w-3 text-slate-400 mx-1" /> {flight.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{flight.departure} ➔ {flight.arrival}</div>
                          <div className="text-muted-foreground text-[10px]">{flight.duration}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                          {flight.baggage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-black text-primary">
                          ₹{flight.fare.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => setSavedFlights(savedFlights.filter(f => f.id !== flight.id))} className="text-red-500 hover:underline font-medium text-xs">Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, message: "" })}
      />
    </div>
  );
}
