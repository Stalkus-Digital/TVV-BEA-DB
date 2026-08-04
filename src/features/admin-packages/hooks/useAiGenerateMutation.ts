"use client";

import { useMutation } from "@tanstack/react-query";
import { type GeneratedPackage } from "@/modules/package/services/ai-generator.service";
import { adminApiClient } from "@/lib/admin-api/client";

interface AiGenerateInput {
  prompt: string;
  destination: string;
  duration: string;
  budget: string;
  origin?: string;
  flightDestination?: string;
  departureDate?: string;
  returnDate?: string;
}

export type AiGenerateResult = GeneratedPackage & {
  persistedPackageId?: string;
  persistError?: string;
  warnings?: string[];
};

export function useAiGenerateMutation() {
  return useMutation({
    mutationFn: async (input: AiGenerateInput): Promise<AiGenerateResult> => {
      const result = await adminApiClient.post<AiGenerateResult>("/api/admin/ai/generate", input);
      if (!result) {
        throw new Error("Failed to generate package (No response)");
      }
      return result;
    },
  });
}
