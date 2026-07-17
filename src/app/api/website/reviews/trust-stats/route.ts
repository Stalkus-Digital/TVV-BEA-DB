import { jsonSuccess } from "@/api";
import { prisma } from "@/shared/database/prisma-client";

export async function GET() {
  const [aggregate, count] = await Promise.all([
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.count(),
  ]);

  return jsonSuccess({
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: count,
    trustLabel: count > 0 ? "Verified traveller reviews" : "Trusted by travellers",
  });
}
