import type { Metadata } from "next";
import { LuhnLesson } from "@/components/LuhnLesson";

export const metadata: Metadata = {
  title: "The Luhn algorithm, step by step",
  description:
    "Watch the Luhn checksum work on a real card number: pick, double, fold, add and divide. Then break a digit and see it fail.",
};

export default function LuhnPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <header className="max-w-3xl">
        <p className="font-mono text-sm text-accent">The algorithm</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          How a number can check itself
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          In 1954 an IBM engineer named Hans Peter Luhn filed a patent for a tiny checksum for catching typing mistakes. Nearly
          every card number issued today still ends in a digit calculated this way. It takes six small steps and no
          lookups, so it runs anywhere.
        </p>
      </header>

      <div className="mt-8">
        <LuhnLesson />
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-lg font-medium">What it catches</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Every number with a single wrong digit, and nearly every swap of two neighbouring digits. The one pair it
            misses is 09 and 90. Those two give the same total either way. That covers most real typos.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-lg font-medium">What it does not</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Two wrong digits can cancel each other out, and a number you invent can pass by luck. About one random
            number in ten does. It was designed against accidents, not against people.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-lg font-medium">Why it is not security</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            The recipe is public and the check digit is easy to calculate. Passing Luhn says nothing about whether a
            card is real or who owns it. Treat it as a spell checker for numbers.
          </p>
        </div>
      </section>
    </div>
  );
}
