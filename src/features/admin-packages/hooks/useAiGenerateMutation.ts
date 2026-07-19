"use client";

import { useMutation } from "@tanstack/react-query";
import { type GeneratedPackage } from "@/modules/package/services/ai-generator.service";

interface AiGenerateInput {
  prompt: string;
  destination: string;
  duration: string;
  budget: string;
}

export type AiGenerateResult = GeneratedPackage & {
  persistedPackageId?: string;
  persistError?: string;
  warnings?: string[];
};

export function useAiGenerateMutation() {
  return useMutation({
    mutationFn: async (input: AiGenerateInput): Promise<AiGenerateResult> => {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Failed to generate package");
      }
      return body as AiGenerateResult;
    },
  });
}
