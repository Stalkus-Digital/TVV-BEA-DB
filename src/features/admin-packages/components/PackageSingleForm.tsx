"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { uploadFiles } from "@/lib/admin-api/upload";
import { useEffect, useState } from "react";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { PackageSourceType } from "../constants";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFullPackage, updateFullPackage } from "../api/packages";
import { PackageStatusBadge } from "./PackageStatusBadge";
import { Trash2, Plus } from "lucide-react";
import { DescriptionEditor } from "@/features/admin-hotels/components/DescriptionEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";

interface HotelEntry {
  dayNumber: number;
  location: string;
  hotelName: string;
  description: string;
}

export function PackageSingleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const queryClient = useQueryClient();
  const destinationsQuery = useDestinationsQuery();

  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [sourceType, setSourceType] = useState<PackageSourceType>(PackageSourceType.MANUAL);
  const [durationDays, setDurationDays] = useState(1);
  const [durationNights, setDurationNights] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [minPax, setMinPax] = useState(2);
  const [maxPax, setMaxPax] = useState<number | "">("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [itineraryDetails, setItineraryDetails] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [days, setDays] = useState<HotelEntry[]>([]);
  const [bannerImage, setBannerImage] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const { data: inventoryHotels } = useQuery({
    queryKey: ["admin", "inventory", "HOTEL"],
    queryFn: async () => {
      const res = await adminApiClient.get<any>(adminEndpoints.inventory, { params: { kind: "HOTEL", pageSize: 100 } });
      if (!res) return [];
      return res.items.map((item: any) => ({ id: item.id, name: item.title, location: item.details?.address || "Unknown" }));
    },
  });

  const { data: previewData } = useQuery({
    queryKey: ["admin", "packages", editId, "preview"],
    queryFn: async () => {
      if (!editId) return null;
      return adminApiClient.get<any>(`${adminEndpoints.packages}/${editId}/preview`);
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (previewData) {
      const packageData = previewData.package;
      const rawDays: any[] = previewData.days || [];
      const pricing = previewData.pricing;
      setTitle(packageData?.title || "");
      setDestinationId(packageData.destinationId || "");
      setSourceType(packageData.sourceType || PackageSourceType.MANUAL);
      setDurationDays(packageData.durationDays || 1);
      setDurationNights(packageData.durationNights || 0);
      
      if (packageData.content) {
        setShortDescription(packageData.content.shortDescription || "");
        setItineraryDetails(packageData.content.itineraryDetails || "");
        setInclusions(packageData.content.inclusions || "");
        setExclusions(packageData.content.exclusions || "");
        if (packageData.content.images) setImages(packageData.content.images);
      }
      if (pricing) {
        setBasePrice(pricing.basePrice || 0);
        setCurrency(pricing.currency || "INR");
        setMinPax(previewData.rules?.minPax || 2);
        setMaxPax(previewData.rules?.maxPax || "");
      }
      
      if (rawDays.length > 0) {
        const flatRows: HotelEntry[] = [];
        rawDays.forEach((d: any) => {
          const hotelItems = (d.items || []).filter((it: any) => it.kind === "HOTEL");
          if (hotelItems.length > 0) {
            hotelItems.forEach((it: any) => {
              flatRows.push({
                dayNumber: d.dayNumber,
                location: it.description || "",
                hotelName: it.title || "",
                description: d.description || "",
              });
            });
          } else {
            flatRows.push({ dayNumber: d.dayNumber, location: "", hotelName: "", description: d.description || "" });
          }
        });
        setDays(flatRows);
      } else {
        setDays([]);
      }
    } else if (!editId) {
      setDays([]);
    }
  }, [previewData, editId]);

  const addHotel = () => {
    setDays((prev) => [...prev, { dayNumber: prev.length > 0 ? prev[prev.length - 1].dayNumber + 1 : 1, location: "", hotelName: "", description: "" }]);
  };

  const updateHotel = (idx: number, field: keyof HotelEntry, val: string | number) => {
    setDays((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: val } : h)));
  };

  const removeHotel = (idx: number) => {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => createFullPackage(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "packages"] }); router.push("/packages"); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateFullPackage(editId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "packages"] }); router.push("/packages"); },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedImageUrls: string[] = [];
    if (bannerImage.length > 0) {
      try {
        const results = await uploadFiles(bannerImage, "PACKAGE_IMAGE");
        uploadedImageUrls = results.map((r) => r.url);
      } catch (err) {
        console.error("Failed to upload images:", err);
        alert("Failed to upload images. Please try again.");
        return;
      }
    }
    
    const hotelsFlat = days.map((h) => ({ dayNumber: h.dayNumber, location: h.location, hotelName: h.hotelName }));

    const descByDay = new Map<number, string>();
    days.forEach((h) => { if (h.description) descByDay.set(h.dayNumber, h.description); });
    const dayDescriptions = Array.from(descByDay.entries()).map(([dayNumber, description]) => ({
      dayNumber,
      title: `Day ${dayNumber}`,
      description,
    }));

    const payload = { 
      title, 
      destinationId, 
      sourceType, 
      durationDays, 
      durationNights, 
      basePrice, 
      currency, 
      minPax, 
      maxPax, 
      validFrom, 
      validTo, 
      shortDescription, 
      itineraryDetails, 
      inclusions, 
      exclusions, 
      hotels: hotelsFlat, 
      dayDescriptions, 
      images: uploadedImageUrls.length > 0 ? uploadedImageUrls : images 
    };
    
    if (editId) { 
      await updateMutation.mutateAsync(payload); 
    } else { 
      await createMutation.mutateAsync(payload); 
    }
  };

  const destinations = destinationsQuery.data || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex justify-center w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-white flex justify-between items-center">
          <div>
            <Link href="/packages" className="text-xs text-muted-foreground hover:text-foreground mb-2 block">← Back to packages</Link>
            <h1 className="text-2xl font-bold">{editId ? "Edit Package" : "Create Package"}</h1>
          </div>
          <button onClick={handleSubmit} disabled={isSaving || !title || !destinationId} className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg disabled:opacity-50 transition-colors">
            {isSaving ? "Saving..." : editId ? "Update Package" : "Create Package"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">

          <section className="space-y-6">
            <div className="border-b border-border pb-2"><h2 className="text-lg font-semibold">Basic Information</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Package Name</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Exotic Kerala Tour 5N/6D" className="w-full px-4 py-2 border border-border rounded-lg" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Destination</label>
                <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg" required>
                  <option value="">Select a destination...</option>
                  {destinations.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <select value={sourceType} onChange={(e) => setSourceType(e.target.value as PackageSourceType)} className="w-full px-4 py-2 border border-border rounded-lg">
                  <option value="MANUAL">Manual Entry</option>
                  <option value="TRIPJACK">TripJack Sync</option>
                  <option value="SEMBARK">Sembark Sync</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Days)</label>
                <input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Nights)</label>
                <input type="number" min={0} value={durationNights} onChange={(e) => setDurationNights(Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Per Person</label>
                <input type="number" min={0} value={basePrice} placeholder="0" onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Capacity (Pax)</label>
                <input type="number" min={1} value={minPax} onChange={(e) => setMinPax(Number(e.target.value))} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Capacity (Pax) — optional</label>
                <input type="number" min={1} value={maxPax} placeholder="Unlimited" onChange={(e) => setMaxPax(e.target.value ? Number(e.target.value) : "")} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid From</label>
                <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid To</label>
                <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-border pb-2"><h2 className="text-lg font-semibold">Package Details</h2></div>
            <DescriptionEditor label="Short Description" value={shortDescription} onChange={setShortDescription} rows={3} />
            <DescriptionEditor label="Itinerary Details (Rich Text Format)" value={itineraryDetails} onChange={setItineraryDetails} rows={8} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DescriptionEditor label="Inclusions" value={inclusions} onChange={setInclusions} rows={6} />
              <DescriptionEditor label="Exclusions" value={exclusions} onChange={setExclusions} rows={6} />
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-border pb-2"><h2 className="text-lg font-semibold">Media</h2></div>
            <ImageUploader label="Package Banner Image" multiple={false} value={bannerImage} onChange={setBannerImage} />
          </section>

          <section className="space-y-4">
            <div className="border-b border-border pb-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Daywise Hotel Plan</h2>
              <button
                type="button"
                onClick={addHotel}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add Hotel
              </button>
            </div>

            {days.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">No hotels added to itinerary yet.</p>
                <button type="button" onClick={addHotel} className="mt-2 text-sm text-slate-800 hover:underline font-medium">
                  Add first hotel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {days.map((h, i) => (
                  <div key={i} className="bg-slate-50 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entry {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHotel(i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground block">Day</label>
                        <input
                          type="number"
                          min={1}
                          value={h.dayNumber}
                          onChange={(e) => updateHotel(i, "dayNumber", Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground block">Location / City</label>
                        <input
                          value={h.location}
                          onChange={(e) => updateHotel(i, "location", e.target.value)}
                          placeholder="e.g. Munnar"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground block">Hotel</label>
                        <select
                          value={h.hotelName}
                          onChange={(e) => updateHotel(i, "hotelName", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        >
                          <option value="">Select a hotel</option>
                          {inventoryHotels?.map((inv: any) => (
                            <option key={inv.id} value={inv.name}>
                              {inv.name}{inv.location !== "Unknown" ? ` (${inv.location})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground block">Description</label>
                      <textarea
                        value={h.description}
                        onChange={(e) => updateHotel(i, "description", e.target.value)}
                        rows={2}
                        placeholder={`Describe Day ${h.dayNumber} — activities, sightseeing, meals...`}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-y outline-none focus:ring-1 focus:ring-ring leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </form>
      </div>
    </div>
  );
}
