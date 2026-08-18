import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/api";
import { getDestinationService } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET(req: NextRequest) {
  const root = await getDestinationService().getBySlug("andaman");
  if (isErr(root)) return jsonError(root.error);

  const children = await getDestinationService().getChildren(root.value.id);
  if (isErr(children)) return jsonError(children.error);

  const tiles = children.value.map((dest) => ({
    slug: dest.slug,
    title: dest.name,
    description: dest.description || "",
    image: dest.gallery?.[0]?.url || dest.seo?.ogImageUrl || "",
    href: `/destinations/${dest.slug}`,
    meta: dest.seo?.metaTitle || undefined,
  }));

  return jsonSuccess(tiles);
}
