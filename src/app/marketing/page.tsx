import { redirect } from "next/navigation";

/** Marketing hub is retired — Landing Pages live under CMS. */
export default function Page() {
  redirect("/cms");
}
