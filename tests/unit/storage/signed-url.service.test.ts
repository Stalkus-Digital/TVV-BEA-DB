import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { SignedUrlService } from "@/modules/storage/signed-urls/signed-url.service";

describe("SignedUrlService", () => {
  it("signs a key and successfully verifies it before expiry", () => {
    const service = new SignedUrlService("test-secret", 300);
    const signed = service.sign("bookings/invoices/booking-1/invoice-abc.pdf");
    const verified = service.verify(signed.key, signed.expiresAt, signed.signature);
    expect(isOk(verified)).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const service = new SignedUrlService("test-secret", 300);
    const signed = service.sign("bookings/invoices/booking-1/invoice-abc.pdf");
    const verified = service.verify(signed.key, signed.expiresAt, `${signed.signature}tampered`);
    expect(isErr(verified)).toBe(true);
  });

  it("rejects a signature issued for a different key", () => {
    const service = new SignedUrlService("test-secret", 300);
    const signed = service.sign("bookings/invoices/booking-1/invoice-abc.pdf");
    const verified = service.verify("bookings/invoices/booking-2/invoice-xyz.pdf", signed.expiresAt, signed.signature);
    expect(isErr(verified)).toBe(true);
  });

  it("rejects an already-expired signature, even with a correctly-computed signature", () => {
    const service = new SignedUrlService("test-secret", 300);
    const signed = service.sign("bookings/invoices/booking-1/invoice-abc.pdf", -3600);
    expect(signed.expiresAt).toBeLessThan(Math.floor(Date.now() / 1000));
    const verified = service.verify(signed.key, signed.expiresAt, signed.signature);
    expect(isErr(verified)).toBe(true);
  });

  it("produces different signatures under two different secrets for the same key/expiresAt", () => {
    const a = new SignedUrlService("secret-a", 300);
    const b = new SignedUrlService("secret-b", 300);
    const signedA = a.sign("packages/pkg-1/package-image-abc.jpg", 100);
    const verifiedByB = b.verify(signedA.key, signedA.expiresAt, signedA.signature);
    expect(isErr(verifiedByB)).toBe(true);
  });
});
