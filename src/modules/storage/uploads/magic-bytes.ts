/**
 * SECURITY-002C: content-based type detection — never trust the client's
 * declared Content-Type or the filename extension alone (a renamed
 * `virus.exe` claiming `image/jpeg` passes both). Zero-dependency by
 * design, same discipline as JwtService/Logger/DI elsewhere in this
 * project: this app allows exactly 5 MIME types today (JPEG, PNG, WEBP,
 * GIF, PDF), a small enough set that hand-rolled signature checks are
 * simpler and more auditable than pulling in a file-type detection
 * library for it.
 *
 * Returns the detected MIME type from the file's actual bytes, or null if
 * it doesn't match any known signature — including any format not in the
 * allowlist below (an unrecognized binary is rejected, not passed through).
 */
export type DetectableMimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";

function matchesAt(buffer: Buffer, offset: number, bytes: number[]): boolean {
  if (buffer.length < offset + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[offset + i] !== bytes[i]) return false;
  }
  return true;
}

export function detectContentType(buffer: Buffer): DetectableMimeType | null {
  // JPEG: FF D8 FF
  if (matchesAt(buffer, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (matchesAt(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";

  // GIF: "GIF87a" or "GIF89a"
  if (matchesAt(buffer, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61])) return "image/gif";
  if (matchesAt(buffer, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) return "image/gif";

  // WEBP: "RIFF" .... "WEBP"
  if (matchesAt(buffer, 0, [0x52, 0x49, 0x46, 0x46]) && matchesAt(buffer, 8, [0x57, 0x45, 0x42, 0x50])) return "image/webp";

  // PDF: "%PDF-"
  if (matchesAt(buffer, 0, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";

  return null;
}

/** True if the file's actual bytes match what the (already MIME-allowlisted) contentType claims to be. */
export function contentMatchesDeclaredType(buffer: Buffer, declaredContentType: string): boolean {
  const detected = detectContentType(buffer);
  return detected !== null && detected === declaredContentType.trim().toLowerCase();
}
