import type { Metadata } from "next";
import { CodeSnippets } from "@/components/CodeSnippets";

export const metadata: Metadata = {
  title: "Luhn algorithm code in 6 languages",
  description:
    "Copy and paste a card number check in TypeScript, Python, Java, PHP, Go or C#, plus a small brand detector.",
};

export default function CodePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <header>
        <p className="font-mono text-sm text-accent">Take it with you</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Copy the check</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          The whole Luhn check fits in about fifteen lines. Each version below does the same thing: strip spaces and
          dashes, require 12 to 19 digits, then double, fold and add.
        </p>
      </header>

      <div className="mt-8">
        <CodeSnippets />
      </div>

      <section className="mt-10 space-y-3 text-ink-soft">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Before you ship it</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            Run the same check on your server. Anything a browser does can be skipped by someone who is not using
            your page.
          </li>
          <li>
            Do not log card numbers, even failed ones. If you can, avoid handling them at all and use your payment
            provider&apos;s hosted fields.
          </li>
          <li>
            Do not reject a number only because its brand is unknown to you. New ranges appear, so let the payment
            provider decide.
          </li>
          <li>
            Accept spaces and dashes when people paste a number, and format it for them as they type.
          </li>
        </ul>
      </section>
    </div>
  );
}
