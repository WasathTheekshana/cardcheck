import { BRAND_BY_ID } from "./brands";
import { detectBrand } from "./detect";
import { luhnCheckDigit } from "./luhn";
import type { Brand, BrandId, Prefix } from "./types";

type Rng = () => number;

function randomDigits(count: number, rng: Rng): string {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(rng() * 10);
  return out;
}

function pickPrefix(prefixes: readonly Prefix[], rng: Rng): string {
  const prefix = prefixes[Math.floor(rng() * prefixes.length)];
  if (typeof prefix === "string") return prefix;
  const [lo, hi] = prefix;
  const n = Number(lo) + Math.floor(rng() * (Number(hi) - Number(lo) + 1));
  return String(n).padStart(lo.length, "0");
}

/**
 * Build a number that passes the length, prefix and Luhn checks for the given brand.
 * It is made up. It is not tied to any account and a payment processor will reject it.
 * Use it to test your own forms.
 */
export function generateTestNumber(brandId: BrandId, options: { length?: number; rng?: Rng } = {}): string {
  const brand: Brand = BRAND_BY_ID[brandId];
  const rng = options.rng ?? Math.random;
  const length = options.length ?? brand.lengths[0];

  if (!brand.lengths.includes(length)) {
    throw new RangeError(`${brand.name} cards are not issued with ${length} digits`);
  }

  // Some ranges are shared (UnionPay's 62 also covers Discover's 622126-622925).
  // Re-roll until our own detector agrees on the brand, so the output always round-trips.
  for (let attempt = 0; attempt < 100; attempt++) {
    const prefix = pickPrefix(brand.prefixes, rng);
    const body = prefix + randomDigits(length - prefix.length - 1, rng);
    const number = body + luhnCheckDigit(body);
    if (detectBrand(number).brand?.id === brand.id) return number;
  }

  throw new Error(`Could not generate a ${brand.name} test number`);
}

/**
 * Public sandbox numbers that payment providers document for testing.
 * They pass Luhn and cannot be charged.
 */
export const KNOWN_TEST_NUMBERS: Readonly<Record<BrandId, string>> = {
  visa: "4242424242424242",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  discover: "6011111111111117",
  diners: "30569309025904",
  jcb: "3530111333300000",
  unionpay: "6200000000000005",
  maestro: "6759649826438453",
};
