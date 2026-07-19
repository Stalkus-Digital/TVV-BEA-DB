import crypto from "crypto";
import { getIntegrationConfigResolver } from "@/modules/integrations";

export interface PhonePeCreatePaymentInput {
  bookingId: string;
  bookingNumber: string;
  amountInr: number;
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber?: string;
}

export interface PhonePeCreatePaymentResult {
  provider: "phonepe";
  merchantTransactionId: string;
  redirectUrl: string;
  amount: number;
  currency: "INR";
}

function buildXVerify(base64Payload: string, path: string, saltKey: string, saltIndex: string): string {
  const hash = crypto.createHash("sha256").update(base64Payload + path + saltKey).digest("hex");
  return `${hash}###${saltIndex}`;
}

/**
 * PhonePe Standard Checkout (Pay Page) adapter.
 * Uses Integrations vault credentials with env fallbacks.
 */
export class PhonePeAdapter {
  async createPayment(input: PhonePeCreatePaymentInput): Promise<PhonePeCreatePaymentResult> {
    const creds = await getIntegrationConfigResolver().getPhonePeCredentials();
    if (!creds.merchantId || !creds.saltKey) {
      throw new Error("PhonePe is not configured");
    }

    const merchantTransactionId = `TVV${Date.now()}${input.bookingId.slice(0, 8)}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 35);
    const amountPaise = Math.round(input.amountInr * 100);
    const baseUrl = (creds.baseUrl || "https://api-preprod.phonepe.com/apis/pg-sandbox").replace(/\/$/, "");
    const path = "/pg/v1/pay";

    const payload = {
      merchantId: creds.merchantId,
      merchantTransactionId,
      merchantUserId: input.bookingId,
      amount: amountPaise,
      redirectUrl: input.redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl: input.callbackUrl,
      paymentInstrument: { type: "PAY_PAGE" },
      ...(input.mobileNumber ? { mobileNumber: input.mobileNumber } : {}),
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const xVerify = buildXVerify(base64Payload, path, creds.saltKey, creds.saltIndex || "1");

    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        Accept: "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      code?: string;
      message?: string;
      data?: { instrumentResponse?: { redirectInfo?: { url?: string } } };
    };

    if (!response.ok || !data.success) {
      throw new Error(data.message || `PhonePe pay failed (${data.code || response.status})`);
    }

    const redirectUrl = data.data?.instrumentResponse?.redirectInfo?.url;
    if (!redirectUrl) {
      throw new Error("PhonePe did not return a redirect URL");
    }

    return {
      provider: "phonepe",
      merchantTransactionId,
      redirectUrl,
      amount: amountPaise,
      currency: "INR",
    };
  }

  async verifyCallbackChecksum(base64Response: string, xVerifyHeader: string | null): Promise<boolean> {
    const creds = await getIntegrationConfigResolver().getPhonePeCredentials();
    if (!creds.saltKey || !xVerifyHeader) return false;
    const expected = crypto
      .createHash("sha256")
      .update(base64Response + creds.saltKey)
      .digest("hex");
    const [hash] = xVerifyHeader.split("###");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
    } catch {
      return false;
    }
  }

  decodeCallback(base64Response: string): {
    merchantTransactionId?: string;
    transactionId?: string;
    amount?: number;
    code?: string;
    bookingId?: string;
  } {
    const raw = JSON.parse(Buffer.from(base64Response, "base64").toString("utf8")) as {
      code?: string;
      data?: {
        merchantTransactionId?: string;
        transactionId?: string;
        amount?: number;
        merchantUserId?: string;
      };
    };
    return {
      merchantTransactionId: raw.data?.merchantTransactionId,
      transactionId: raw.data?.transactionId,
      amount: raw.data?.amount,
      code: raw.code,
      bookingId: raw.data?.merchantUserId,
    };
  }
}

let phonePeSingleton: PhonePeAdapter | null = null;

export function getPhonePeAdapter(): PhonePeAdapter {
  if (!phonePeSingleton) phonePeSingleton = new PhonePeAdapter();
  return phonePeSingleton;
}
