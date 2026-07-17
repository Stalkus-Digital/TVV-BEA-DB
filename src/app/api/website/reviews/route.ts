import { jsonSuccess } from "@/api";
import { prisma } from "@/shared/database/prisma-client";

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return jsonSuccess(
    reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      authorName: review.authorName,
      createdAt: review.createdAt.toISOString(),
    }))
  );
}
