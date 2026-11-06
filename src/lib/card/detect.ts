import { BRANDS } from "./brands";
import type { Brand, Prefix } from "./types";

/**
 * Does what has been typed so far agree with this prefix?
 *
 * With fewer digits than the prefix has, we compare against the truncated
 * range, so "62" is still a candidate for 622126-622925 and so is "6".
 */
function matchesPrefix(digits: string, prefix: Prefix): boolean {
  const [lo, hi] = typeof prefix === "string" ? [prefix, prefix] : prefix;
  const width = lo.length;
  const k = Math.min(digits.length, width);
  if (k === 0) return false;

  const typed = Number(digits.slice(0, k));
  const cut = 10 ** (width - k);
  return typed >= Math.floor(Number(lo) / cut) && typed <= Math.floor(Number(hi) / cut);
}

/** A prefix is settled once the user has typed at least as many digits as it has. */
function isSettled(digits: string, prefix: Prefix): boolean {
  const width = (typeof prefix === "string" ? prefix : prefix[0]).length;
  return digits.length >= width && matchesPrefix(digits, prefix);
}

export interface Detection {
  /** The brand when we are sure, otherwise null. */
  brand: Brand | null;
  /** Every brand still compatible with the digits typed so far. */
  candidates: Brand[];
}

export function detectBrand(digits: string): Detection {
  if (!digits) return { brand: null, candidates: [] };

  const candidates = BRANDS.filter((b) => b.prefixes.some((p) => matchesPrefix(digits, p)));
  const settled = candidates.find((b) => b.prefixes.some((p) => isSettled(digits, p)));

  if (settled) return { brand: settled, candidates };
  if (candidates.length === 1) return { brand: candidates[0], candidates };
  return { brand: null, candidates };
}
