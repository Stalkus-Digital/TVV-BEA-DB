import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type {
  Prisma,
  Enquiry as PrismaEnquiryRow,
  EnquiryNote as PrismaEnquiryNoteRow,
} from "@/generated/prisma/client";
import type { Enquiry, EnquiryNote } from "../types/enquiry";
import type { EnquiryListFilter, EnquiryRepository } from "./enquiry.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaEnquiryRow): Enquiry {
  return {
    ...row,
    type: row.type as Enquiry["type"],
    status: row.status as Enquiry["status"],
    followUpDate: row.followUpDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWhere(filter: EnquiryListFilter): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.type) where.type = filter.type;
  if (filter.assignedToUserId) where.assignedToUserId = filter.assignedToUserId;
  if (filter.source) where.source = filter.source;
  if (filter.search?.trim()) {
    const q = filter.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

function toNoteDomain(row: PrismaEnquiryNoteRow): EnquiryNote {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export class PrismaEnquiryRepository implements EnquiryRepository {
  async findById(id: string): Promise<Result<Enquiry | null, AppError>> {
    const row = await prisma.enquiry.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Enquiry>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: EnquiryListFilter): Promise<Result<PaginatedResult<Enquiry>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.enquiry.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.enquiry.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Enquiry, "id">): Promise<Result<Enquiry, AppError>> {
    const { followUpDate, ...rest } = data;
    const row = await prisma.enquiry.create({
      data: {
        ...rest,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt),
      },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Enquiry, "id">>): Promise<Result<Enquiry, AppError>> {
    try {
      const { followUpDate, createdAt: _c, updatedAt, ...rest } = data;
      const row = await prisma.enquiry.update({
        where: { id },
        data: {
          ...rest,
          ...(followUpDate !== undefined ? { followUpDate: followUpDate ? new Date(followUpDate) : null } : {}),
          ...(updatedAt !== undefined ? { updatedAt: new Date(updatedAt) } : {}),
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Enquiry "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.enquiry.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Enquiry "${id}" not found`));
    }
  }

  async listNotes(enquiryId: string): Promise<Result<EnquiryNote[], AppError>> {
    const rows = await prisma.enquiryNote.findMany({
      where: { enquiryId },
      orderBy: { createdAt: "desc" },
    });
    return ok(rows.map(toNoteDomain));
  }

  async addNote(data: Omit<EnquiryNote, "id">): Promise<Result<EnquiryNote, AppError>> {
    const row = await prisma.enquiryNote.create({ data });
    return ok(toNoteDomain(row));
  }

  async findNoteById(noteId: string): Promise<Result<EnquiryNote | null, AppError>> {
    const row = await prisma.enquiryNote.findUnique({ where: { id: noteId } });
    return ok(row ? toNoteDomain(row) : null);
  }

  async updateNote(noteId: string, body: string): Promise<Result<EnquiryNote, AppError>> {
    try {
      const row = await prisma.enquiryNote.update({ where: { id: noteId }, data: { body } });
      return ok(toNoteDomain(row));
    } catch {
      return err(new NotFoundError(`Enquiry note "${noteId}" not found`));
    }
  }

  async deleteNote(noteId: string): Promise<Result<void, AppError>> {
    try {
      await prisma.enquiryNote.delete({ where: { id: noteId } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Enquiry note "${noteId}" not found`));
    }
  }
}
