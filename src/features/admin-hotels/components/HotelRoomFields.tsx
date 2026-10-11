"use client";

import { Trash2, Plus } from "lucide-react";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageUploader } from "./ImageUploader";

export interface HotelRoomDraft {
  id: string;
  name: string;
  category: string;
  capacity: number;
  price: number;
  discountPrice: number;
  extraPersonCharge: number;
  childPrice: number;
  rateplanType: string;
  validityStartDate: string;
  validityEndDate: string;
  validityDays: string[];
  sellRateSingle: number;
  sellRateDouble: number;
  sellRateTriple: number;
  sellRateQuad: number;
  extraAdultRate: number;
  extraChildRate: number;
  infantRate: number;
  refundable: boolean;
  description: string;
  rules: string;
  /** Comma-separated in the form; split into string[] on save (see resolveRoomImages). */
  amenities: string;
  images: (File | string)[];
}

/**
 * crypto.randomUUID() is only exposed in secure contexts (HTTPS/localhost) —
 * calling it directly threw an uncaught TypeError on any plain-HTTP admin
 * deployment, which is what made "Add room" appear to crash. Falls back to
 * a non-cryptographic but perfectly adequate client-side draft id.
 */
export function generateDraftId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyRoomDraft(): HotelRoomDraft {
  return {
    id: generateDraftId(),
    name: "",
    category: "",
    capacity: 2,
    price: 0,
    discountPrice: 0,
    extraPersonCharge: 0,
    childPrice: 0,
    rateplanType: "BREAKFAST",
    validityStartDate: "",
    validityEndDate: "",
    validityDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    sellRateSingle: 0,
    sellRateDouble: 0,
    sellRateTriple: 0,
    sellRateQuad: 0,
    extraAdultRate: 0,
    extraChildRate: 0,
    infantRate: 0,
    refundable: false,
    description: "",
    rules: "",
    amenities: "",
    images: [],
  };
}

interface HotelRoomFieldsProps {
  rooms: HotelRoomDraft[];
  onChange: (rooms: HotelRoomDraft[]) => void;
}

export function HotelRoomFields({ rooms, onChange }: HotelRoomFieldsProps) {
  const updateRoom = (index: number, patch: Partial<HotelRoomDraft>) => {
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  };

  const removeRoom = (index: number) => {
    onChange(rooms.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-lg font-semibold">Rooms</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add room types shown on the public hotel page (Cottage, Deluxe, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...rooms, createEmptyRoomDraft()])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add room
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No rooms yet. Click “Add room” to start.</p>
      ) : (
        <div className="space-y-6">
          {rooms.map((room, index) => (
            <div key={room.id} className="rounded-xl border border-border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Room {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeRoom(index)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room type</label>
                  <input
                    value={room.name}
                    onChange={(e) => updateRoom(index, { name: e.target.value })}
                    placeholder="Cottage / Deluxe / custom"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    value={room.category}
                    onChange={(e) => updateRoom(index, { category: e.target.value })}
                    placeholder="nature view / custom"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room capacity (guests)</label>
                  <input
                    type="number"
                    min={1}
                    value={room.capacity ?? ""}
                    onChange={(e) => updateRoom(index, { capacity: Number(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Refundable</label>
                  <select
                    value={room.refundable ? "yes" : "no"}
                    onChange={(e) => updateRoom(index, { refundable: e.target.value === "yes" })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={room.price ?? ""}
                    onChange={(e) => updateRoom(index, { price: Number(e.target.value) || 0 })}
                    placeholder="7500"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={room.discountPrice ?? ""}
                    onChange={(e) => updateRoom(index, { discountPrice: Number(e.target.value) || 0 })}
                    placeholder="6317"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Extra person charge (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={room.extraPersonCharge ?? ""}
                    onChange={(e) => updateRoom(index, { extraPersonCharge: Number(e.target.value) || 0 })}
                    placeholder="2016"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Child charge 5-11 yrs (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={room.childPrice ?? ""}
                    onChange={(e) => updateRoom(index, { childPrice: Number(e.target.value) || 0 })}
                    placeholder="1000"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2 pt-4 border-t border-border mt-2">
                  <h4 className="text-sm font-semibold text-slate-800">Rate Configuration</h4>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rateplan Type</label>
                  <select
                    value={room.rateplanType || "BREAKFAST"}
                    onChange={(e) => updateRoom(index, { rateplanType: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="BREAKFAST">BREAKFAST</option>
                    <option value="BREAKFAST LUNCH">BREAKFAST LUNCH</option>
                    <option value="BREAKFAST LUNCH DINNER">BREAKFAST LUNCH DINNER</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium block">Validity</label>
                  <div className="flex gap-4">
                    <input
                      type="date"
                      value={room.validityStartDate || ""}
                      onChange={(e) => updateRoom(index, { validityStartDate: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={room.validityEndDate || ""}
                      onChange={(e) => updateRoom(index, { validityEndDate: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                      placeholder="End date"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-sm font-medium">Days</label>
                    <div className="space-x-2">
                      <button type="button" onClick={() => updateRoom(index, { validityDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] })} className="text-xs text-blue-600 hover:underline">select all</button>
                      <button type="button" onClick={() => updateRoom(index, { validityDays: [] })} className="text-xs text-blue-600 hover:underline">clear all</button>
                    </div>
                  </div>
                  <div className="flex border border-border rounded-lg overflow-hidden w-fit">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isSelected = room.validityDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = isSelected
                              ? (room.validityDays || []).filter((d) => d !== day)
                              : [...(room.validityDays || []), day];
                            updateRoom(index, { validityDays: newDays });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium border-r border-border last:border-r-0 transition-colors ${isSelected ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2 pt-4 border-t border-border mt-2">
                  <h4 className="text-sm font-semibold text-slate-800">Sell Rate</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Single</label>
                      <input type="number" min={0} value={room.sellRateSingle || ""} onChange={(e) => updateRoom(index, { sellRateSingle: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Double</label>
                      <input type="number" min={0} value={room.sellRateDouble || ""} onChange={(e) => updateRoom(index, { sellRateDouble: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Triple</label>
                      <input type="number" min={0} value={room.sellRateTriple || ""} onChange={(e) => updateRoom(index, { sellRateTriple: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Quad</label>
                      <input type="number" min={0} value={room.sellRateQuad || ""} onChange={(e) => updateRoom(index, { sellRateQuad: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Extra Adult</label>
                      <input type="number" min={0} value={room.extraAdultRate || ""} onChange={(e) => updateRoom(index, { extraAdultRate: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Extra Child</label>
                      <input type="number" min={0} value={room.extraChildRate || ""} onChange={(e) => updateRoom(index, { extraChildRate: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Infant Rate</label>
                      <input type="number" min={0} value={room.infantRate || 0} onChange={(e) => updateRoom(index, { infantRate: Number(e.target.value) || 0 })} className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <DescriptionEditor
                label="Description"
                value={room.description}
                onChange={(value) => updateRoom(index, { description: value })}
                rows={4}
              />


              <div className="space-y-2">
                <label className="text-sm font-medium">Amenities</label>
                <input
                  value={room.amenities}
                  onChange={(e) => updateRoom(index, { amenities: e.target.value })}
                  placeholder="Wi-Fi, AC, Sea view, Balcony (comma-separated)"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>

              <ImageUploader
                label={`Room ${index + 1} images`}
                multiple
                value={room.images}
                onChange={(files) => updateRoom(index, { images: files })}
                hint="Scrolling gallery images for this room type"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
