"use client";

import { MessageCircle } from "lucide-react";

interface TimelineStep {
  day: number;
  title: string;
  description: string;
}

interface ItineraryTimelineProps {
  destinationName: string;
  timeline?: TimelineStep[];
}

export function ItineraryTimeline({ destinationName, timeline: customTimeline }: ItineraryTimelineProps) {
  const defaultTimeline = [
    {
      day: 1,
      title: `Arrival & Transfer to ${destinationName}`,
      description: `Arrive at the airport. Start your scenic drive to your premium resort, enjoying beautiful views en route.`
    },
    {
      day: 2,
      title: "Sightseeing & Exploration",
      description: "Explore the emerald landscapes. Visit national parks, viewpoints, and enjoy a relaxing walk through nature."
    },
    {
      day: 3,
      title: "Wildlife Safari & Activities",
      description: "Enjoy an afternoon boat cruise (optional) to spot wildlife, and take a guided local tour."
    },
    {
      day: 4,
      title: "Luxury Cruise & Backwaters",
      description: "Board your traditional private houseboat for a cruise. Enjoy authentic local meals prepared onboard."
    },
    {
      day: 5,
      title: "Leisure & Wellness",
      description: "Spend a free day relaxing at the beach, or enjoy a spa massage at your premium resort."
    },
    {
      day: 6,
      title: "Departure",
      description: "Transfer to the airport with incredible memories of your tropical escape."
    }
  ];

  const days = customTimeline && customTimeline.length > 0 ? customTimeline : defaultTimeline;
  const whatsappMsg = encodeURIComponent(`Hi, I'd like to see the full day-wise plan for ${destinationName}`);

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-wa/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
            <span className="flex h-2 w-2 rounded-full bg-brand-400"></span>
            The Experience
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Sample {destinationName} Itinerary</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Your journey through God's Own Country, curated day by day for maximum awe.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-500 via-brand-700 to-transparent md:left-1/2 md:-ml-[1px]"></div>

          <div className="space-y-12 relative">
            {days.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.day} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-0 group">
                  
                  {/* Marker */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-12 h-12 flex items-center justify-center bg-slate-900 z-10 rounded-full border-4 border-slate-900 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-5 h-5 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(0,102,204,0.8)]"></div>
                  </div>

                  {/* Left Column (Desktop) */}
                  <div className={`hidden md:flex flex-col justify-center w-1/2 ${isEven ? 'pr-16 text-right' : 'order-last pl-16 text-left'}`}>
                    {isEven && (
                      <div className="bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-700/50 hover:border-brand-500/50 transition-all duration-300 group-hover:-translate-x-2">
                        <p className="text-sm font-black tracking-widest text-brand-400 mb-3 uppercase">Day {item.day}</p>
                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{item.title}</h3>
                        <p className="text-base text-slate-300 leading-relaxed font-light">{item.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Desktop) & Mobile View */}
                  <div className={`w-full pl-24 md:pl-0 md:w-1/2 ${!isEven ? 'pr-16' : ''}`}>
                    {(!isEven || true) && (
                      <div className={`bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-slate-700/50 hover:border-brand-500/50 transition-all duration-300 ${isEven ? 'md:hidden' : 'md:group-hover:translate-x-2'}`}>
                        <p className="text-sm font-black tracking-widest text-brand-400 mb-3 uppercase">Day {item.day}</p>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">{item.title}</h3>
                        <p className="text-base text-slate-300 leading-relaxed font-light">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 text-center relative z-20">
          <a 
            href={`https://wa.me/918700010976?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-wa hover:bg-[#20ba59] text-white font-bold px-10 py-5 rounded-2xl shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_50px_rgba(37,211,102,0.5)] hover:-translate-y-1 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">Get Full Day-wise Plan on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
