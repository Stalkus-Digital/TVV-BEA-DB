import { z } from "zod";

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  tripType: z.string().trim().optional(),
  travelDates: z.string().trim().optional(),
  guests: z.coerce.number().int().positive().optional(),
  budget: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a little more about your trip"),
  source: z.string().trim().optional(),
  packageSlug: z.string().trim().optional(),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;
