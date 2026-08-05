"use client";

import { useState } from "react";
import { CheckCircle2, Phone, Star, ArrowRight, Plane, MapPin, Calendar, Users, Briefcase } from "lucide-react";
import type { Destination } from "@/modules/destination";

interface DestinationHeroProps {
  destination: Partial<Destination>;
  heroImage: string;
  customHeadline?: string;
  customSubheadline?: string;
}

export function DestinationHero({ destination, heroImage, customHeadline, customSubheadline }: DestinationHeroProps) {
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    budget: "",
    duration: "",
    travelType: "",
    travelers: "",
    name: "",
    email: "",
    phone: "",
    wantsDiscount: true
  });

  const destName = destination?.name || "Holiday";
  const whatsappMsg = encodeURIComponent(`Hi, I want a ${destName} itinerary`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real implementation this hits /api/enquiries
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PACKAGE',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          destinationSlug: destination.slug || destName,
          message: `Budget: ${formData.budget}, Duration: ${formData.duration}, Type: ${formData.travelType}, Travelers: ${formData.travelers}, Needs 40% Off: ${formData.wantsDiscount}`
        })
      });
      alert("Enquiry sent successfully! We will contact you shortly.");
      setFormStep(1);
      setFormData({
        budget: "", duration: "", travelType: "", travelers: "",
        name: "", email: "", phone: "", wantsDiscount: true
      });
    } catch (err) {
      alert("There was an error submitting your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <section className="relative min-h-[95vh] lg:min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with Parallax effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={destName}
          className="w-full h-full object-cover scale-105"
        />
        {/* Sophisticated Gradient Overlay matching reference */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#002d5c]/95 via-[#0066cc]/80 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Left Column: Copy */}
        <div className="lg:col-span-7 space-y-6 lg:space-y-8 animate-fade-in-up mt-8 lg:mt-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-brand-200 animate-pulse" />
            Top Destination
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] whitespace-pre-line">
            {customHeadline || (
              <>
                {destName} Holiday <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-white">Packages</span>
              </>
            )}
          </h1>
          
          <p className="text-lg lg:text-xl text-brand-100 max-w-xl font-light leading-relaxed whitespace-pre-line">
            {customSubheadline || (
              <>
                Experience the magic of {destName}. Get your <strong className="font-semibold text-white">custom itinerary in 10 minutes</strong>.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a 
              href={`https://wa.me/918700010976?text=${whatsappMsg}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-3 rounded-xl bg-wa px-8 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(37,211,102,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(37,211,102,0.6)]"
            >
              <Phone className="w-5 h-5" />
              <span>Get Itinerary on WhatsApp</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-8 pt-8 border-t border-white/10 mt-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-[#00aa6c] fill-[#00aa6c]" />
                ))}
              </div>
              <div className="text-white">
                <p className="font-bold leading-none">4.8/5.0</p>
                <p className="text-xs text-brand-200">TripAdvisor</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold leading-none">10k+</p>
                <p className="text-xs text-brand-200">Happy Travelers</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
              <div>
                <p className="font-bold leading-none">Verified</p>
                <p className="text-xs text-brand-200">Govt. Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Lead Form */}
        <div className="lg:col-span-5 relative">
          {/* Decorative elements */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-brand-400 to-wa opacity-30 blur-lg"></div>
          
          <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 sm:p-8 border border-white/20">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Plan Your Trip</h3>
              <p className="text-sm text-slate-500 mt-2">Get a free quote in 2 minutes</p>
              
              {/* Progress Bar */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${formStep >= 1 ? 'w-12 bg-brand' : 'w-4 bg-slate-200'}`}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${formStep >= 2 ? 'w-12 bg-brand' : 'w-4 bg-slate-200'}`}></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {formStep === 1 && (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Budget */}
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-brand" /> Budget
                      </label>
                      <select name="budget" required value={formData.budget} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white cursor-pointer">
                        <option value="">Select Budget</option>
                        <option value="Standard">Standard (₹10k - 15k)</option>
                        <option value="Deluxe">Deluxe (₹15k - 25k)</option>
                        <option value="Luxury">Luxury (₹25k+)</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand" /> Duration
                      </label>
                      <select name="duration" required value={formData.duration} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white cursor-pointer">
                        <option value="">Select Days</option>
                        <option value="2-3 Days">2-3 Days</option>
                        <option value="4-5 Days">4-5 Days</option>
                        <option value="6+ Days">6+ Days</option>
                      </select>
                    </div>

                    {/* Travel Type */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand" /> Travel Type
                      </label>
                      <select name="travelType" required value={formData.travelType} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white cursor-pointer">
                        <option value="">Select Type</option>
                        <option value="Honeymoon">Honeymoon</option>
                        <option value="Family">Family</option>
                        <option value="Friends">Friends Group</option>
                        <option value="Solo">Solo</option>
                      </select>
                    </div>

                    {/* Travelers */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-brand" /> Travelers
                      </label>
                      <select name="travelers" required value={formData.travelers} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white cursor-pointer">
                        <option value="">Number of Travelers</option>
                        <option value="1">1 Traveler</option>
                        <option value="2">2 Travelers</option>
                        <option value="3-5">3-5 Travelers</option>
                        <option value="6+">6+ Travelers</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="mt-6 w-full group relative flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand hover:shadow-brand/25">
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {formStep === 2 && (
                <div className="animate-fade-in">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-500">
                          +91
                        </span>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="9876543210" className="w-full min-w-0 flex-1 rounded-none rounded-r-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:ring-brand outline-none transition-colors hover:bg-white" />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <div className="flex h-5 items-center">
                        <input id="wantsDiscount" name="wantsDiscount" type="checkbox" checked={formData.wantsDiscount} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
                      </div>
                      <label htmlFor="wantsDiscount" className="text-sm text-slate-600 leading-tight">
                        Yes, I want to receive the <strong className="text-brand">40% OFF</strong> early bird discount and travel updates.
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={() => setFormStep(1)} className="rounded-xl px-4 py-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 group relative flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed">
                      <Plane className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : 'transition-transform group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                      <span>{isSubmitting ? "Sending..." : "Get Free Quote"}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Urgency Trigger */}
            <div className="mt-6 rounded-xl bg-amber-50/80 border border-amber-100 p-3">
              <div className="flex items-center justify-center gap-2 text-amber-800">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs font-medium">
                  <strong className="font-bold">Limited slots available</strong> for next week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

