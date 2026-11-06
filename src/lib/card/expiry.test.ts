import { describe, expect, it } from "vitest";
import { BRAND_BY_ID, formatExpiry, validateCvv, validateExpiry } from "./index";

const NOW = new Date(2026, 10, 15); // 15 November 2026

describe("validateExpiry", () => {
  it("accepts the current month, the card is good until it ends", () => {
    expect(validateExpiry("11/26", NOW).valid).toBe(true);
  });

  it("rejects last month", () => {
    expect(validateExpiry("10/26", NOW)).toMatchObject({ valid: false, reason: "expired" });
  });

  it("accepts four digit years", () => {
    expect(validateExpiry("03/2030", NOW).valid).toBe(true);
  });

  it("rejects month 13 and garbage", () => {
    expect(validateExpiry("13/28", NOW).reason).toBe("month");
    expect(validateExpiry("hello", NOW).reason).toBe("format");
  });

  it("rejects dates far in the future", () => {
    expect(validateExpiry("01/60", NOW).reason).toBe("too-far");
  });
});

describe("formatExpiry", () => {
  it("adds the slash as you type", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12/");
    expect(formatExpiry("1226")).toBe("12/26");
  });

  it("pads a single digit month", () => {
    expect(formatExpiry("42")).toBe("04/2");
  });
});

describe("validateCvv", () => {
  it("wants 4 digits for Amex and 3 for Visa", () => {
    expect(validateCvv("1234", BRAND_BY_ID.amex)).toBe(true);
    expect(validateCvv("123", BRAND_BY_ID.amex)).toBe(false);
    expect(validateCvv("123", BRAND_BY_ID.visa)).toBe(true);
    expect(validateCvv("1234", BRAND_BY_ID.visa)).toBe(false);
  });

  it("accepts either length when the brand is unknown", () => {
    expect(validateCvv("123", null)).toBe(true);
    expect(validateCvv("1234", null)).toBe(true);
    expect(validateCvv("12", null)).toBe(false);
  });
});
