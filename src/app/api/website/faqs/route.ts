import { jsonSuccess } from "@/api";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const faqs = await prisma.cmsConfig.findUnique({ where: { key: "GLOBAL_FAQS" } });
  const rows = Array.isArray(faqs?.value) ? faqs.value : [];

  const filtered = category
    ? rows.filter((item) => typeof item === "object" && item && (item as { category?: string }).category === category)
    : rows;

  return jsonSuccess(
    filtered.map((item, index) => {
      const row = item as { question?: string; answer?: string; category?: string };
      return {
        id: String(index + 1),
        question: row.question ?? "",
        answer: row.answer ?? "",
        category: row.category ?? "general",
      };
    })
  );
}
