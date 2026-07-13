import Link from "next/link";
import { CheckCircle2, Phone, Star } from "lucide-react";
import type { Destination } from "@/modules/destination";

interface DestinationHeroProps {
  destination: Destination;
  heroImage: string;
}

export function DestinationHero({ destination, heroImage }: DestinationHeroProps) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="container relative z-10 mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center text-white mt-12">
        {/* Left Column: Copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-md">
            <span>✨ {destination.name.toUpperCase()} ISLANDS</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
            {destination.name} Holiday <br />
            Packages <br />
            <span className="text-amber-400">Starting ₹10,500</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-200 max-w-xl">
            All-inclusive {destination.name} trips with stays, ferries, transfers & local support. 
            Get your <span className="font-semibold text-white">custom itinerary in 10 minutes</span> with up to 40% OFF.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Get Itinerary on WhatsApp
            </button>
            <button className="rounded-md bg-transparent px-6 py-3 text-sm font-semibold text-white border border-white hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call Now
            </button>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-white/20 mt-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <p className="font-bold">4.8</p>
                <p className="text-xs text-slate-300">TripAdvisor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <p className="font-bold">4.9</p>
                <p className="text-xs text-slate-300">Google</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold">Govt</p>
                <p className="text-xs text-slate-300">Certified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lead Form */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-slate-900 border border-slate-100">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Please submit your info</h3>
              <p className="text-sm text-slate-500 mt-1">Step 1 of 2</p>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">Full name *</label>
                <div className="mt-2">
                  <input type="text" id="name" className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">Email *</label>
                <div className="mt-2">
                  <input type="email" id="email" className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">Phone *</label>
                <div className="mt-2 flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                    +91
                  </span>
                  <input type="tel" id="phone" className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input id="whatsapp" name="whatsapp" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="whatsapp" className="text-sm text-slate-700">Yes, I need 40% off!</label>
              </div>

              <button type="button" className="mt-4 w-full rounded-md bg-slate-900 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all">
                NEXT
              </button>
            </form>

            <div className="mt-6 bg-amber-50 rounded-md p-3 border border-amber-200">
              <p className="text-xs text-amber-800 text-center">
                <span className="font-semibold">Limited slots</span> — we are receiving heavy inquiries. Reserve early.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
