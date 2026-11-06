import type { Brand } from "./types";

export interface ExpiryResult {
  valid: boolean;
  month?: number;
  year?: number;
  reason?: "format" | "month" | "expired" | "too-far";
}

/** Turn "1" into "1", "12" into "12/", "1226" into "12/26". Used while typing. */
export function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 2) return digits;
  // A first digit of 2-9 can only be a single-digit month, so pad it.
  if (digits.length === 2 && Number(digits) > 12) return `0${digits[0]}/${digits[1]}`;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** A card works until the last day of its expiry month. Cards are not issued for more than ~20 years. */
export function validateExpiry(input: string, now: Date = new Date()): ExpiryResult {
  const match = /^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/.exec(input.trim());
  if (!match) return { valid: false, reason: "format" };

  const month = Number(match[1]);
  const rawYear = Number(match[2]);
  const year = match[2].length === 2 ? 2000 + rawYear : rawYear;

  if (month < 1 || month > 12) return { valid: false, reason: "month" };

  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  if (year < thisYear || (year === thisYear && month < thisMonth)) {
    return { valid: false, month, year, reason: "expired" };
  }
  if (year > thisYear + 20) return { valid: false, month, year, reason: "too-far" };

  return { valid: true, month, year };
}

/** American Express uses 4 digits, nearly everyone else uses 3. When the brand is unknown, accept either. */
export function validateCvv(input: string, brand: Brand | null): boolean {
  if (!/^\d+$/.test(input)) return false;
  if (!brand) return input.length === 3 || input.length === 4;
  return input.length === brand.cvvLength;
}
