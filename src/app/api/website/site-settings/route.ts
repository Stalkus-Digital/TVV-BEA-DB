import { jsonSuccess } from "@/api";
import { CmsConfigService } from "@/modules/website/services/cms-config.service";

const DEFAULT_SITE_SETTINGS = {
  phone: "+91 9123 456 789",
  whatsapp: "+91 9123 456 789",
  email: "hello@thevacationvoice.com",
  bookingEmail: "bookings@thevacationvoice.com",
  name: "The Vacation Voice",
  address: "Port Blair · Bengaluru · Mumbai",
  footerTagline: "Curated global journeys, designed by specialists.",
  socialLinks: {
    instagram: "https://instagram.com/thevacationvoice",
    facebook: "https://facebook.com/thevacationvoice",
  },
};

export async function GET() {
  const stored = await CmsConfigService.getInstance().getConfig("SITE_SETTINGS");
  const value = stored && typeof stored === "object" ? { ...DEFAULT_SITE_SETTINGS, ...(stored as object) } : DEFAULT_SITE_SETTINGS;
  return jsonSuccess(value);
}
