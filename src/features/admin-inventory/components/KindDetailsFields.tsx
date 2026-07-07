"use client";

import type { InventoryItem } from "../types";
import { InventoryKind } from "../constants";

interface KindDetailsFieldsProps {
  kind: InventoryKind;
  details: InventoryItem["details"];
  onChange: (details: InventoryItem["details"]) => void;
  destinations: { id: string; name: string }[];
  countries?: { id: string; name: string }[];
}

export function KindDetailsFields({ kind, details, onChange, destinations, countries = [] }: KindDetailsFieldsProps) {
  if (kind === InventoryKind.HOTEL) {
    const d = details as Extract<InventoryItem, { kind: "HOTEL" }>["details"];
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Star rating</label>
          <input
            type="number"
            min={1}
            max={5}
            value={d.starRating}
            onChange={(e) => onChange({ ...d, starRating: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            value={d.address}
            onChange={(e) => onChange({ ...d, address: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>
    );
  }

  if (kind === InventoryKind.FLIGHT) {
    const d = details as Extract<InventoryItem, { kind: "FLIGHT" }>["details"];
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Origin (IATA)</label>
          <input
            maxLength={3}
            value={d.originAirportCode}
            onChange={(e) => onChange({ ...d, originAirportCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Destination (IATA)</label>
          <input
            maxLength={3}
            value={d.destinationAirportCode}
            onChange={(e) => onChange({ ...d, destinationAirportCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono"
          />
        </div>
      </div>
    );
  }

  if (kind === InventoryKind.ACTIVITY) {
    const d = details as Extract<InventoryItem, { kind: "ACTIVITY" }>["details"];
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={d.durationMinutes}
            onChange={(e) => onChange({ ...d, durationMinutes: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            value={d.category}
            onChange={(e) => onChange({ ...d, category: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>
    );
  }

  if (kind === InventoryKind.TRANSFER) {
    const d = details as Extract<InventoryItem, { kind: "TRANSFER" }>["details"];
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mode</label>
          <select
            value={d.mode}
            onChange={(e) => onChange({ ...d, mode: e.target.value as "FERRY" | "ROAD" })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="ROAD">Road</option>
            <option value="FERRY">Ferry</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Origin destination</label>
          <select
            value={d.originDestinationId}
            onChange={(e) => onChange({ ...d, originDestinationId: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">Select</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target destination</label>
          <select
            value={d.targetDestinationId}
            onChange={(e) => onChange({ ...d, targetDestinationId: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">Select</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (kind === InventoryKind.VISA) {
    const d = details as Extract<InventoryItem, { kind: "VISA" }>["details"];
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Country ID</label>
          <select
            value={d.countryId}
            onChange={(e) => onChange({ ...d, countryId: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Visa type</label>
          <select
            value={d.visaType}
            onChange={(e) => onChange({ ...d, visaType: e.target.value as typeof d.visaType })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="TOURIST">Tourist</option>
            <option value="BUSINESS">Business</option>
            <option value="TRANSIT">Transit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Entry type</label>
          <select
            value={d.entryType}
            onChange={(e) => onChange({ ...d, entryType: e.target.value as typeof d.entryType })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="SINGLE">Single</option>
            <option value="MULTIPLE">Multiple</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Processing days</label>
          <input
            type="number"
            min={0}
            value={d.processingDays}
            onChange={(e) => onChange({ ...d, processingDays: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Validity days</label>
          <input
            type="number"
            min={1}
            value={d.validityDays}
            onChange={(e) => onChange({ ...d, validityDays: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
      </div>
    );
  }

  const d = details as Extract<InventoryItem, { kind: "INSURANCE" }>["details"];
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1">Provider name</label>
        <input
          value={d.providerName}
          onChange={(e) => onChange({ ...d, providerName: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Coverage amount</label>
        <input
          type="number"
          min={1}
          value={d.coverageAmount}
          onChange={(e) => onChange({ ...d, coverageAmount: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <input
          maxLength={3}
          value={d.currencyCode}
          onChange={(e) => onChange({ ...d, currencyCode: e.target.value.toUpperCase() })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Term (days)</label>
        <input
          type="number"
          min={1}
          value={d.termDays}
          onChange={(e) => onChange({ ...d, termDays: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
      </div>
    </div>
  );
}
