import { Heart, ThumbsUp, Map, ShieldCheck } from "lucide-react";

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
      icon: "Map",
      title: "Local Expertise",
      description: `We know every hidden beach and local secret in ${destinationName}.`
    },
    {
      icon: "ShieldCheck",
      title: "Verified Partners",
      description: "We personally vet every hotel, driver, and guide we work with."
    },
    {
      icon: "ThumbsUp",
      title: "Zero Hidden Costs",
      description: "The price you see is the price you pay. No last-minute surprises."
    },
    {
      icon: "Heart",
      title: "Personalized Care",
      description: "Dedicated trip coordinators available 24/7 during your travel."
    }
  ];

  const reasons = customReasons && customReasons.length > 0 ? customReasons : defaultReasons;

  const renderIcon = (iconName: string = "Map") => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Map;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
            <img 
              src="/placeholder-package.jpg" 
              alt={`Why book ${destinationName}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="font-bold text-2xl mb-2">300,000+ Happy Travelers</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">WHY US</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Why Book {destinationName} with The Vacation Voice?
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Tailor-made packages with stunning tropical beaches, thrilling water sports, and savings <strong className="text-slate-900">up to 40%</strong>. We make your dream vacation a seamless reality.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              {reasons.map((reason, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                      {renderIcon(reason.icon as string)}
                    </div>
                    <h3 className="font-bold text-slate-900">{reason.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-14">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
