"use client";

import { CheckSquare, ShieldCheck, Map, Clock, BadgePercent, PlaneTakeoff, HeartHandshake, Phone } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ValuePropFeature {
  title: string;
  description: string;
  icon?: string;
}

interface ValuePropositionProps {
  headline?: string;
  subheadline?: string;
  features?: ValuePropFeature[];
}

export function ValueProposition({ headline, subheadline, features: customFeatures }: ValuePropositionProps) {
  const defaultFeatures = [
    {
      icon: "Map",
      title: "Custom Itineraries",
      description: "Adjust your route based on your unique style.",
    },
    {
      icon: "ShieldCheck",
      title: "Premium Stays",
      description: "Handpicked luxury stays and scenic cruises.",
    },
    {
      icon: "PlaneTakeoff",
      title: "End-to-End Planning",
      description: "From ferries to flights, we handle everything.",
    },
    {
      icon: "Clock",
      title: "24/7 Travel Support",
      description: "Real-time ground support directly in your destination.",
    },
    {
      icon: "BadgePercent",
      title: "Best Price Guarantee",
      description: "Direct local tie-ups for the best luxury rates.",
    },
    {
      icon: "HeartHandshake",
      title: "500+ Trips Completed",
      description: "Trusted by hundreds of happy travelers.",
    }
  ];

  const features = customFeatures && customFeatures.length > 0 ? customFeatures : defaultFeatures;

  const renderIcon = (iconName: string = "CheckSquare") => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.CheckSquare;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-50 rounded-full blur-[100px] opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-wa/10 rounded-full blur-[100px] opacity-60 translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
              Why Choose Us
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {headline || "Crafting Memories in God's Own Country"}
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
              {subheadline || "We don't just book hotels; we curate natural escapes with extreme safety and absolute luxury."}
            </p>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <div className="bg-gradient-to-r from-brand to-brand-700 rounded-2xl p-6 text-white shadow-xl shadow-brand/20">
                <h4 className="text-xl font-bold mb-2">Bigger Group?</h4>
                <p className="text-brand-100 text-sm mb-4">We create unforgettable adventures, customised for your group. Get special offers up to <strong className="text-white">40% Off!</strong></p>
                <a href="#leadForm" className="inline-flex items-center justify-center gap-2 bg-white text-brand px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-slate-50 transition-colors">
                  <Phone className="w-4 h-4" /> Get A Callback
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {features.map((feature, i) => (
                <div key={i} className="group bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-brand-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                    {renderIcon(feature.icon as string)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
