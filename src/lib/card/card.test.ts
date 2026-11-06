import { describe, expect, it } from "vitest";
import {
  BRANDS,
  KNOWN_TEST_NUMBERS,
  detectBrand,
  generateTestNumber,
  isLuhnValid,
  luhn,
  luhnCheckDigit,
  validateCard,
} from "./index";

describe("luhn", () => {
  it("accepts the worked example from the lesson", () => {
    const result = luhn("79927398713");
    expect(result.sum).toBe(70);
    expect(result.valid).toBe(true);
  });

  it("rejects a number with one digit changed", () => {
    expect(isLuhnValid("79927398714")).toBe(false);
  });

  it("catches every single-digit typo", () => {
    const good = "4242424242424242";
    for (let i = 0; i < good.length; i++) {
      for (let d = 0; d <= 9; d++) {
        if (String(d) === good[i]) continue;
        const bad = good.slice(0, i) + d + good.slice(i + 1);
        expect(isLuhnValid(bad), bad).toBe(false);
      }
    }
  });

  it("computes the check digit", () => {
    expect(luhnCheckDigit("7992739871")).toBe(3);
    expect(luhnCheckDigit("424242424242424")).toBe(2);
  });

  it("rejects non-digits and empty input", () => {
    expect(isLuhnValid("")).toBe(false);
    expect(isLuhnValid("4242 4242")).toBe(false);
  });
});

describe("known test numbers", () => {
  for (const brand of BRANDS) {
    it(`${brand.name} sandbox number is valid and detected`, () => {
      const number = KNOWN_TEST_NUMBERS[brand.id];
      const result = validateCard(number);
      expect(result.brand?.id).toBe(brand.id);
      expect(result.valid).toBe(true);
    });
  }
});

describe("detectBrand", () => {
  it("separates Discover 622126-622925 from the rest of UnionPay", () => {
    expect(detectBrand("622126").brand?.id).toBe("discover");
    expect(detectBrand("622925").brand?.id).toBe("discover");
    expect(detectBrand("622925").brand?.id).not.toBe("unionpay");
    expect(detectBrand("621000").brand?.id).toBe("unionpay");
    expect(detectBrand("622926").brand?.id).toBe("unionpay");
  });

  it("handles the Mastercard 2-series edges", () => {
    expect(detectBrand("2221").brand?.id).toBe("mastercard");
    expect(detectBrand("2720").brand?.id).toBe("mastercard");
    expect(detectBrand("2220").brand).toBeNull();
    expect(detectBrand("2721").brand).toBeNull();
  });

  it("tells Amex from Diners by the second digit", () => {
    expect(detectBrand("37").brand?.id).toBe("amex");
    expect(detectBrand("36").brand?.id).toBe("diners");
  });

  it("is undecided while a prefix is still ambiguous", () => {
    const { brand, candidates } = detectBrand("6");
    expect(brand).toBeNull();
    expect(candidates.length).toBeGreaterThan(1);
  });

  it("recognises Visa from the first digit", () => {
    expect(detectBrand("4").brand?.id).toBe("visa");
  });
});

describe("validateCard", () => {
  it("ignores spaces and dashes", () => {
    expect(validateCard("4242 4242 4242 4242").valid).toBe(true);
    expect(validateCard("4242-4242-4242-4242").valid).toBe(true);
  });

  it("flags letters", () => {
    expect(validateCard("4242 4242 4242 424x").issues).toContain("non-digit");
  });

  it("reports an empty field", () => {
    expect(validateCard("").issues).toEqual(["empty"]);
  });

  it("does not shout about the check digit before the number is long enough", () => {
    const result = validateCard("42424");
    expect(result.issues).toContain("too-short");
    expect(result.issues).not.toContain("luhn");
  });

  it("flags a right-length number with a bad check digit", () => {
    const result = validateCard("4242424242424241");
    expect(result.valid).toBe(false);
    expect(result.issues).toContain("luhn");
  });

  it("enforces Amex at 15 digits", () => {
    expect(validateCard("3782822463100050").valid).toBe(false);
    expect(validateCard("378282246310005").valid).toBe(true);
  });

  it("lets UnionPay through without Luhn but still checks length", () => {
    expect(validateCard("6200000000000000").valid).toBe(true);
    expect(validateCard("62000000").valid).toBe(false);
  });

  it("formats Amex as 4-6-5", () => {
    expect(validateCard("378282246310005").formatted).toBe("3782 822463 10005");
  });
});

describe("generateTestNumber", () => {
  it("always produces numbers that validate for their own brand", () => {
    for (const brand of BRANDS) {
      for (const length of brand.lengths) {
        for (let i = 0; i < 25; i++) {
          const number = generateTestNumber(brand.id, { length });
          const result = validateCard(number);
          expect(number).toHaveLength(length);
          expect(result.brand?.id, `${brand.id} ${number}`).toBe(brand.id);
          expect(result.valid, `${brand.id} ${number}`).toBe(true);
        }
      }
    }
  });

  it("rejects a length the brand does not issue", () => {
    expect(() => generateTestNumber("amex", { length: 16 })).toThrow(RangeError);
  });
});
