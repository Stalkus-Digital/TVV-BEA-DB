import { permanentRedirect } from "next/navigation";

/** Legacy `/destinations-v2/*` URLs → canonical `/destinations/*` (301). */
export default async function DestinationsV2Redirect({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;
  permanentRedirect(`/destinations/${slugs.join("/")}`);
}
