"use client";

import { Check, X } from "lucide-react";

interface InclusionsExclusionsProps {
  inclusions?: string[];
  exclusions?: string[];
}

export function InclusionsExclusions({ inclusions: customInclusions, exclusions: customExclusions }: InclusionsExclusionsProps) {
  const defaultInclusions = [
    "Resort / Houseboat stays",
    "Private transfers",
    "Houseboat cruise & hill station tours",
    "Tea garden visits & wildlife safaris"
  ];

  const defaultExclusions = [
    "Flights / Trains",
    "Personal expenses",
    "Insurance"
  ];

  const inclusions = customInclusions && customInclusions.length > 0 ? customInclusions : defaultInclusions;
  const exclusions = customExclusions && customExclusions.length > 0 ? customExclusions : defaultExclusions;

  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-4">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
            Package Inclusions
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">What You Get</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Inclusions Card */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-wa/5 border-2 border-wa/20 relative overflow-hidden group hover:border-wa transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-wa/20 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-wa text-white shadow-md shadow-wa/30">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Included</h3>
            </div>
            
            <ul className="space-y-5 relative z-10">
              {inclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-wa/10 text-wa mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions Card */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-red-500/5 border-2 border-slate-100 relative overflow-hidden group hover:border-red-200 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-500 shadow-sm border border-slate-200">
                <X className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Not Included</h3>
            </div>
            
            <ul className="space-y-5 relative z-10">
              {exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-400 mt-0.5 border border-slate-200">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-600 font-medium text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
