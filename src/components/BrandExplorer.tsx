"use client";

import { useState } from "react";
import { CardStage } from "./card3d/CardStage";
import { BRANDS, KNOWN_TEST_NUMBERS, formatNumber, type Brand, type Prefix } from "@/lib/card";

function prefixLabel(p: Prefix) {
  return typeof p === "string" ? p : `${p[0]}-${p[1]}`;
}

function lengthLabel(b: Brand) {
  const sorted = [...b.lengths].sort((a, c) => a - c);
  if (sorted.length === 1) return String(sorted[0]);
  const contiguous = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  return contiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(", ");
}

const MII: Record<string, string> = {
  "0": "ISO/TC 68 and other industry use",
  "1": "Airlines",
  "2": "Airlines and other future use (Mastercard's 2-series lives here)",
  "3": "Travel and entertainment",
  "4": "Banking and financial",
  "5": "Banking and financial",
  "6": "Merchandising and banking",
  "7": "Petroleum and other future use",
  "8": "Healthcare and telecoms",
  "9": "Assigned by national standards bodies",
};

export function BrandExplorer() {
  const [id, setId] = useState<Brand["id"]>("amex");
  const brand = BRANDS.find((b) => b.id === id) ?? BRANDS[0];
  const sample = KNOWN_TEST_NUMBERS[brand.id];
  const grouped = formatNumber(sample, brand, sample.length);

  // Colour the sample by role: 1 digit MII, up to 6 digits IIN, the middle, then the check digit.
  const roleOf = (i: number) => (i === 0 ? "mii" : i < 6 ? "iin" : i === sample.length - 1 ? "check" : "account");
  const roleClass = {
    mii: "bg-accent text-accent-ink",
    iin: "bg-accent/20 text-accent",
    account: "bg-white/10",
    check: "bg-warn/20 text-warn",
  } as const;

  // Number the digits ahead of time. Spaces get no index, so the colour roles line up with the real digits.
  const cells = grouped.split("").map((ch, k, all) => ({
    ch,
    k,
    index: ch === " " ? -1 : all.slice(0, k).filter((c) => c !== " ").length,
  }));

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Card network" className="flex flex-wrap gap-2">
        {BRANDS.map((b) => (
          <button
            key={b.id}
            role="tab"
            aria-selected={b.id === id}
            onClick={() => setId(b.id)}
            className={`btn ${b.id === id ? "!border-accent !bg-accent/15 !text-accent" : ""}`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          <CardStage
            className="h-[16rem] sm:h-[20rem]"
            label={`3D ${brand.name} card with a sandbox number`}
            brand={brand}
            number={grouped}
            name=""
            expiry="12/30"
            cvv=""
            dim={false}
            flipped={false}
          />
          <p className="text-center text-sm text-ink-faint">
            {brand.cvvLabel}: {brand.cvvLength} digits, {brand.cvvLength === 4 ? "on the front" : "on the back"}. Move
            your pointer over the card.
          </p>
        </div>

        <dl className="glass grid content-start gap-4 rounded-2xl p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-faint">Starts with</dt>
            <dd className="mt-1 flex flex-wrap gap-2 font-mono">
              {brand.prefixes.map((p) => (
                <span key={prefixLabel(p)} className="rounded-md bg-white/10 px-2 py-1 text-sm">
                  {prefixLabel(p)}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-faint">Length</dt>
            <dd className="mt-1 font-mono">{lengthLabel(brand)} digits</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-faint">Security code</dt>
            <dd className="mt-1">
              {brand.cvvLabel}, {brand.cvvLength} digits
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-faint">Luhn check</dt>
            <dd className="mt-1 text-ink-soft">
              {brand.luhnRequired
                ? "Always applied. The last digit is the check digit."
                : "Most cards use it, but some older UnionPay cards were issued without one. CardCheck accepts those when the length is right."}
            </dd>
          </div>
        </dl>
      </div>

      <section aria-labelledby="anatomy" className="glass rounded-2xl p-5 sm:p-6">
        <h2 id="anatomy" className="text-xl font-semibold tracking-tight">
          Anatomy of a card number
        </h2>
        <p className="mt-2 max-w-3xl text-ink-soft">
          The sandbox {brand.name} number below, split by what each part means. The numbers are public test data, not
          a real account.
        </p>

        <p className="mt-5 flex flex-wrap gap-1.5 font-mono text-xl sm:text-2xl" aria-label={sample}>
          {cells.map(({ ch, k, index }) =>
            ch === " " ? (
              <span key={k} className="w-2" />
            ) : (
              <span key={k} className={`grid h-10 w-8 place-items-center rounded-md sm:h-12 sm:w-10 ${roleClass[roleOf(index)]}`}>
                {ch}
              </span>
            ),
          )}
        </p>

        <ul className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <span className="mb-1 inline-block rounded bg-accent px-2 py-0.5 font-medium text-accent-ink">
              1st digit
            </span>
            <p className="text-ink-soft">
              Major industry identifier. Here it is {sample[0]}: {MII[sample[0]].toLowerCase()}.
            </p>
          </li>
          <li>
            <span className="mb-1 inline-block rounded bg-accent/20 px-2 py-0.5 font-medium text-accent">
              First 6 digits
            </span>
            <p className="text-ink-soft">
              Issuer identification number (IIN), often called the BIN. It names the network and the bank. The
              standard grew to 8 digits in 2022, though many systems still read 6.
            </p>
          </li>
          <li>
            <span className="mb-1 inline-block rounded bg-white/10 px-2 py-0.5 font-medium">Middle digits</span>
            <p className="text-ink-soft">The account identifier, chosen by the bank. It means nothing outside of it.</p>
          </li>
          <li>
            <span className="mb-1 inline-block rounded bg-warn/20 px-2 py-0.5 font-medium text-warn">
              Last digit
            </span>
            <p className="text-ink-soft">The Luhn check digit, worked out from all the digits before it.</p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="table">
        <h2 id="table" className="text-xl font-semibold tracking-tight">
          All the networks at a glance
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-white/5 text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">Starts with</th>
                <th className="px-4 py-3 font-medium">Length</th>
                <th className="px-4 py-3 font-medium">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {BRANDS.map((b) => (
                <tr key={b.id} className={b.id === id ? "bg-accent/5" : ""}>
                  <th scope="row" className="px-4 py-3 font-medium">
                    {b.name}
                  </th>
                  <td className="px-4 py-3 font-mono text-ink-soft">{b.prefixes.map(prefixLabel).join(", ")}</td>
                  <td className="px-4 py-3 font-mono text-ink-soft">{lengthLabel(b)}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {b.cvvLabel} ({b.cvvLength})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-ink-faint">
          These are the publicly documented ranges. Networks add and retire ranges, a few overlap (UnionPay&apos;s 62
          also covers part of Discover&apos;s range, so the narrower range wins), and Maestro prefixes change often.
          For anything that moves money, ask your payment provider.
        </p>
      </section>
    </div>
  );
}
