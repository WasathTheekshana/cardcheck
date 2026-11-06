export type BrandId =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "maestro";

/** A prefix is either an exact digit string ("34") or an inclusive numeric range of the same width. */
export type Prefix = string | readonly [lo: string, hi: string];

export interface Brand {
  id: BrandId;
  name: string;
  /** Issuer identification number (IIN) prefixes that belong to this network. */
  prefixes: readonly Prefix[];
  /** Lengths the network issues. The first one is the most common. */
  lengths: readonly number[];
  /** Where the spaces go when the number is shown on a card. Keyed by length, with a default. */
  gaps: Readonly<Record<number, readonly number[]>> & { default: readonly number[] };
  cvvLabel: "CVV" | "CVC" | "CID" | "CVN";
  cvvLength: 3 | 4;
  /** UnionPay is the one major network that does not always use Luhn. */
  luhnRequired: boolean;
  /** Card face colours, used by the 3D card and the brand cards. */
  colors: { from: string; to: string; ink: string };
}

export interface LuhnStep {
  /** Index in the original string, 0 is the leftmost digit. */
  index: number;
  digit: number;
  /** Position counted from the right, starting at 1 for the check digit. */
  fromRight: number;
  doubled: boolean;
  /** The digit after doubling and the "subtract 9" rule. Same as `digit` when not doubled. */
  value: number;
  /** The raw doubled value before subtracting 9, only set when `doubled` is true. */
  rawDoubled?: number;
}

export interface LuhnResult {
  valid: boolean;
  sum: number;
  remainder: number;
  steps: LuhnStep[];
}

export type Issue =
  | "empty"
  | "non-digit"
  | "unknown-brand"
  | "too-short"
  | "too-long"
  | "bad-length"
  | "luhn";

export interface Validation {
  /** The digits only, spaces and dashes removed. */
  digits: string;
  brand: Brand | null;
  /** Brands that still fit what has been typed so far. */
  candidates: Brand[];
  lengthOk: boolean;
  luhnOk: boolean;
  /** True when length is right and Luhn passes (or the brand does not require it). */
  valid: boolean;
  /** True when the digit count is within what the brand issues. */
  complete: boolean;
  issues: Issue[];
  formatted: string;
}
