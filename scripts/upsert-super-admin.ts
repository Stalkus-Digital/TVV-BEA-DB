/**
 * One-off: upsert bootstrap SUPER_ADMIN with a known password.
 * Usage: npx tsx --env-file=.env scripts/upsert-super-admin.ts
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const scryptAsync = promisify(scrypt);
const EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@tvv-travel-os.local";
const PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "ChangeMe123!";
const FULL_NAME = process.env.BOOTSTRAP_ADMIN_NAME ?? "System Administrator";

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const host = process.env.DATABASE_URL.replace(/^[^@]+@/, "").split("/")[0].split(":")[0];
  console.log(`Connecting to host=${host}`);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const now = new Date();
    const passwordHash = await hashPassword(PASSWORD);

    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      create: {
        email: EMAIL,
        passwordHash,
        fullName: FULL_NAME,
        isActive: true,
        emailVerifiedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        passwordHash,
        fullName: FULL_NAME,
        isActive: true,
        emailVerifiedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      },
    });

    let role = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Full system access, including user, role, and settings administration.",
          isSystem: true,
          createdAt: now,
          updatedAt: now,
        },
      });
      console.log("Created SUPER_ADMIN role");
    }

    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          assignedAt: now,
        },
      });
      console.log("Assigned SUPER_ADMIN role");
    } else {
      console.log("SUPER_ADMIN role already assigned");
    }

    console.log(`Upserted SUPER_ADMIN email=${EMAIL} id=${user.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
