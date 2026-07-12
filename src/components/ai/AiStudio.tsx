"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wand2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  PackagePlus,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { useAiGenerateMutation } from "@/features/admin-packages/hooks/useAiGenerateMutation";
import type { GeneratedPackage } from "@/modules/package/services/ai-generator.service";
import { useCreatePackageMutation, useAddDayMutation, useAddItemMutation, useUpsertPricingMutation } from "@/features/admin-packages/hooks/usePackageMutations";
import { PackageSourceType } from "@/features/admin-packages/constants";

export function AiStudio() {
  const router = useRouter();
  const generateMutation = useAiGenerateMutation();
  const createMutation = useCreatePackageMutation();

  const [prompt, setPrompt] = useState("A luxurious 5-day honeymoon trip to Andaman, including a private ferry to Havelock and scuba diving.");
  const [destination, setDestination] = useState("Andaman & Nicobar");
  const [duration, setDuration] = useState("5 Days / 4 Nights");
  const [budget, setBudget] = useState("Premium");
  
  const [output, setOutput] = useState<GeneratedPackage | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      const data = await generateMutation.mutateAsync({
        prompt,
        destination,
        duration,
        budget,
      });
      setOutput(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate package. Check API key and logs.");
    }
  };

  const handleConvertToPackage = async () => {
    if (!output) return;
    setIsConverting(true);
    try {
      // Use the pre-persisted package ID from the backend if available
      const persistedId = (output as any).persistedPackageId;
      if (persistedId) {
        router.push(`/packages/new?id=${persistedId}`);
        return;
      }

      // Fallback: Create the base package
      const pkg = await createMutation.mutateAsync({
        title: output.title,
        destinationId: "", // Will fail validation if empty, but better than hardcoded
        durationDays: output.durationDays,
        durationNights: output.durationNights,
        sourceType: PackageSourceType.MANUAL,
      });

      // Redirect immediately to builder
      router.push(`/packages/new?id=${pkg.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to convert package");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex h-full bg-background rounded-lg border border-border overflow-hidden shadow-sm">
      
      {/* Left Panel: AI Configuration & Prompt */}
      <div className="w-1/3 min-w-[400px] border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Wand2 className="h-6 w-6" />
            <h2 className="font-bold text-lg tracking-tight">AI Package Studio</h2>
          </div>
          <p className="text-sm text-muted-foreground">Describe the ideal trip, and let our AI generate a complete, bookable package.</p>
        </div>

        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> Prompt
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none min-h-[120px]"
              placeholder="e.g. A romantic honeymoon in the Maldives, focusing on water villas and private dining experiences..."
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide border-b border-border pb-2">Parameters</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Destination
              </label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-background border border-border rounded p-2 text-sm focus:ring-1 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Duration
                </label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-background border border-border rounded p-2 text-sm focus:ring-1 focus:ring-ring">
                  <option>3 Days / 2 Nights</option>
                  <option>5 Days / 4 Nights</option>
                  <option>7 Days / 6 Nights</option>
                  <option>10+ Days</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3" /> Budget
                </label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-background border border-border rounded p-2 text-sm focus:ring-1 focus:ring-ring">
                  <option>Economy</option>
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-border bg-slate-50/50">
          <button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Magic...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Package</>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Output Preview */}
      <div className="flex-1 bg-slate-50/50 flex flex-col relative">
        {generateMutation.isPending ? (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center text-primary">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="font-medium animate-pulse">Structuring itinerary with OpenAI...</p>
          </div>
        ) : !output ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Output Yet</h3>
            <p className="max-w-sm">Enter your prompt and parameters on the left to generate a customized travel package instantly.</p>
          </div>
        ) : (
          <>
            {/* Generated Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-border bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MapPin className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-primary text-xs font-bold rounded-full mb-4">
                      AI Generated
                    </span>
                    <h1 className="text-3xl font-bold mb-2">{output.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-slate-300">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {destination}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {output.durationDays} Days / {output.durationNights} Nights</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                  
                  {/* Estimated Price */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-emerald-800 font-semibold text-sm">Estimated Base Price</h4>
                      <p className="text-emerald-600 text-xs">Based on current parameters and market trends.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-700">₹{output.basePrice.toLocaleString()}</span>
                      <p className="text-emerald-600 text-xs">for two adults</p>
                    </div>
                  </div>

                  {/* Itinerary */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Proposed Itinerary
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      
                      {output.days.map((day, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            {day.dayNumber}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow-sm">
                            <h4 className="font-bold text-sm mb-1 text-primary">{day.title}</h4>
                            <div className="space-y-2 mt-2">
                              {day.items.map((item, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-medium text-muted-foreground mr-2 text-xs">[{item.kind}]</span>
                                  <span>{item.title}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                    <div>
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Inclusions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {output.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="text-emerald-500">•</span> {inc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><span className="text-rose-500 font-bold">✕</span> Exclusions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {output.exclusions.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="text-rose-500">•</span> {exc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Action Footer */}
            <div className="h-16 border-t border-border bg-card flex items-center justify-end px-6 shrink-0 gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
              <button onClick={handleGenerate} disabled={generateMutation.isPending} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                Regenerate
              </button>
              <button onClick={handleConvertToPackage} disabled={isConverting} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />} 
                {isConverting ? "Converting..." : "Convert to Package"}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
