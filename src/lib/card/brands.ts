import type { Brand, BrandId } from "./types";

const fourFourFourFour = [4, 8, 12];

/**
 * Order matters: more specific ranges come before broader ones.
 * Discover's 622126-622925 has to be checked before UnionPay's 62, for example.
 *
 * These are the publicly documented ranges. Networks add and retire ranges over time,
 * so treat this as a good front-end check and not a source of truth.
 */
export const BRANDS: readonly Brand[] = [
  {
    id: "amex",
    name: "American Express",
    prefixes: ["34", "37"],
    lengths: [15],
    gaps: { default: [4, 10] },
    cvvLabel: "CID",
    cvvLength: 4,
    luhnRequired: true,
    colors: { from: "#2e6f9e", to: "#0b3a5c", ink: "#e8f4fb" },
  },
  {
    id: "visa",
    name: "Visa",
    prefixes: ["4"],
    lengths: [16, 13, 19],
    gaps: { default: fourFourFourFour, 19: [4, 8, 12, 16] },
    cvvLabel: "CVV",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#1a3a8f", to: "#0a1b52", ink: "#eef2ff" },
  },
  {
    id: "mastercard",
    name: "Mastercard",
    prefixes: [
      ["51", "55"],
      ["2221", "2720"],
    ],
    lengths: [16],
    gaps: { default: fourFourFourFour },
    cvvLabel: "CVC",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#2a2a2e", to: "#0d0d10", ink: "#f5f5f7" },
  },
  {
    id: "discover",
    name: "Discover",
    prefixes: ["6011", ["644", "649"], "65", ["622126", "622925"]],
    lengths: [16, 17, 18, 19],
    gaps: { default: fourFourFourFour, 19: [4, 8, 12, 16] },
    cvvLabel: "CID",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#f0803a", to: "#b8420c", ink: "#fff6ee" },
  },
  {
    id: "diners",
    name: "Diners Club",
    prefixes: [["300", "305"], "3095", "36", "38", "39"],
    lengths: [14, 15, 16, 17, 18, 19],
    gaps: { default: fourFourFourFour, 14: [4, 10] },
    cvvLabel: "CVV",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#4d6b7a", to: "#1f3340", ink: "#eef5f8" },
  },
  {
    id: "jcb",
    name: "JCB",
    prefixes: [["3528", "3589"]],
    lengths: [16, 17, 18, 19],
    gaps: { default: fourFourFourFour },
    cvvLabel: "CVV",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#1c7a5a", to: "#0a3d2d", ink: "#e9fbf3" },
  },
  {
    id: "unionpay",
    name: "UnionPay",
    prefixes: ["62"],
    lengths: [16, 17, 18, 19],
    gaps: { default: fourFourFourFour },
    cvvLabel: "CVN",
    cvvLength: 3,
    // Some UnionPay cards were issued without a Luhn check digit.
    luhnRequired: false,
    colors: { from: "#a3263a", to: "#4a0d1a", ink: "#fdeef1" },
  },
  {
    id: "maestro",
    name: "Maestro",
    prefixes: ["5018", "5020", "5038", "5893", "6304", "6759", ["6761", "6763"]],
    lengths: [16, 12, 13, 14, 15, 17, 18, 19],
    gaps: { default: fourFourFourFour },
    cvvLabel: "CVC",
    cvvLength: 3,
    luhnRequired: true,
    colors: { from: "#2c5cc5", to: "#a3202a", ink: "#f4f7ff" },
  },
];

export const BRAND_BY_ID: Readonly<Record<BrandId, Brand>> = Object.fromEntries(
  BRANDS.map((b) => [b.id, b]),
) as Record<BrandId, Brand>;
