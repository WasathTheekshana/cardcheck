import Link from "next/link";
import { CardPlayground } from "@/components/CardPlayground";
import { LuhnShowcase } from "@/components/LuhnShowcase";
import { Reveal, Tilt } from "@/components/Motion";
import { BRANDS } from "@/lib/card";

const CHECKS = [
  {
    n: "1",
    title: "Who issued it?",
    body: "The first digits are an issuer identification number. 4 means Visa, 34 or 37 means American Express, 51 to 55 means Mastercard, and so on. That tells us which rules to apply next.",
    href: "/brands",
    cta: "See every prefix",
  },
  {
    n: "2",
    title: "Is it the right length?",
    body: "American Express cards have 15 digits, most Visa and Mastercard cards have 16. A number with the wrong count cannot be real, no matter what the digits say.",
    href: "/brands",
    cta: "Lengths by network",
  },
  {
    n: "3",
    title: "Does the maths work out?",
    body: "The last digit is a check digit. Double every second digit from the right, add everything up, and the total has to end in 0. This is the Luhn algorithm, and it catches almost every typo.",
    href: "/luhn",
    cta: "Walk through it",
  },
] as const;

export default function Home() {
  return (
    <>
      <CardPlayground />

      <div className="relative mt-16 overflow-hidden border-y border-line py-4" aria-hidden>
        <div className="marquee gap-10 whitespace-nowrap font-mono text-sm uppercase tracking-[0.3em] text-ink-faint">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-10 pr-10">
              {BRANDS.map((b) => (
                <span key={b.id}>
                  {b.name} <span className="text-accent">/</span> {b.prefixes[0] as string}
                </span>
              ))}
              {BRANDS.map((b) => (
                <span key={`${b.id}-len`}>
                  {b.lengths[0]} digits <span className="text-accent">/</span> {b.cvvLabel}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Three checks, no bank needed</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Every number you type goes through the same three questions. Each one is cheap enough to run on every
            keystroke, which is why good checkout forms can tell you about a typo before you press Pay.
          </p>
        </Reveal>

        <ol className="mt-8 grid gap-4 [perspective:1200px] md:grid-cols-3">
          {CHECKS.map((c, i) => (
            <li key={c.n}>
              <Reveal delay={i * 0.12} className="h-full">
                <Tilt className="glass flex h-full flex-col rounded-2xl p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 font-mono text-sm text-accent">
                    {c.n}
                  </span>
                  <h3 className="mt-4 text-lg font-medium">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{c.body}</p>
                  <Link href={c.href} className="mt-5 text-sm text-accent underline-offset-4 hover:underline">
                    {c.cta} →
                  </Link>
                </Tilt>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Watch the maths happen</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Each block is a digit. Watch which ones get picked, doubled and folded, then see the total settle into a
            ring. It plays by itself, or click a step to jump to it.
          </p>
        </Reveal>
        <Reveal className="mt-8" delay={0.1}>
          <LuhnShowcase />
        </Reveal>
        <Reveal className="mt-4">
          <Link href="/luhn" className="text-sm text-accent underline-offset-4 hover:underline">
            Try it on your own number →
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">What this does not tell you</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-ink-soft">
              Passing all three checks means the number is well formed, nothing more. It does not mean the card
              exists, is active, has money on it or belongs to whoever is typing. Only the card network and the
              issuing bank can answer that, and your backend still has to ask them. The point of checking early is to
              save people a round trip when they have simply fat-fingered a digit.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
