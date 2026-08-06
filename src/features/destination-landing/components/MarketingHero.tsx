"use client";

import { useState } from "react";
import { CheckCircle2, Phone, Star, ArrowRight, Plane, MapPin, Calendar, Users, Briefcase } from "lucide-react";
import type { Destination } from "@/modules/destination";

interface MarketingHeroProps {
  destination?: Partial<Destination>;
  config: {
    headline: string;
    subheadline: string;
    pricePoint: string;
    urgencyText: string;
    whatsappNumber: string;
    phoneNumber: string;
    backgroundImage: string;
    showTripAdvisor: boolean;
    showGoogle: boolean;
    showGovt: boolean;
  };
}

export function MarketingHero({ destination, config }: MarketingHeroProps) {
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    travelDate: "",
    travelers: "2",
  });

  const destName = destination?.name || "Holiday";
  const whatsappMsg = encodeURIComponent(`Hi, I want a ${destName} itinerary`);
  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`;
  const phoneUrl = `tel:${config.phoneNumber.replace(/[^0-9+]/g, '')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MARKETING_LEAD',
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode}${formData.phone}`,
          destinationSlug: destination?.slug || destName,
          message: `Travel Date: ${formData.travelDate}, Travelers: ${formData.travelers}`
        })
      });
      alert("Enquiry sent successfully! We will contact you shortly.");
      setFormStep(1);
      setFormData({
        name: "", email: "", countryCode: "+91", phone: "", travelDate: "", travelers: "2"
      });
    } catch (err) {
      alert("There was an error submitting your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${config.backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-slate-900/60"></div>
      
      <div className="relative mx-auto grid min-w-0 max-w-6xl gap-10 px-4 py-14 sm:px-5 md:grid-cols-[minmax(0,1fr)_min(100%,420px)] md:gap-14 md:py-20 lg:px-8 lg:py-24">
        
        {/* Left Column: Copy */}
        <div className="flex min-w-0 flex-col justify-center text-white">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 border border-white/20">
            <Plane className="w-3.5 h-3.5" />
            {destName}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight md:text-4xl lg:text-[44px]">
            {config.headline || `${destName} Holiday Packages`}
            {config.pricePoint && (
              <>
                <br className="hidden sm:block" /> {config.pricePoint}
              </>
            )}
            {config.urgencyText && (
              <>
                <br /><span className="text-amber-300">{config.urgencyText}</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-lg text-white/80">
            {config.subheadline || `All-inclusive ${destName} trips with stays, ferries, transfers & local support. Get your custom itinerary in 10 minutes.`}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {config.whatsappNumber && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition">
                <Phone className="w-4 h-4 fill-current" />
                Get Itinerary on WhatsApp
              </a>
            )}
            {config.phoneNumber && (
              <a href={phoneUrl} className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/25 active:scale-95 transition">
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {config.showTripAdvisor && (
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/10 px-2.5 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 fill-amber-400" />
                <div className="min-w-0"><span className="font-bold text-xs sm:text-sm">4.8</span><span className="text-[10px] sm:text-xs text-white/60 ml-0.5 sm:ml-1 truncate">TripAdvisor</span></div>
              </div>
            )}
            {config.showGoogle && (
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/10 px-2.5 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 fill-amber-400" />
                <div className="min-w-0"><span className="font-bold text-xs sm:text-sm">4.6</span><span className="text-[10px] sm:text-xs text-white/60 ml-0.5 sm:ml-1 truncate">Google</span></div>
              </div>
            )}
            {config.showGovt && (
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/10 px-2.5 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <div className="min-w-0"><span className="font-bold text-xs sm:text-sm">Govt</span><span className="text-[10px] sm:text-xs text-white/60 ml-0.5 sm:ml-1 truncate">Certified</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lead Form */}
        <div className="flex flex-col gap-5 sm:gap-6">
          <div id="enquiry-form" className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-white p-5 shadow-2xl sm:p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-bold text-slate-900 text-center">Please submit your info</h2>
            <p className="mt-1 text-center text-sm text-slate-500">Step <span>{formStep}</span> of <span>2</span></p>
            <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#0066cc] transition-all duration-300" style={{ width: formStep === 1 ? '50%' : '100%' }}></div>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-5 w-full min-w-0 max-w-full overflow-x-clip" noValidate>
              
              {/* HONEYPOT FIELD */}
              <div style={{ position: "absolute", left: "-5000px", top: "-5000px" }} aria-hidden="true">
                <input type="text" name="tvv_bot_check" tabIndex={-1} autoComplete="off" />
              </div>

              {formStep === 1 && (
                <div className="space-y-3 w-full min-w-0 max-w-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} autoComplete="name" className="w-full max-w-full min-w-0 box-border rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]" />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} autoComplete="email" className="w-full max-w-full min-w-0 box-border rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]" />
                  </div>
                  <div className="min-w-0 w-full">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
                    <div className="flex w-full min-w-0 max-w-full gap-0">
                      <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} className="w-20 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-2 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]">
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} autoComplete="tel" className="flex-1 max-w-full min-w-0 box-border rounded-r-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]" />
                    </div>
                  </div>
                  <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-4 py-3 font-semibold text-white shadow-md hover:bg-[#0055aa] active:scale-95 transition">
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-3 w-full min-w-0 max-w-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Travel Date</label>
                    <input type="date" name="travelDate" required value={formData.travelDate} onChange={handleInputChange} className="w-full max-w-full min-w-0 box-border rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]" />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Number of Travelers</label>
                    <select name="travelers" required value={formData.travelers} onChange={handleInputChange} className="w-full max-w-full min-w-0 box-border rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]">
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4+">4+ People</option>
                    </select>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setFormStep(1)} className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-4 py-3 font-semibold text-white shadow-md hover:bg-[#0055aa] active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSubmitting ? "Submitting..." : "Get Free Quote"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
