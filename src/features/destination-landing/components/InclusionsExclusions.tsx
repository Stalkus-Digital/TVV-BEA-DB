import { CheckCircle2, XCircle } from "lucide-react";

interface InclusionsExclusionsProps {
  inclusions?: string[];
  exclusions?: string[];
}

export function InclusionsExclusions({ inclusions: customInclusions, exclusions: customExclusions }: InclusionsExclusionsProps) {
  const defaultInclusions = [
    "Accommodation (as per chosen category)",
    "Daily Breakfast",
    "All inter-island ferry tickets",
    "Airport & hotel transfers",
    "Sightseeing as per itinerary",
    "All entry fees & permits"
  ];

  const defaultExclusions = [
    "Airfare to/from Port Blair",
    "Lunch & Dinner",
    "Personal expenses",
    "Water sports (scuba, snorkeling)",
    "Travel Insurance"
  ];

  const inclusions = customInclusions && customInclusions.length > 0 ? customInclusions : defaultInclusions;
  const exclusions = customExclusions && customExclusions.length > 0 ? customExclusions : defaultExclusions;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-2">Package Inclusions</p>
          <h2 className="text-3xl font-bold text-slate-900">What You Get</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Inclusions Card */}
          <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-emerald-900">Included</h3>
            </div>
            <ul className="space-y-4">
              {inclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-emerald-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions Card */}
          <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Not Included</h3>
            </div>
            <ul className="space-y-4">
              {exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
