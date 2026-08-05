"use client";

import { Heart, ThumbsUp, Map, ShieldCheck, MapPin, Tent, Percent } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface WhyBookReason {
  title: string;
  description: string;
  icon?: string;
}

interface WhyBookSectionProps {
  destinationName: string;
  reasons?: WhyBookReason[];
}

export function WhyBookSection({ destinationName, reasons: customReasons }: WhyBookSectionProps) {
  const defaultReasons = [
    {
      icon: "MapPin",
      title: "6 Unique Itinerary Styles",
      description: `Custom adventures ranging from serene tea gardens to relaxing backwaters of ${destinationName}.`
    },
    {
      icon: "Tent",
      title: "Backwaters & Nature",
      description: "Experience deep relaxation on a luxury houseboat and behold majestic waterfalls."
    },
    {
      icon: "Percent",
      title: "Save Up to 35%",
      description: "Premium packages starting from ₹12,999/person — exclusive limited-time group & private departures."
    }
  ];

  const reasons = customReasons && customReasons.length > 0 ? customReasons : defaultReasons;

  const renderIcon = (iconName: string = "MapPin") => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.MapPin;
    return <IconComponent className="w-6 h-6 stroke-[2.5]" />;
  };

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
              Why Us
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Why Book {destinationName} with The Vacation Voice?
            </h2>
            
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Tailor-made luxury packages with stunning hill station views, relaxing houseboat cruises, and direct savings <strong className="text-brand font-black">up to 35%</strong>.
            </p>

            <div className="space-y-10">
              {reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white group-hover:border-brand group-hover:shadow-lg transition-all duration-300">
                    {renderIcon(reason.icon as string)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{reason.title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-200 rounded-full blur-[80px] opacity-50 -translate-y-1/4 translate-x-1/4"></div>
            
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-slate-900/10 border-8 border-white group">
              <img 
                src="/placeholder-package.jpg" 
                alt={`Why book ${destinationName}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-8 sm:p-10">
                <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-black text-3xl mb-3 tracking-tight">300,000+ Happy Travelers</p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-bold bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg">4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 hidden sm:block animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-wa/10 text-wa rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 fill-wa" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trusted By</p>
                  <p className="text-xl font-black text-slate-900">Couples & Families</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
