import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingVoucher as PrismaBookingVoucherRow } from "@/generated/prisma/client";
import type { BookingVoucher } from "../types/booking-voucher";
import type { VoucherRepository } from "./voucher.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaBookingVoucherRow): BookingVoucher {
  return {
    ...row,
    validity: row.validity as unknown as BookingVoucher["validity"],
    items: row.items as unknown as BookingVoucher["items"],
    supplierReferences: row.supplierReferences as unknown as BookingVoucher["supplierReferences"],
    issuedAt: row.issuedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaVoucherRepository implements VoucherRepository {
  async findById(id: string): Promise<Result<BookingVoucher | null, AppError>> {
    const row = await prisma.bookingVoucher.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>> {
    const rows = await prisma.bookingVoucher.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(await prisma.bookingVoucher.count());
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingVoucher>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingVoucher.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingVoucher.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingVoucher, "id">): Promise<Result<BookingVoucher, AppError>> {
    const row = await prisma.bookingVoucher.create({
      data: {
        ...data,
        validity: data.validity !== null ? (data.validity as object) : undefined,
        items: data.items as unknown as object,
        supplierReferences: data.supplierReferences as unknown as object,
      },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingVoucher, "id">>): Promise<Result<BookingVoucher, AppError>> {
    try {
      const row = await prisma.bookingVoucher.update({
        where: { id },
        data: {
          ...data,
          validity: data.validity !== undefined ? (data.validity as object) : undefined,
          items: data.items !== undefined ? (data.items as unknown as object) : undefined,
          supplierReferences: data.supplierReferences !== undefined ? (data.supplierReferences as unknown as object) : undefined,
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking voucher "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingVoucher.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking voucher "${id}" not found`));
    }
  }
}
