import { permanentRedirect } from "next/navigation";

/** Legacy `/tours/:slug` URLs redirect to canonical `/packages/:slug`. */
export default async function LegacyTourRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/packages/${slug}`);
}
