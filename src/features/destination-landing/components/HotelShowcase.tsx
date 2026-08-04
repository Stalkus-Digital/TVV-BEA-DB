import Link from "next/link";
import { MapPin, Star, Phone, Info } from "lucide-react";
import type { TjHotel } from "@/generated/prisma/client";

interface HotelShowcaseProps {
  title: string;
  subtitle: string;
  hotels: TjHotel[];
}

export function HotelShowcase({ title, subtitle, hotels }: HotelShowcaseProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-2">{subtitle}</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{title}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map((hotel) => {
            let image = "/placeholder-hotel.jpg";
            let addressString = "Contact for details";
            let amenitiesList: string[] = [];
            
            try {
              // Parse images if available
              if (hotel.images) {
                const imgData = hotel.images as any;
                if (Array.isArray(imgData) && imgData.length > 0) {
                  // TripJack often returns objects like { url: '...' } inside the images array
                  const firstImg = imgData[0];
                  if (typeof firstImg === 'string') image = firstImg;
                  else if (firstImg?.url) image = firstImg.url;
                }
              }
              
              // Parse address
              if (hotel.address) {
                const addrData = hotel.address as any;
                if (typeof addrData === 'string') addressString = addrData;
                else if (addrData?.addressLine1) addressString = addrData.addressLine1;
              }
              
              // Parse amenities
              if (hotel.amenities) {
                 const amenData = hotel.amenities as any;
                 if (Array.isArray(amenData)) {
                    amenitiesList = amenData.slice(0, 3).map(a => typeof a === 'string' ? a : a?.name || 'Amenity');
                 }
              }
            } catch (e) {
              console.warn("Failed to parse hotel metadata", e);
            }
            
            // Dummy live rate for aesthetic visualization
            const dummyPrice = 5000 + Math.floor(Math.random() * 15000);
            const stars = hotel.starRating ? parseInt(hotel.starRating.replace(/[^0-9]/g, ''), 10) : 4;
            const starCount = isNaN(stars) || stars < 1 ? 4 : (stars > 5 ? 5 : stars);

            return (
              <div key={hotel.id} className="bg-white rounded-xl overflow-hidden shadow border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={image} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-hotel.jpg" }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                     {Array.from({ length: starCount }).map((_, i) => (
                       <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                     ))}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">
                    {hotel.name}
                  </h3>
                  
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2rem]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                    <span>{addressString}</span>
                  </div>
                  
                  {amenitiesList.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                        {amenitiesList.map((amenity, i) => (
                           <span key={i} className="text-[10px] uppercase font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {amenity}
                           </span>
                        ))}
                     </div>
                  )}
                  {amenitiesList.length === 0 && <div className="mt-auto"></div>}
                  
                  <div className="border-t border-slate-100 pt-4 mt-2">
                     <p className="text-xs text-slate-500 mb-0.5">Starting from</p>
                     <p className="text-xl font-bold text-slate-900">INR {dummyPrice.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ night</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50 mt-auto">
                  <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                    <Info className="w-4 h-4" /> Details
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                    <Phone className="w-4 h-4" /> Book
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
