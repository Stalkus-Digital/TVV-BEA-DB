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
  refundable: boolean;
  description: string;
  rules: string;
  images: (File | string)[];
}

export function createEmptyRoomDraft(): HotelRoomDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "",
    capacity: 2,
    price: 0,
    discountPrice: 0,
    extraPersonCharge: 0,
    refundable: false,
    description: "",
    rules: "",
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
                    value={room.capacity || ""}
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
                    value={room.price || ""}
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
                    value={room.discountPrice || ""}
                    onChange={(e) => updateRoom(index, { discountPrice: Number(e.target.value) || 0 })}
                    placeholder="6317"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Extra person charge (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={room.extraPersonCharge || ""}
                    onChange={(e) => updateRoom(index, { extraPersonCharge: Number(e.target.value) || 0 })}
                    placeholder="2016"
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <DescriptionEditor
                label="Description"
                value={room.description}
                onChange={(value) => updateRoom(index, { description: value })}
                rows={4}
              />

              <DescriptionEditor
                label="Rules description"
                value={room.rules}
                onChange={(value) => updateRoom(index, { rules: value })}
                rows={3}
              />

              <ImageUploader
                label="Room images"
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
