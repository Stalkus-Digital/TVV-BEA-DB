"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageUploader } from "./ImageUploader";
import { RatingComponent } from "./RatingComponent";
import { HotelRoomFields, type HotelRoomDraft } from "./HotelRoomFields";
import { useDestinationsQuery } from "@/features/admin-quotes/hooks/useDestinationsQuery";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { uploadFiles } from "@/lib/admin-api/upload";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function resolveRoomImages(rooms: HotelRoomDraft[]) {
  const resolved = [];
  for (const room of rooms) {
    if (!room.name.trim()) continue;
    const existingUrls = room.images.filter((item): item is string => typeof item === "string");
    const newFiles = room.images.filter((item): item is File => item instanceof File);
    let uploaded: string[] = [];
    if (newFiles.length > 0) {
      const results = await uploadFiles(newFiles, "GALLERY_IMAGE");
      uploaded = results.map((r) => r.url);
    }
    const ordered: string[] = [];
    let uploadIdx = 0;
    for (const item of room.images) {
      if (typeof item === "string") ordered.push(item);
      else if (uploadIdx < uploaded.length) ordered.push(uploaded[uploadIdx++]);
    }
    resolved.push({
      id: room.id,
      name: room.name.trim(),
      category: room.category.trim() || undefined,
      capacity: room.capacity || 1,
      price: room.price || 0,
      discountPrice: room.discountPrice > 0 ? room.discountPrice : null,
      extraPersonCharge: room.extraPersonCharge > 0 ? room.extraPersonCharge : null,
      refundable: room.refundable,
      description: room.description || undefined,
      rules: room.rules || undefined,
      images: ordered.length > 0 ? ordered : existingUrls,
    });
  }
  return resolved;
}

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
  const [bannerImage, setBannerImage] = useState<(File | string)[]>([]);
  const [hotelImages, setHotelImages] = useState<(File | string)[]>([]);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<HotelRoomDraft[]>([]);

  const [isLoading, setIsLoading] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editId) {
      adminApiClient
        .get<any>(`${adminEndpoints.inventory}/${editId}`)
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
            setExistingSlug(data.details?.slug || null);
            setBannerImage(data.details?.bannerImage ? [data.details.bannerImage] : []);
            setHotelImages(Array.isArray(data.details?.images) ? data.details.images : []);
            const rooms = Array.isArray(data.details?.roomTypes) ? data.details.roomTypes : [];
            setRoomTypes(
              rooms.map((room: any) => ({
                id: room.id || crypto.randomUUID(),
                name: room.name || "",
                category: room.category || "",
                capacity: Number(room.capacity) || 2,
                price: Number(room.price) || 0,
                discountPrice: Number(room.discountPrice) || 0,
                extraPersonCharge: Number(room.extraPersonCharge) || 0,
                refundable: Boolean(room.refundable),
                description: room.description || "",
                rules: room.rules || "",
                images: Array.isArray(room.images) ? room.images : [],
              })),
            );
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
      const bannerFiles = bannerImage.filter((item): item is File => item instanceof File);
      const existingBanner = bannerImage.find((item): item is string => typeof item === "string") ?? null;
      let uploadedBannerUrls: string[] = [];
      if (bannerFiles.length > 0) {
        const results = await uploadFiles(bannerFiles, "GALLERY_IMAGE");
        uploadedBannerUrls = results.map((r) => r.url);
      }

      const hotelImageFiles = hotelImages.filter((item): item is File => item instanceof File);
      const existingHotelUrls = hotelImages.filter((item): item is string => typeof item === "string");
      let uploadedHotelUrls: string[] = [];
      if (hotelImageFiles.length > 0) {
        const results = await uploadFiles(hotelImageFiles, "GALLERY_IMAGE");
        uploadedHotelUrls = results.map((r) => r.url);
      }
      const orderedHotelImages: string[] = [];
      let hotelUploadIdx = 0;
      for (const item of hotelImages) {
        if (typeof item === "string") orderedHotelImages.push(item);
        else if (hotelUploadIdx < uploadedHotelUrls.length) orderedHotelImages.push(uploadedHotelUrls[hotelUploadIdx++]);
      }

      const resolvedRooms = await resolveRoomImages(roomTypes);
      const slug =
        existingSlug ||
        `${slugify(name) || "hotel"}-${Math.random().toString(36).slice(2, 7)}`;

      const details = {
        rating,
        shortDescription,
        longDescription,
        points,
        policies,
        rules,
        slug,
        bannerImage: uploadedBannerUrls[0] ?? existingBanner,
        images: orderedHotelImages.length > 0 ? orderedHotelImages : existingHotelUrls,
        roomTypes: resolvedRooms,
      };

      const payload = {
        kind: "HOTEL",
        title: name,
        destinationId: location || undefined,
        status: "ACTIVE",
        details,
      };

      let res: any;
      if (editId) {
        res = await adminApiClient.patch(`${adminEndpoints.inventory}/${editId}`, payload);
      } else {
        res = await adminApiClient.post(adminEndpoints.inventory, payload);
        // Create always persists as DRAFT in inventory service — publish immediately.
        if (res?.id) {
          await adminApiClient.patch(`${adminEndpoints.inventory}/${res.id}`, {
            status: "ACTIVE",
            details,
          });
        }
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
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
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

            <DescriptionEditor label="Short Description" value={shortDescription} onChange={setShortDescription} rows={4} />
            <DescriptionEditor label="Long Description" value={longDescription} onChange={setLongDescription} rows={8} />
            <DescriptionEditor label="Points" value={points} onChange={setPoints} rows={5} />
            <DescriptionEditor label="Policies" value={policies} onChange={setPolicies} rows={5} />
            <DescriptionEditor label="Rules" value={rules} onChange={setRules} rows={5} />

            <div className="space-y-6">
              <ImageUploader label="Banner Image" multiple={false} value={bannerImage} onChange={setBannerImage} />
              <ImageUploader label="Hotel Images" multiple={true} value={hotelImages} onChange={setHotelImages} />
            </div>

            <HotelRoomFields rooms={roomTypes} onChange={setRoomTypes} />

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
