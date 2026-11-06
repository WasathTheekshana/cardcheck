import type { Metadata } from "next";
import { Generator } from "@/components/Generator";

export const metadata: Metadata = {
  title: "Test card number generator",
  description:
    "Generate Luhn-valid test card numbers for Visa, Mastercard, American Express, Discover, JCB, Diners Club, UnionPay and Maestro, to try out your own checkout form.",
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <header>
        <p className="font-mono text-sm text-accent">For developers</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Numbers to test your form with
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Building a checkout and tired of copying the same 4242 number? Make as many as you like. Each one has the
          right prefix, the right length and a correct check digit for the network you pick.
        </p>
      </header>

      <div className="mt-8">
        <Generator />
      </div>
    </div>
  );
}
