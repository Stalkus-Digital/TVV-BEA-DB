import { err, ok, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { CustomerNote as PrismaCustomerNoteRow } from "@/generated/prisma/client";
import type { CustomerNote } from "../types/customer-note";
import type { CustomerNoteRepository } from "./customer-note.repository";

function toDomain(row: PrismaCustomerNoteRow): CustomerNote {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export class PrismaCustomerNoteRepository implements CustomerNoteRepository {
  async listByUserId(userId: string): Promise<Result<CustomerNote[], AppError>> {
    const rows = await prisma.customerNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return ok(rows.map(toDomain));
  }

  async findById(noteId: string): Promise<Result<CustomerNote | null, AppError>> {
    const row = await prisma.customerNote.findUnique({ where: { id: noteId } });
    return ok(row ? toDomain(row) : null);
  }

  async add(data: Omit<CustomerNote, "id">): Promise<Result<CustomerNote, AppError>> {
    const row = await prisma.customerNote.create({ data });
    return ok(toDomain(row));
  }

  async update(noteId: string, body: string): Promise<Result<CustomerNote, AppError>> {
    try {
      const row = await prisma.customerNote.update({ where: { id: noteId }, data: { body } });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Customer note "${noteId}" not found`));
    }
  }

  async delete(noteId: string): Promise<Result<void, AppError>> {
    try {
      await prisma.customerNote.delete({ where: { id: noteId } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Customer note "${noteId}" not found`));
    }
  }
}
