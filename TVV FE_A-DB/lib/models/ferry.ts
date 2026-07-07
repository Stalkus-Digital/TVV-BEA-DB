/**
 * Ferry domain model — Andaman ferry booking.
 *
 * This model is shaped for the existing backend ferry API. The frontend should
 * NOT depend on raw operator responses — services/ferry.service.ts adapts to
 * this shape.
 */

export type FerryOperator = "makruzz" | "green-ocean" | "itt" | "nautika";
export type FerryClass = "economy" | "premium" | "deluxe" | "royal" | "bunk" | "cabin" | "first-class";

export interface FerryPort {
  code: "PB" | "HV" | "NL" | string;
  name: "Port Blair" | "Havelock" | "Neil" | string;
  city?: string;
}

export interface FerrySchedule {
  /** Composite key, e.g. "makruzz-PB-HV-08:00". */
  scheduleId: string;
  operator: FerryOperator;
  operatorName: string;
  from: FerryPort;
  to: FerryPort;
  departureTime: string; // "HH:mm"
  arrivalTime: string;   // "HH:mm"
  durationMinutes: number;
  classes: FerryClass[];
  startingPrice: number;
  currency: "INR";
  daysOfWeek?: number[]; // 0-6, Sun-Sat. Empty/undefined = daily.
  note?: string;
}

export interface FerryRoute {
  slug: string;             // e.g. "port-blair-to-havelock"
  from: FerryPort;
  to: FerryPort;
  /** Average crossing time in minutes for the route, across operators. */
  averageCrossingMinutes: number;
  /** Lowest available starting price across operators on this route. */
  startingPrice: number;
  currency: "INR";
  operators: FerryOperator[];
  popular?: boolean;
}

export interface FerryAvailability {
  scheduleId: string;
  date: string;             // "YYYY-MM-DD"
  seatsAvailable: number;
  classes: {
    class: FerryClass;
    seatsAvailable: number;
    price: number;
  }[];
}

export interface FerrySearchInput {
  from: string;
  to: string;
  date: string;             // "YYYY-MM-DD"
  adults?: number;
  children?: number;
}

export interface FerrySearchResult {
  schedule: FerrySchedule;
  availability: FerryAvailability;
}
