import type { Brand } from "./types";

const DEFAULT_GAPS = [4, 8, 12] as const;

/** Strip everything that is not a digit. */
export function sanitize(input: string): string {
  return input.replace(/\D/g, "");
}

export function gapsFor(brand: Brand | null, length: number): readonly number[] {
  if (!brand) return DEFAULT_GAPS;
  return brand.gaps[length] ?? brand.gaps.default;
}

/** Group digits the way they are printed on the card. */
export function formatNumber(digits: string, brand: Brand | null, targetLength = digits.length): string {
  const gaps = gapsFor(brand, targetLength);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (gaps.includes(i)) out += " ";
    out += digits[i];
  }
  return out;
}

/**
 * What to print on the card face while someone is still typing:
 * the digits so far, grouped, with bullets standing in for the ones to come.
 */
export function displayNumber(digits: string, brand: Brand | null): string {
  const settled = brand?.lengths.includes(digits.length) ?? false;
  const target = brand
    ? settled || digits.length > brand.lengths[0]
      ? digits.length
      : brand.lengths[0]
    : Math.max(16, digits.length);
  return formatNumber(digits.padEnd(target, "•"), brand, target);
}

/** The longest number this brand issues, or 19 (the ISO maximum) if we do not know yet. */
export function maxLength(brand: Brand | null): number {
  return brand ? Math.max(...brand.lengths) : 19;
}
