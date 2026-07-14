"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageUploader } from "./ImageUploader";
import { RatingComponent } from "./RatingComponent";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { uploadFiles } from "@/lib/admin-api/upload";

export function HotelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const destinationsQuery = useDestinationsQuery();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [points, setPoints] = useState("");
  const [policies, setPolicies] = useState("");
  const [rules, setRules] = useState("");
  const [bannerImage, setBannerImage] = useState<File[]>([]);
  const [hotelImages, setHotelImages] = useState<File[]>([]);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      adminApiClient.get<any>(`${adminEndpoints.inventory}/${editId}`)
        .then((data) => {
          if (data) {
            setName(data.title || "");
            setLocation(data.destinationId || "");
            setRating(data.details?.rating || data.details?.starRating || 0);
            setShortDescription(data.details?.shortDescription || "");
            setLongDescription(data.details?.longDescription || "");
            setPoints(data.details?.points || "");
            setPolicies(data.details?.policies || "");
            setRules(data.details?.rules || "");
            setExistingBannerUrl(data.details?.bannerImage || null);
            setExistingImageUrls(data.details?.images || []);
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
      let uploadedBannerUrls: string[] = [];
      if (bannerImage.length > 0) {
        const results = await uploadFiles(bannerImage, "GALLERY_IMAGE");
        uploadedBannerUrls = results.map(r => r.url);
      }

      let uploadedHotelUrls: string[] = [];
      if (hotelImages.length > 0) {
        const results = await uploadFiles(hotelImages, "GALLERY_IMAGE");
        uploadedHotelUrls = results.map(r => r.url);
      }

      const payload = {
        kind: "HOTEL",
        title: name,
        destinationId: location || undefined,
        status: "ACTIVE",
        details: {
          rating,
          shortDescription,
          longDescription,
          points,
          policies,
          rules,
          bannerImage: bannerImage.length > 0 ? uploadedBannerUrls[0] : existingBannerUrl,
          images: hotelImages.length > 0 ? uploadedHotelUrls : existingImageUrls,
        }
      };

      let res;
      if (editId) {
        res = await adminApiClient.patch(`${adminEndpoints.inventory}/${editId}`, payload);
      } else {
        res = await adminApiClient.post(adminEndpoints.inventory, payload);
      }

      if (!res) throw new Error(`Failed to ${editId ? "update" : "create"} hotel`);

      router.push("/itinerary/hotels");
      alert(`Hotel ${editId ? "Updated" : "Created"} Successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Error ${editId ? "updating" : "creating"} hotel`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8">
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-white">
          <Link href="/itinerary/hotels" className="text-xs text-muted-foreground hover:text-foreground mb-2 block">
            ← Back to hotels
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{editId ? "Edit Hotel Property" : "Create New Hotel"}</h1>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading hotel data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hotel Name"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm bg-white"
                >
                  <option value="">Select location</option>
                  {destinationsQuery.data?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="pt-1">
                  <RatingComponent rating={rating} onChange={setRating} />
                </div>
              </div>
            </div>

            {/* Editors */}
            <DescriptionEditor
              label="Short Description"
              value={shortDescription}
              onChange={setShortDescription}
              rows={4}
            />

            <DescriptionEditor
              label="Long Description"
              value={longDescription}
              onChange={setLongDescription}
              rows={8}
            />

            <DescriptionEditor
              label="Points"
              value={points}
              onChange={setPoints}
              rows={5}
            />

            <DescriptionEditor
              label="Policies"
              value={policies}
              onChange={setPolicies}
              rows={5}
            />

            <DescriptionEditor
              label="Rules"
              value={rules}
              onChange={setRules}
              rows={5}
            />

            {/* Media */}
            <div className="space-y-6">
              <ImageUploader
                label="Banner Image"
                multiple={false}
                value={bannerImage}
                onChange={setBannerImage}
              />
              <ImageUploader
                label="Hotel Images"
                multiple={true}
                value={hotelImages}
                onChange={setHotelImages}
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !name || !location}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving..." : editId ? "Update Hotel" : "Create Hotel"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
