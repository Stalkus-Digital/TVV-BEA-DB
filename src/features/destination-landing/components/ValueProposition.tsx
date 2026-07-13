import { CheckSquare, ShieldCheck, Map, Clock, BadgePercent } from "lucide-react";

export function ValueProposition() {
  const features = [
    {
      icon: Map,
      title: "End-to-End Planning",
      description: "From ferries to flights, we handle everything.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Stays",
      description: "Handpicked beach resorts and boutique hotels.",
    },
    {
      icon: CheckSquare,
      title: "Custom Itineraries",
      description: "Adjust your route and pace as you wish.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Real-time local ground support.",
    },
    {
      icon: BadgePercent,
      title: "Best Price",
      description: "Direct local tie-ups for ferries and best rates.",
    },
  ];

  return (
    <section className="py-20 bg-slate-100/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Crafting Memories in the Islands</h2>
          <p className="text-slate-600">
            We don't just book hotels; we curate tropical adventures with seamless execution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-blue-600">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
