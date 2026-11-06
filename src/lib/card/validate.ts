import { detectBrand } from "./detect";
import { formatNumber, sanitize } from "./format";
import { luhn } from "./luhn";
import type { Issue, Validation } from "./types";

/**
 * Validate what a person typed into a card number field.
 * Spaces and dashes are fine. Any other character is reported as `non-digit`.
 *
 * This only proves the number is well formed. It says nothing about whether
 * the card exists, has funds or belongs to the person typing. The bank decides that.
 */
export function validateCard(input: string): Validation {
  const issues: Issue[] = [];
  const digits = sanitize(input);

  if (/[^\d\s-]/.test(input)) issues.push("non-digit");

  if (!digits) {
    return {
      digits,
      brand: null,
      candidates: [],
      lengthOk: false,
      luhnOk: false,
      valid: false,
      complete: false,
      issues: issues.length ? issues : ["empty"],
      formatted: "",
    };
  }

  const { brand, candidates } = detectBrand(digits);
  const luhnOk = luhn(digits).valid;

  let lengthOk = false;
  let complete = false;

  if (!brand) {
    issues.push("unknown-brand");
  } else {
    const shortest = Math.min(...brand.lengths);
    const longest = Math.max(...brand.lengths);
    lengthOk = brand.lengths.includes(digits.length);
    complete = digits.length >= shortest && digits.length <= longest;

    if (digits.length > longest) issues.push("too-long");
    else if (digits.length < shortest) issues.push("too-short");
    else if (!lengthOk) issues.push("bad-length");

    // Only complain about the check digit once the length is plausible,
    // otherwise every half-typed number would look "wrong".
    if (complete && !luhnOk && brand.luhnRequired) issues.push("luhn");
  }

  const luhnPasses = luhnOk || (brand !== null && !brand.luhnRequired);
  const valid = brand !== null && lengthOk && luhnPasses;
  const printedLength = brand?.lengths.includes(digits.length) ? digits.length : (brand?.lengths[0] ?? digits.length);

  return {
    digits,
    brand,
    candidates,
    lengthOk,
    luhnOk,
    valid,
    complete,
    issues,
    formatted: formatNumber(digits, brand, printedLength),
  };
}
