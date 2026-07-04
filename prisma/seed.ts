/**
 * Reuses the exact seeding logic already built and verified in Sprint 11
 * (Auth Platform) — RoleService.ensureSeeded(), PermissionService.ensureSeeded(),
 * and the bootstrap SUPER_ADMIN creation in src/modules/auth/module.ts —
 * rather than duplicating that logic here. "Default Settings" (also asked
 * for in this sprint's Seed section): no dedicated Settings entity exists
 * anywhere in this codebase (SETTINGS is a permission-resource category
 * only, reserved for a future admin-settings feature, same "reserved but
 * inert" pattern as Package.aiGeneratedFromId) — there is nothing to seed
 * beyond the roles/permissions/admin already covered here.
 */
import "dotenv/config";
import { ensureAuthModuleSeeded } from "@/modules/auth";

async function main() {
  await ensureAuthModuleSeeded();
  console.log("Seed complete: 12 roles, 36 permissions, bootstrap SUPER_ADMIN (admin@tvv-travel-os.local).");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
