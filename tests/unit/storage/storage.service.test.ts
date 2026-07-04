import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { createLogger } from "@/shared/logger";
import { StorageCategory } from "@/modules/storage/types/storage-category";
import { FakeStorageProvider } from "@/modules/storage/providers/fake-storage.provider";
import { SignedUrlService } from "@/modules/storage/signed-urls/signed-url.service";
import { StorageService } from "@/modules/storage/services/storage.service";

function buildService() {
  const provider = new FakeStorageProvider();
  const signedUrls = new SignedUrlService("test-secret", 300);
  const service = new StorageService({ logger: createLogger("test.storage") }, provider, signedUrls);
  return { service, provider };
}

describe("StorageService.upload", () => {
  it("uploads a valid image and returns a StorageObject with PUBLIC visibility", async () => {
    const { service } = buildService();
    const result = await service.upload(Buffer.from("fake-image-bytes"), {
      category: StorageCategory.PROFILE_IMAGE,
      ownerId: "user-1",
      fileName: "avatar.jpg",
      contentType: "image/jpeg",
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.visibility).toBe("PUBLIC");
      expect(result.value.key.startsWith("profiles/user-1/")).toBe(true);
      expect(result.value.size).toBe(Buffer.byteLength("fake-image-bytes"));
    }
  });

  it("uploads a valid document and returns a StorageObject with PRIVATE visibility", async () => {
    const { service } = buildService();
    const result = await service.upload(Buffer.from("%PDF-fake"), {
      category: StorageCategory.INVOICE,
      ownerId: "booking-1",
      fileName: "invoice.pdf",
      contentType: "application/pdf",
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.visibility).toBe("PRIVATE");
  });

  it("rejects an upload with a disallowed content type before ever calling the provider", async () => {
    const { service, provider } = buildService();
    const result = await service.upload(Buffer.from("bytes"), {
      category: StorageCategory.PROFILE_IMAGE,
      ownerId: "user-1",
      fileName: "malware.exe",
      contentType: "application/x-msdownload",
    });
    expect(isErr(result)).toBe(true);
    expect(provider.size).toBe(0);
  });
});

describe("StorageService.delete / getMetadata — ownership enforcement", () => {
  it("allows the owner to delete their own object", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("bytes"), {
      category: StorageCategory.PASSPORT,
      ownerId: "customer-1",
      fileName: "passport.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const deleted = await service.delete(StorageCategory.PASSPORT, uploaded.value.key, "customer-1");
    expect(isOk(deleted)).toBe(true);
  });

  it("refuses to delete when the caller doesn't own the object", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("bytes"), {
      category: StorageCategory.PASSPORT,
      ownerId: "customer-1",
      fileName: "passport.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const deleted = await service.delete(StorageCategory.PASSPORT, uploaded.value.key, "customer-2");
    expect(isErr(deleted)).toBe(true);
    if (isErr(deleted)) expect(deleted.error.name).toBe("NotFoundError");
  });

  it("refuses getMetadata for a non-owner", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("bytes"), {
      category: StorageCategory.VISA,
      ownerId: "customer-1",
      fileName: "visa.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const metadata = await service.getMetadata(StorageCategory.VISA, uploaded.value.key, "someone-else");
    expect(isErr(metadata)).toBe(true);
  });
});

describe("StorageService.replace", () => {
  it("uploads the new object and deletes the old one, preserving the ownerId", async () => {
    const { service, provider } = buildService();
    const original = await service.upload(Buffer.from("v1"), {
      category: StorageCategory.VOUCHER,
      ownerId: "booking-9",
      fileName: "voucher.pdf",
      contentType: "application/pdf",
    });
    if (isErr(original)) throw new Error("setup failed");

    const replaced = await service.replace(Buffer.from("v2"), {
      category: StorageCategory.VOUCHER,
      ownerId: "booking-9",
      fileName: "voucher.pdf",
      contentType: "application/pdf",
      existingKey: original.value.key,
    });
    expect(isOk(replaced)).toBe(true);
    if (isOk(replaced)) {
      expect(replaced.value.key).not.toBe(original.value.key);
      expect(provider.has(original.value.key)).toBe(false);
      expect(provider.has(replaced.value.key)).toBe(true);
    }
  });

  it("refuses to replace when the asserted ownerId doesn't match the existing key's owner", async () => {
    const { service, provider } = buildService();
    const original = await service.upload(Buffer.from("v1"), {
      category: StorageCategory.VOUCHER,
      ownerId: "booking-9",
      fileName: "voucher.pdf",
      contentType: "application/pdf",
    });
    if (isErr(original)) throw new Error("setup failed");

    const replaced = await service.replace(Buffer.from("v2"), {
      category: StorageCategory.VOUCHER,
      ownerId: "booking-10",
      fileName: "voucher.pdf",
      contentType: "application/pdf",
      existingKey: original.value.key,
    });
    expect(isErr(replaced)).toBe(true);
    // the original object must be untouched since ownership failed before any upload/delete happened
    expect(provider.has(original.value.key)).toBe(true);
  });
});

describe("StorageService.getSignedUrl / downloadPrivateObject", () => {
  it("issues a signed URL for the owner and the download proxy accepts it", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("secret-bytes"), {
      category: StorageCategory.INSURANCE,
      ownerId: "customer-7",
      fileName: "insurance.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const signed = await service.getSignedUrl(StorageCategory.INSURANCE, uploaded.value.key, "customer-7");
    expect(isOk(signed)).toBe(true);
    if (!isOk(signed)) return;

    const url = new URL(signed.value.url, "http://localhost");
    const key = url.searchParams.get("key")!;
    const expiresAt = Number(url.searchParams.get("expiresAt"));
    const signature = url.searchParams.get("signature")!;

    const downloaded = await service.downloadPrivateObject(key, expiresAt, signature);
    expect(isOk(downloaded)).toBe(true);
    if (isOk(downloaded)) expect(downloaded.value.body.toString()).toBe("secret-bytes");
  });

  it("refuses to issue a signed URL for a non-owner", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("secret-bytes"), {
      category: StorageCategory.INSURANCE,
      ownerId: "customer-7",
      fileName: "insurance.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const signed = await service.getSignedUrl(StorageCategory.INSURANCE, uploaded.value.key, "customer-8");
    expect(isErr(signed)).toBe(true);
  });

  it("rejects a download whose signature was tampered with", async () => {
    const { service } = buildService();
    const uploaded = await service.upload(Buffer.from("secret-bytes"), {
      category: StorageCategory.INSURANCE,
      ownerId: "customer-7",
      fileName: "insurance.pdf",
      contentType: "application/pdf",
    });
    if (isErr(uploaded)) throw new Error("setup failed");

    const signed = await service.getSignedUrl(StorageCategory.INSURANCE, uploaded.value.key, "customer-7");
    if (!isOk(signed)) throw new Error("setup failed");
    const url = new URL(signed.value.url, "http://localhost");
    const key = url.searchParams.get("key")!;
    const expiresAt = Number(url.searchParams.get("expiresAt"));

    const downloaded = await service.downloadPrivateObject(key, expiresAt, "tampered-signature");
    expect(isErr(downloaded)).toBe(true);
  });
});
