import { FileText } from "lucide-react";

interface ItineraryTimelineProps {
  destinationName: string;
}

export function ItineraryTimeline({ destinationName }: ItineraryTimelineProps) {
  const days = [
    {
      day: 1,
      title: "Arrive Port Blair",
      description: "Airport Pickup - Hotel check-in - Corbyn's Cove Beach - Cellular Jail - Light & Sound Show"
    },
    {
      day: 2,
      title: "Port Blair to Havelock",
      description: "Ferry to Havelock - Radhanagar Beach (Asia's Best) - Sunset Viewing - Beach Resort Stay"
    },
    {
      day: 3,
      title: "Havelock Adventures",
      description: "Elephant Beach - Snorkeling/Scuba - Beach Relaxation"
    },
    {
      day: 4,
      title: "Havelock to Port Blair",
      description: "Return Ferry - Ross Island - North Bay Coral Island"
    },
    {
      day: 5,
      title: "Departure",
      description: "Local Shopping - Airport Drop"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Sample 5 Days {destinationName} Tour</h2>
          <p className="text-slate-400">Experience the best of {destinationName} islands.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-700 md:left-1/2 md:-ml-px"></div>

          <div className="space-y-8 relative">
            {days.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.day} className="relative flex flex-col md:flex-row items-center gap-8">
                  {/* Left Column (Desktop) */}
                  <div className={`hidden md:block w-1/2 ${isEven ? 'text-right pr-12' : 'order-last pl-12'}`}>
                    {isEven && (
                      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors">
                        <p className="text-xs font-bold tracking-wider text-blue-400 mb-2">DAY {item.day}</p>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Marker */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-14 h-14 flex items-center justify-center bg-slate-900 z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                  </div>

                  {/* Right Column (Desktop) & Mobile View */}
                  <div className={`w-full pl-20 md:pl-0 md:w-1/2 ${!isEven ? 'pr-12' : ''}`}>
                    {(!isEven || true) && (
                      <div className={`bg-slate-800/80 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors ${isEven ? 'md:hidden' : ''}`}>
                        <p className="text-xs font-bold tracking-wider text-blue-400 mb-2">DAY {item.day}</p>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
            <FileText className="w-5 h-5" />
            Customize This Trip
          </button>
        </div>
      </div>
    </section>
  );
}
