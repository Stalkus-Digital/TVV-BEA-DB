import { redirect } from "next/navigation";

/**
 * /packages is a landing alias — there are two real listing pages
 * (/packages/domestic, /packages/international). Send anyone who lands
 * on the bare path to the domestic shelf, which is the more common entry.
 */
export default function PackagesIndex() {
  redirect("/packages/domestic");
}
