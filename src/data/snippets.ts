export interface Snippet {
  id: string;
  label: string;
  language: string;
  note?: string;
  code: string;
}

/**
 * Every Luhn snippet does the same thing: drop spaces and dashes, insist on 12 to 19 digits,
 * double every second digit from the right, fold anything above 9, and test the sum modulo 10.
 */
export const SNIPPETS: Snippet[] = [
  {
    id: "ts",
    label: "TypeScript",
    language: "typescript",
    code: `export function passesLuhn(input: string): boolean {
  const digits = input.replace(/[\\s-]/g, "");
  if (!/^\\d{12,19}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}`,
  },
  {
    id: "python",
    label: "Python",
    language: "python",
    code: `import re


def passes_luhn(number: str) -> bool:
    digits = re.sub(r"[\\s-]", "", number)
    if not re.fullmatch(r"\\d{12,19}", digits):
        return False

    total = 0
    for i, ch in enumerate(reversed(digits)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0`,
  },
  {
    id: "java",
    label: "Java",
    language: "java",
    code: `public final class Luhn {
    private Luhn() {}

    public static boolean passes(String input) {
        String digits = input.replaceAll("[\\\\s-]", "");
        if (!digits.matches("\\\\d{12,19}")) return false;

        int sum = 0;
        for (int i = 0; i < digits.length(); i++) {
            int d = digits.charAt(digits.length() - 1 - i) - '0';
            if (i % 2 == 1) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
        }
        return sum % 10 == 0;
    }
}`,
  },
  {
    id: "php",
    label: "PHP",
    language: "php",
    code: `<?php

function passes_luhn(string $input): bool
{
    $digits = preg_replace('/[\\s-]/', '', $input);
    if (!preg_match('/^\\d{12,19}$/', $digits)) {
        return false;
    }

    $sum = 0;
    $length = strlen($digits);
    for ($i = 0; $i < $length; $i++) {
        $d = (int) $digits[$length - 1 - $i];
        if ($i % 2 === 1) {
            $d *= 2;
            if ($d > 9) {
                $d -= 9;
            }
        }
        $sum += $d;
    }
    return $sum % 10 === 0;
}`,
  },
  {
    id: "go",
    label: "Go",
    language: "go",
    code: `package luhn

import "strings"

func Passes(input string) bool {
	digits := strings.NewReplacer(" ", "", "-", "").Replace(input)
	if len(digits) < 12 || len(digits) > 19 {
		return false
	}

	sum := 0
	for i := 0; i < len(digits); i++ {
		c := digits[len(digits)-1-i]
		if c < '0' || c > '9' {
			return false
		}
		d := int(c - '0')
		if i%2 == 1 {
			d *= 2
			if d > 9 {
				d -= 9
			}
		}
		sum += d
	}
	return sum%10 == 0
}`,
  },
  {
    id: "csharp",
    label: "C#",
    language: "csharp",
    code: `using System.Linq;
using System.Text.RegularExpressions;

public static class Luhn
{
    public static bool Passes(string input)
    {
        var digits = Regex.Replace(input, @"[\\s-]", "");
        if (!Regex.IsMatch(digits, @"^\\d{12,19}$")) return false;

        var sum = 0;
        foreach (var (ch, i) in digits.Reverse().Select((c, i) => (c, i)))
        {
            var d = ch - '0';
            if (i % 2 == 1)
            {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
        }
        return sum % 10 == 0;
    }
}`,
  },
  {
    id: "brand",
    label: "Brand detection",
    language: "typescript",
    note: "Prefix and length rules for the big four. Add more networks the same way.",
    code: `type Rule = { name: string; prefixes: [string, string][]; lengths: number[] };

const RULES: Rule[] = [
  { name: "American Express", prefixes: [["34", "34"], ["37", "37"]], lengths: [15] },
  { name: "Mastercard", prefixes: [["51", "55"], ["2221", "2720"]], lengths: [16] },
  { name: "Visa", prefixes: [["4", "4"]], lengths: [13, 16, 19] },
  {
    name: "Discover",
    prefixes: [["6011", "6011"], ["644", "649"], ["65", "65"], ["622126", "622925"]],
    lengths: [16, 17, 18, 19],
  },
];

// Compare only as many digits as the prefix has, so ranges work for any width.
function hasPrefix(digits: string, [lo, hi]: [string, string]): boolean {
  if (digits.length < lo.length) return false;
  const head = Number(digits.slice(0, lo.length));
  return head >= Number(lo) && head <= Number(hi);
}

export function detectBrand(input: string): string | null {
  const digits = input.replace(/\\D/g, "");
  const rule = RULES.find(
    (r) => r.lengths.includes(digits.length) && r.prefixes.some((p) => hasPrefix(digits, p)),
  );
  return rule ? rule.name : null;
}`,
  },
];
