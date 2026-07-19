import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import type { Enquiry } from "../types/enquiry";
import { getEnquiryService } from "../module";

/**
 * Public endpoint — `context` is legitimately `null` for an anonymous
 * visitor, and that's fine here (unlike every other handler in this
 * module): an enquiry can be submitted by anyone. When a session *is*
 * present, its `userId` is attached automatically, never trusted from the
 * request body.
 */
import { prisma } from "@/shared/database/prisma-client";

export async function submitEnquiryHandler(context: AuthContext | null, body: unknown): Promise<Result<Enquiry, AppError>> {
  const recaptchaToken =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).recaptchaToken
      : undefined;
  const { verifyRecaptchaToken } = await import("@/modules/integrations/services/recaptcha.service");
  const captcha = await verifyRecaptchaToken(recaptchaToken);
  if (!captcha.ok) return captcha;

  const result = await getEnquiryService().submit(body, context?.userId ?? null);
  
  if (result.ok) {
    const enquiry = result.value;
    
    // Phase 3: Push to Lead CRM Database
    try {
      await prisma.lead.create({
        data: {
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone || "",
          sourceUrl: enquiry.source || "Website",
          status: "NEW",
        }
      });
      
      // Push to Sembark when configured (Integrations vault or env)
      const { getIntegrationConfigResolver } = await import("@/modules/integrations");
      const sembark = await getIntegrationConfigResolver().getSembarkConfig();
      if (sembark.apiKey) {
        const { getSembarkService } = await import("../module");
        await getSembarkService().pushLead(enquiry);
      }
    } catch (err) {
      console.error("Failed to sync lead to CRM/Sembark", err);
    }
  }

  return result;
}
