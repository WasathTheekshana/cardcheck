import type { Metadata } from "next";
import { BrandExplorer } from "@/components/BrandExplorer";

export const metadata: Metadata = {
  title: "Card brands, prefixes and lengths",
  description:
    "Which digits identify Visa, Mastercard, American Express, Discover, JCB, Diners Club, UnionPay and Maestro, how long each number is, and what every part of a card number means.",
};

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <header className="max-w-3xl">
        <p className="font-mono text-sm text-accent">Issuer identification</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          The first digits give it away
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Before you have typed even half a card number, the opening digits already say which network issued it. That
          is how checkout pages swap in the right logo while you type. Pick a network to see its rules.
        </p>
      </header>

      <div className="mt-8">
        <BrandExplorer />
      </div>
    </div>
  );
}
