import type { LuhnResult, LuhnStep } from "./types";

/**
 * Walk a digit string the way the Luhn algorithm does and record every step.
 * Starting from the rightmost digit (the check digit), every second digit is doubled.
 * If doubling gives more than 9, subtract 9 (same as adding the two digits of the result).
 */
export function luhnSteps(digits: string): LuhnStep[] {
  const steps: LuhnStep[] = [];
  const last = digits.length - 1;

  for (let i = 0; i <= last; i++) {
    const digit = digits.charCodeAt(i) - 48;
    const fromRight = last - i + 1;
    const doubled = fromRight % 2 === 0;

    if (!doubled) {
      steps.push({ index: i, digit, fromRight, doubled, value: digit });
      continue;
    }

    const rawDoubled = digit * 2;
    steps.push({
      index: i,
      digit,
      fromRight,
      doubled,
      rawDoubled,
      value: rawDoubled > 9 ? rawDoubled - 9 : rawDoubled,
    });
  }

  return steps;
}

/** Run the full check. `digits` must contain digits only. */
export function luhn(digits: string): LuhnResult {
  if (!/^\d+$/.test(digits)) {
    return { valid: false, sum: 0, remainder: 0, steps: [] };
  }
  const steps = luhnSteps(digits);
  const sum = steps.reduce((total, s) => total + s.value, 0);
  const remainder = sum % 10;
  return { valid: remainder === 0, sum, remainder, steps };
}

export function isLuhnValid(digits: string): boolean {
  return luhn(digits).valid;
}

/** Given a number without its final digit, return the check digit that makes it pass. */
export function luhnCheckDigit(partial: string): number {
  // Appending a 0 makes every digit of `partial` shift one place left, so the sum
  // we get is exactly what the real check digit has to top up to a multiple of 10.
  const { sum } = luhn(`${partial}0`);
  return (10 - (sum % 10)) % 10;
}
