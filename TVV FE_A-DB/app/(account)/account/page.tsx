import { permanentRedirect } from "next/navigation";

/** Legacy `/account` URLs redirect to canonical `/dashboard`. */
export default function LegacyAccountRedirect() {
  permanentRedirect("/dashboard");
}
