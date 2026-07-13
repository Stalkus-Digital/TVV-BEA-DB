import Link from "next/link";
import { Clock, Phone, MapPin, Star } from "lucide-react";
import type { Package } from "@/modules/package";

interface PackageShowcaseProps {
  title: string;
  subtitle: string;
  packages: Package[];
}

export function PackageShowcase({ title, subtitle, packages }: PackageShowcaseProps) {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-2">{subtitle}</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{title}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const content = pkg.content as any;
            const image = content?.images?.[0] || "/placeholder-package.jpg";
            
            // Generate some random save amount for visual fidelity matching the screenshot
            const saveAmount = Math.floor(Math.random() * 5000) + 1000;
            // Provide dummy price if none exists
            const price = 10000 + Math.floor(Math.random() * 10000);
            
            return (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={image} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-3">{pkg.title}</h3>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mb-3">
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.durationDays}D/{pkg.durationNights}N</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>4.{Math.floor(Math.random() * 5) + 5}</span>
                    </div>
                  </div>
                  
                  {/* Mock routing like "2N Port Blair • 2N Havelock" */}
                  <p className="text-xs text-slate-500 mb-4 line-clamp-1 border-b border-slate-100 pb-4">
                    Multiple stops included in this itinerary
                  </p>
                  
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xl font-bold text-slate-900">INR {price.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-1">
                        SAVE ₹{saveAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 line-through">INR {(price + saveAmount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100">
                  <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
