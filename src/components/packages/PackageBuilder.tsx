"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  CalendarDays, 
  DollarSign, 
  ListChecks, 
  Image as ImageIcon, 
  Eye, 
  GripVertical,
  Plane,
  Building2,
  Ship,
  Plus
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Basic Info", icon: MapPin },
  { id: 2, name: "Destination", icon: MapPin },
  { id: 3, name: "Itinerary Builder", icon: CalendarDays },
  { id: 4, name: "Pricing", icon: DollarSign },
  { id: 5, name: "Inclusions", icon: ListChecks },
  { id: 6, name: "Media", icon: ImageIcon },
  { id: 7, name: "Preview", icon: Eye },
];

export function PackageBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [price, setPrice] = useState(45000);
  const [toggles, setToggles] = useState({
    flights: true,
    hotels: true,
    ferry: false,
    transport: true,
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex h-full bg-background rounded-lg border border-border overflow-hidden shadow-sm">
      {/* Sidebar Steps */}
      <div className="w-64 border-r border-border bg-card shrink-0 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg tracking-tight">Create Package</h2>
          <p className="text-xs text-muted-foreground">Follow the steps to build.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 w-full text-left transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : isActive ? (
                  <Circle className="h-5 w-5 fill-primary/20 text-primary" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight mb-6">
              {STEPS.find(s => s.id === currentStep)?.name}
            </h1>
            
            {/* Step Contents */}
            {currentStep === 1 && <BasicInfoStep />}
            {currentStep === 2 && <DestinationStep />}
            {currentStep === 3 && <ItineraryStep />}
            {currentStep === 4 && <PricingStep toggles={toggles} setToggles={setToggles} />}
            {currentStep === 5 && <InclusionsStep />}
            {currentStep === 6 && <MediaStep />}
            {currentStep === 7 && <PreviewStep />}
            
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="h-16 border-t border-border bg-card flex items-center justify-between px-6 shrink-0">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button 
            onClick={nextStep}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors"
          >
            {currentStep === STEPS.length ? "Publish Package" : "Continue"}
          </button>
        </div>
      </div>

      {/* Right Sidebar: Real-time Price Preview */}
      <div className="w-80 border-l border-border bg-card shrink-0 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border bg-slate-50/50">
          <h3 className="font-semibold tracking-tight mb-1">Package Summary</h3>
          <p className="text-xs text-muted-foreground">Updates in real-time</p>
        </div>
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-medium">₹{price.toLocaleString()}</span>
            </div>
            {toggles.flights && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Plane className="h-3 w-3"/> Flights</span>
                <span className="font-medium">+₹12,500</span>
              </div>
            )}
            {toggles.hotels && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3"/> Hotels</span>
                <span className="font-medium">+₹18,000</span>
              </div>
            )}
            {toggles.ferry && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Ship className="h-3 w-3"/> Ferry</span>
                <span className="font-medium">+₹3,200</span>
              </div>
            )}
            <div className="pt-4 border-t border-border mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total / Person</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{(
                    price + 
                    (toggles.flights ? 12500 : 0) + 
                    (toggles.hotels ? 18000 : 0) + 
                    (toggles.ferry ? 3200 : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <h4 className="text-sm font-semibold text-primary mb-2">TripJack Integration</h4>
            <p className="text-xs text-muted-foreground">
              Live flight and hotel rates will be fetched when the user searches for specific dates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicInfoStep() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Package Title</label>
        <input type="text" placeholder="e.g. Magical Maldives Escape" className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Duration (Days)</label>
          <input type="number" defaultValue={5} className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Duration (Nights)</label>
          <input type="number" defaultValue={4} className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Short Description</label>
        <textarea rows={4} placeholder="A brief overview of the package..." className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>
    </div>
  );
}

function DestinationStep() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Primary Destination</label>
        <select className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background">
          <option>Andaman & Nicobar</option>
          <option>Maldives</option>
          <option>Dubai</option>
          <option>Bali</option>
        </select>
      </div>
      <div className="p-4 rounded-lg border border-dashed border-border bg-background flex flex-col items-center justify-center text-center space-y-2">
        <MapPin className="h-8 w-8 text-muted-foreground" />
        <div>
          <h4 className="text-sm font-medium">Add Multi-city Routing</h4>
          <p className="text-xs text-muted-foreground">Include multiple destinations in this package</p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline mt-2">
          + Add Destination
        </button>
      </div>
    </div>
  );
}

function ItineraryStep() {
  const [days, setDays] = useState([
    { id: 1, title: "Arrival & Leisure", location: "Port Blair" },
    { id: 2, title: "Cellular Jail & Carbyn's Cove", location: "Port Blair" },
    { id: 3, title: "Ferry to Havelock", location: "Havelock Island" },
    { id: 4, title: "Radhanagar Beach", location: "Havelock Island" },
  ]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop days to reorder your itinerary.
      </p>
      
      <div className="space-y-3">
        {days.map((day, i) => (
          <div key={day.id} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              {i !== days.length - 1 && (
                <div className="w-px h-full bg-border my-1" />
              )}
            </div>
            <div className="flex-1 bg-card border border-border rounded-lg p-4 shadow-sm group-hover:border-primary/30 transition-colors flex items-start gap-3">
              <button className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <input 
                  type="text" 
                  defaultValue={day.title} 
                  className="font-medium text-sm w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded-sm px-1 -ml-1" 
                />
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {day.location}
                  </span>
                  <button className="text-xs text-primary hover:underline">Edit details</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full py-3 border border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" /> Add Day
      </button>
    </div>
  );
}

function PricingStep({ toggles, setToggles }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-tight border-b border-border pb-2">Base Package</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Base Price (₹)</label>
          <input type="number" defaultValue={45000} className="w-full max-w-xs border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">The core price before dynamic additions.</p>
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-semibold tracking-tight border-b border-border pb-2">Dynamic Components</h3>
        <p className="text-sm text-muted-foreground">Toggle which elements can be dynamically priced via integrations.</p>
        
        <div className="space-y-3">
          <ToggleRow 
            icon={Plane} 
            title="Flights Integration (TripJack)" 
            checked={toggles.flights} 
            onChange={(v: boolean) => setToggles({...toggles, flights: v})} 
          />
          <ToggleRow 
            icon={Building2} 
            title="Hotels Integration (TripJack)" 
            checked={toggles.hotels} 
            onChange={(v: boolean) => setToggles({...toggles, hotels: v})} 
          />
          <ToggleRow 
            icon={Ship} 
            title="Ferry Integration (Andaman Module)" 
            checked={toggles.ferry} 
            onChange={(v: boolean) => setToggles({...toggles, ferry: v})} 
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-md text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

function InclusionsStep() {
  return (
    <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground">
      <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Manage what's included and excluded.</p>
      <p className="text-xs mt-1">(Placeholder for Inclusions UI)</p>
    </div>
  );
}

function MediaStep() {
  return (
    <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground">
      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Upload gallery images and cover photo.</p>
      <p className="text-xs mt-1">(Placeholder for Media UI)</p>
    </div>
  );
}

function PreviewStep() {
  return (
    <div className="p-8 border border-border bg-card rounded-lg shadow-sm text-center">
      <h3 className="font-semibold mb-2">Ready to Publish</h3>
      <p className="text-sm text-muted-foreground mb-4">Your package is configured and ready to go live.</p>
      <div className="inline-flex h-24 w-24 rounded-full bg-emerald-100 items-center justify-center text-emerald-600 mb-4">
        <CheckCircle2 className="h-10 w-10" />
      </div>
    </div>
  );
}
