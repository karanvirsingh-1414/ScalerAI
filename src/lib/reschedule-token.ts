import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30;

function getSecret() {
  return process.env.RESCHEDULE_TOKEN_SECRET || "dev-reschedule-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createRescheduleToken(bookingId: string, guestEmail: string, expiresAt: number) {
  const payload = `${bookingId}.${guestEmail.toLowerCase()}.${expiresAt}`;
  const signature = sign(payload);
  return `${bookingId}.${expiresAt}.${signature}`;
}

export function createDefaultRescheduleToken(bookingId: string, guestEmail: string) {
  const expiresAt = Date.now() + DEFAULT_EXPIRY_MS;
  return createRescheduleToken(bookingId, guestEmail, expiresAt);
}

export function verifyRescheduleToken(
  token: string,
  bookingId: string,
  guestEmail: string
): { valid: boolean; expiresAt?: number } {
  const [tokenBookingId, expiresAtRaw, providedSignature] = token.split(".");
  if (!tokenBookingId || !expiresAtRaw || !providedSignature) return { valid: false };
  if (tokenBookingId !== bookingId) return { valid: false };

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return { valid: false };

  const payload = `${bookingId}.${guestEmail.toLowerCase()}.${expiresAt}`;
  const expectedSignature = sign(payload);

  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (providedBuffer.length !== expectedBuffer.length) return { valid: false };

  return {
    valid: timingSafeEqual(providedBuffer, expectedBuffer),
    expiresAt,
  };
}
