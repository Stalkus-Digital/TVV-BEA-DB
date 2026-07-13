"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { DescriptionEditor } from "@/features/admin-hotels/components/DescriptionEditor";
import { ImageUploader } from "@/features/admin-hotels/components/ImageUploader";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { uploadFiles } from "@/lib/admin-api/upload";
import { ArrowLeft } from "lucide-react";

export function ActivityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const destinationsQuery = useDestinationsQuery();

  const [name, setName] = useState("");
  const [starterPrice, setStarterPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      adminApiClient.get<any>(`${adminEndpoints.inventory}/${editId}`)
        .then((data) => {
          if (data) {
            setName(data.title || "");
            setLocation(data.destinationId || "");
            setStarterPrice(data.details?.starterPrice?.toString() || data.details?.adultPrice?.toString() || "");
            setOfferPrice(data.details?.offerPrice?.toString() || "");
            setDescription(data.details?.description || "");
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        const results = await uploadFiles(images, "GALLERY_IMAGE");
        uploadedImageUrls = results.map(r => r.url);
      }

      const payload = {
        kind: "ACTIVITY",
        title: name,
        destinationId: location || undefined,
        status: "ACTIVE",
        details: {
          starterPrice: Number(starterPrice) || 0,
          offerPrice: Number(offerPrice) || 0,
          description,
          images: uploadedImageUrls,
        }
      };

      let res;
      if (editId) {
        res = await adminApiClient.patch(`${adminEndpoints.inventory}/${editId}`, payload);
      } else {
        res = await adminApiClient.post(adminEndpoints.inventory, payload);
      }

      if (!res) throw new Error(`Failed to ${editId ? "update" : "create"} activity`);

      router.push("/itinerary/activities");
      // Optional success toast here
    } catch (error) {
      console.error(error);
      alert(`Error ${editId ? "updating" : "creating"} activity`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto w-full p-4 md:p-6 lg:p-8">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-3">
          <Link href="/itinerary/activities" className="text-slate-500 hover:text-slate-900 transition-colors p-1 -ml-2 rounded-md hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {editId ? "Edit Activity" : "Create New Activity"}
          </h1>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading activity data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Activity Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. City Tour"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Starter Price Per Person</label>
                <input
                  type="number"
                  min="0"
                  value={starterPrice}
                  onChange={(e) => setStarterPrice(e.target.value)}
                  placeholder="e.g. 1000"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Offer Price Per Person</label>
                <input
                  type="number"
                  min="0"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="e.g. 800"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors text-sm bg-white"
              >
                <option value="">Select a location</option>
                {destinationsQuery.data?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <DescriptionEditor
                label="Description"
                value={description}
                onChange={setDescription}
                rows={8}
              />
            </div>

            <div className="pt-2">
              <ImageUploader
                label="Upload Images"
                multiple={true}
                value={images}
                onChange={setImages}
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !name || !location || !starterPrice}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving..." : editId ? "Update Activity" : "Create Activity"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
