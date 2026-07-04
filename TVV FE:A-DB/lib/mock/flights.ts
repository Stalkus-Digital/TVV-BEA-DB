import type { Airline, Airport, FlightItinerary } from "@/lib/models";

export const airportsMock: Airport[] = [
  { code: "BLR", name: "Kempegowda International", city: "Bengaluru", countryCode: "IN" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", countryCode: "IN" },
  { code: "DEL", name: "Indira Gandhi International", city: "New Delhi", countryCode: "IN" },
  { code: "MAA", name: "Chennai International", city: "Chennai", countryCode: "IN" },
  { code: "IXZ", name: "Veer Savarkar International", city: "Port Blair", countryCode: "IN" },
  { code: "GOI", name: "Dabolim", city: "Goa", countryCode: "IN" },
  { code: "DXB", name: "Dubai International", city: "Dubai", countryCode: "AE" },
  { code: "SIN", name: "Changi", city: "Singapore", countryCode: "SG" },
  { code: "NRT", name: "Narita", city: "Tokyo", countryCode: "JP" },
  { code: "DPS", name: "Ngurah Rai", city: "Denpasar", countryCode: "ID" },
  { code: "MLE", name: "Velana International", city: "Malé", countryCode: "MV" },
  { code: "ZRH", name: "Zurich", city: "Zurich", countryCode: "CH" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", countryCode: "TH" },
];

const indigo: Airline = { code: "6E", name: "IndiGo" };
const airIndia: Airline = { code: "AI", name: "Air India" };
const vistara: Airline = { code: "UK", name: "Vistara" };
const emirates: Airline = { code: "EK", name: "Emirates" };
const singapore: Airline = { code: "SQ", name: "Singapore Airlines" };

const airport = (code: string) => airportsMock.find((a) => a.code === code)!;

/** Sample itineraries returned by the mock flights search. */
export const flightItinerariesMock: FlightItinerary[] = [
  {
    itineraryId: "I-BLR-IXZ-6E-0823",
    singleAirline: true,
    legs: [
      {
        legId: "L1",
        stops: 1,
        totalDurationMinutes: 235,
        segments: [
          {
            segmentId: "S1",
            airline: indigo,
            flightNumber: "6E 2483",
            from: airport("BLR"),
            to: airport("MAA"),
            departure: "2026-06-12T05:25:00+05:30",
            arrival: "2026-06-12T06:30:00+05:30",
            durationMinutes: 65,
            cabin: "economy",
            baggageKg: 15,
          },
          {
            segmentId: "S2",
            airline: indigo,
            flightNumber: "6E 1077",
            from: airport("MAA"),
            to: airport("IXZ"),
            departure: "2026-06-12T08:00:00+05:30",
            arrival: "2026-06-12T10:20:00+05:30",
            durationMinutes: 140,
            cabin: "economy",
            baggageKg: 15,
          },
        ],
      },
    ],
    fare: { totalPrice: 11680, basePrice: 9650, taxes: 2030, currency: "INR", refundable: false },
  },
  {
    itineraryId: "I-BOM-IXZ-AI-0641",
    singleAirline: true,
    legs: [
      {
        legId: "L1",
        stops: 1,
        totalDurationMinutes: 380,
        segments: [
          {
            segmentId: "S1",
            airline: airIndia,
            flightNumber: "AI 562",
            from: airport("BOM"),
            to: airport("MAA"),
            departure: "2026-06-12T06:40:00+05:30",
            arrival: "2026-06-12T08:30:00+05:30",
            durationMinutes: 110,
            cabin: "economy",
            baggageKg: 20,
          },
          {
            segmentId: "S2",
            airline: airIndia,
            flightNumber: "AI 1041",
            from: airport("MAA"),
            to: airport("IXZ"),
            departure: "2026-06-12T11:20:00+05:30",
            arrival: "2026-06-12T13:00:00+05:30",
            durationMinutes: 100,
            cabin: "economy",
            baggageKg: 20,
          },
        ],
      },
    ],
    fare: { totalPrice: 13420, basePrice: 11200, taxes: 2220, currency: "INR", refundable: true, fareType: "publish" },
  },
  {
    itineraryId: "I-DEL-DPS-6E-Direct",
    singleAirline: true,
    legs: [
      {
        legId: "L1",
        stops: 0,
        totalDurationMinutes: 480,
        segments: [
          {
            segmentId: "S1",
            airline: indigo,
            flightNumber: "6E 41",
            from: airport("DEL"),
            to: airport("DPS"),
            departure: "2026-08-22T22:35:00+05:30",
            arrival: "2026-08-23T08:35:00+08:00",
            durationMinutes: 480,
            cabin: "economy",
            baggageKg: 25,
          },
        ],
      },
    ],
    fare: { totalPrice: 38240, basePrice: 31400, taxes: 6840, currency: "INR", refundable: false },
  },
  {
    itineraryId: "I-BLR-NRT-SQ-via-SIN",
    singleAirline: true,
    legs: [
      {
        legId: "L1",
        stops: 1,
        totalDurationMinutes: 720,
        segments: [
          {
            segmentId: "S1",
            airline: singapore,
            flightNumber: "SQ 509",
            from: airport("BLR"),
            to: airport("SIN"),
            departure: "2026-09-04T01:05:00+05:30",
            arrival: "2026-09-04T08:55:00+08:00",
            durationMinutes: 280,
            cabin: "business",
            baggageKg: 32,
          },
          {
            segmentId: "S2",
            airline: singapore,
            flightNumber: "SQ 638",
            from: airport("SIN"),
            to: airport("NRT"),
            departure: "2026-09-04T11:10:00+08:00",
            arrival: "2026-09-04T19:35:00+09:00",
            durationMinutes: 440,
            cabin: "business",
            baggageKg: 32,
          },
        ],
      },
    ],
    fare: { totalPrice: 215800, basePrice: 184000, taxes: 31800, currency: "INR", refundable: true, fareType: "publish" },
  },
  {
    itineraryId: "I-BOM-DXB-EK-Direct",
    singleAirline: true,
    legs: [
      {
        legId: "L1",
        stops: 0,
        totalDurationMinutes: 195,
        segments: [
          {
            segmentId: "S1",
            airline: emirates,
            flightNumber: "EK 501",
            from: airport("BOM"),
            to: airport("DXB"),
            departure: "2026-07-15T04:25:00+05:30",
            arrival: "2026-07-15T06:00:00+04:00",
            durationMinutes: 195,
            cabin: "economy",
            baggageKg: 30,
          },
        ],
      },
    ],
    fare: { totalPrice: 24800, basePrice: 19400, taxes: 5400, currency: "INR", refundable: false },
  },
  {
    itineraryId: "I-DEL-ZRH-UK-via-EK",
    singleAirline: false,
    legs: [
      {
        legId: "L1",
        stops: 1,
        totalDurationMinutes: 720,
        segments: [
          {
            segmentId: "S1",
            airline: vistara,
            flightNumber: "UK 25",
            from: airport("DEL"),
            to: airport("DXB"),
            departure: "2026-10-05T04:30:00+05:30",
            arrival: "2026-10-05T06:55:00+04:00",
            durationMinutes: 205,
            cabin: "premium-economy",
            baggageKg: 35,
          },
          {
            segmentId: "S2",
            airline: emirates,
            flightNumber: "EK 87",
            from: airport("DXB"),
            to: airport("ZRH"),
            departure: "2026-10-05T08:40:00+04:00",
            arrival: "2026-10-05T13:25:00+02:00",
            durationMinutes: 405,
            cabin: "premium-economy",
            baggageKg: 35,
          },
        ],
      },
    ],
    fare: { totalPrice: 142400, basePrice: 121600, taxes: 20800, currency: "INR", refundable: true },
  },
];
