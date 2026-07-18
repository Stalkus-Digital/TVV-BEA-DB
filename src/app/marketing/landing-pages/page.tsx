import { redirect } from "next/navigation";

/** Landing Pages moved from Marketing to CMS. */
export default function Page() {
  redirect("/cms/landing-pages");
}
