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
import { createFullPackage, publishPackage, updateFullPackage } from "../api/packages";
import { Trash2, Plus } from "lucide-react";
import { DescriptionEditor } from "@/features/admin-hotels/components/DescriptionEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";

const MAX_GALLERY_IMAGES = 5;

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
  const [tripType, setTripType] = useState("HONEYMOON");
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
  const [rules, setRules] = useState("");
  const [days, setDays] = useState<HotelEntry[]>([]);
  const [gallery, setGallery] = useState<(File | string)[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

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
      setTripType(packageData.tripType || "HONEYMOON");
      setSourceType(packageData.sourceType || PackageSourceType.MANUAL);
      setDurationDays(packageData.durationDays || 1);
      setDurationNights(packageData.durationNights || 0);

      if (packageData.content) {
        setShortDescription(packageData.content.shortDescription || "");
        setItineraryDetails(packageData.content.itineraryDetails || "");
        setInclusions(packageData.content.inclusions || "");
        setExclusions(packageData.content.exclusions || "");
        setRules(packageData.content.rules || "");
        if (Array.isArray(packageData.content.images)) {
          setGallery(packageData.content.images.slice(0, MAX_GALLERY_IMAGES));
        }
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
    setDays((prev) => [
      ...prev,
      {
        dayNumber: prev.length > 0 ? prev[prev.length - 1].dayNumber + 1 : 1,
        location: "",
        hotelName: "",
        description: "",
      },
    ]);
  };

  const updateHotel = (idx: number, field: keyof HotelEntry, val: string | number) => {
    setDays((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: val } : h)));
  };

  const removeHotel = (idx: number) => {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => createFullPackage(data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateFullPackage(editId!, data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      const existingUrls = gallery.filter((item): item is string => typeof item === "string");
      const newFiles = gallery.filter((item): item is File => item instanceof File);

      let uploadedImageUrls: string[] = [];
      if (newFiles.length > 0) {
        try {
          const results = await uploadFiles(newFiles, "PACKAGE_IMAGE");
          uploadedImageUrls = results.map((r) => r.url);
        } catch (err) {
          console.error("Failed to upload images:", err);
          alert("Failed to upload images. Please try again.");
          return;
        }
      }

      // Preserve order: replace File slots with uploaded URLs in sequence
      const orderedImages: string[] = [];
      let uploadIdx = 0;
      for (const item of gallery) {
        if (typeof item === "string") {
          orderedImages.push(item);
        } else if (uploadIdx < uploadedImageUrls.length) {
          orderedImages.push(uploadedImageUrls[uploadIdx++]);
        }
      }
      const finalImages = (orderedImages.length > 0 ? orderedImages : existingUrls).slice(0, MAX_GALLERY_IMAGES);

      const hotelsFlat = days.map((h) => ({ dayNumber: h.dayNumber, location: h.location, hotelName: h.hotelName }));

      const descByDay = new Map<number, string>();
      days.forEach((h) => {
        if (h.description) descByDay.set(h.dayNumber, h.description);
      });
      const dayDescriptions = Array.from(descByDay.entries()).map(([dayNumber, description]) => ({
        dayNumber,
        title: `Day ${dayNumber}`,
        description,
      }));

      const payload = {
        title,
        destinationId,
        tripType,
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
        rules,
        hotels: hotelsFlat,
        dayDescriptions,
        images: finalImages,
      };

      const saved = editId
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);

      const packageId = editId || saved?.id;
      if (!packageId) {
        throw new Error("Package saved but no id returned");
      }

      await publishPackage(packageId, editId ? "Updated and published from package builder" : "Created and published from package builder");

      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      router.push("/packages");
    } catch (err: any) {
      console.error("Failed to save/publish package:", err);
      alert(err?.message || "Failed to save and publish package. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const destinations = (destinationsQuery.data || []).filter(
    (d) => !["andaman", "domestic", "international"].includes(d.slug),
  );
  const isSaving = createMutation.isPending || updateMutation.isPending || isPublishing;
  const nextDayNumber = days.length > 0 ? days[days.length - 1].dayNumber + 1 : 1;

  return (
    <div className="flex justify-center w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-white">
          <Link href="/packages" className="text-xs text-muted-foreground hover:text-foreground mb-2 block">
            ← Back to packages
          </Link>
          <h1 className="text-2xl font-bold">{editId ? "Edit Package" : "Create Package"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
          <section className="space-y-6">
            <div className="border-b border-border pb-2">
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Package Name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exotic Kerala Tour 5N/6D"
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Destination</label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  required
                >
                  <option value="">Select a destination...</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">By trip type</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  required
                >
                  <option value="HONEYMOON">Honeymoon packages</option>
                  <option value="FAMILY">Family tours packages</option>
                  <option value="LUXURY">Luxury packages</option>
                  <option value="ADVENTURE">Adventure packages</option>
                  <option value="GROUP">Group packages</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as PackageSourceType)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="MANUAL">Manual Entry</option>
                  <option value="TRIPJACK">TripJack Sync</option>
                  <option value="SEMBARK">Sembark Sync</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Nights)</label>
                <input
                  type="number"
                  min={0}
                  value={durationNights}
                  onChange={(e) => setDurationNights(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Per Person</label>
                <input
                  type="number"
                  min={0}
                  value={basePrice}
                  placeholder="0"
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Capacity (Pax)</label>
                <input
                  type="number"
                  min={1}
                  value={minPax}
                  onChange={(e) => setMinPax(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Capacity (Pax) — optional</label>
                <input
                  type="number"
                  min={1}
                  value={maxPax}
                  placeholder="Unlimited"
                  onChange={(e) => setMaxPax(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid From</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid To</label>
                <input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-border pb-2">
              <h2 className="text-lg font-semibold">Package Details</h2>
            </div>
            <DescriptionEditor label="Short Description" value={shortDescription} onChange={setShortDescription} rows={3} />
            <DescriptionEditor
              label="Itinerary Details (Rich Text Format)"
              value={itineraryDetails}
              onChange={setItineraryDetails}
              rows={8}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DescriptionEditor label="Inclusions" value={inclusions} onChange={setInclusions} rows={6} />
              <DescriptionEditor label="Exclusions" value={exclusions} onChange={setExclusions} rows={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Package rules & regulations</label>
              <p className="text-xs text-muted-foreground">
                Enter each rule on a new line. These appear under What&apos;s included on the website.
              </p>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={6}
                placeholder="e.g. Valid ID required for all travellers&#10;Check-in after 2 PM"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm resize-y"
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-border pb-2">
              <h2 className="text-lg font-semibold">Media</h2>
            </div>
            <ImageUploader
              label="Package gallery (1 main + up to 4)"
              hint="First image is the main hero on the left; the next four appear as thumbnails on the right."
              multiple
              maxFiles={MAX_GALLERY_IMAGES}
              value={gallery}
              onChange={setGallery}
            />
          </section>

          <section className="space-y-4">
            <div className="border-b border-border pb-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Daywise Hotel Plan</h2>
              <button
                type="button"
                onClick={addHotel}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add day plan entry
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
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Entry {i + 1}
                      </span>
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
                              {inv.name}
                              {inv.location !== "Unknown" ? ` (${inv.location})` : ""}
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

                <button
                  type="button"
                  onClick={addHotel}
                  className="w-full py-3 border border-dashed border-border rounded-lg text-sm font-medium text-primary hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Day {nextDayNumber} plan entry
                </button>
              </div>
            )}
          </section>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !title || !destinationId || !tripType}
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSaving
                ? "Saving & publishing..."
                : editId
                  ? "Update package and publish package"
                  : "Create package and publish package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
