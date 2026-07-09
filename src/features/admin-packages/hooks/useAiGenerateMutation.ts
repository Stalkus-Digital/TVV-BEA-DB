"use client";

import { useMutation } from "@tanstack/react-query";
import { type GeneratedPackage } from "@/modules/package/services/ai-generator.service";

interface AiGenerateInput {
  prompt: string;
  destination: string;
  duration: string;
  budget: string;
}

export function useAiGenerateMutation() {
  return useMutation({
    mutationFn: async (input: AiGenerateInput) => {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to generate package");
      return (await res.json()) as GeneratedPackage;
    },
  });
}
