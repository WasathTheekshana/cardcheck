"use client";

import { useId, useState } from "react";
import {
  BRANDS,
  BRAND_BY_ID,
  KNOWN_TEST_NUMBERS,
  formatNumber,
  generateTestNumber,
  validateCard,
  type BrandId,
} from "@/lib/card";
import { CardStage } from "./card3d/CardStage";
import { CopyButton } from "./CopyButton";

export function Generator() {
  const ids = { brand: useId(), length: useId(), count: useId() };
  const [brandId, setBrandId] = useState<BrandId>("visa");
  const [length, setLength] = useState<number>(BRAND_BY_ID.visa.lengths[0]);
  const [count, setCount] = useState(5);
  const [numbers, setNumbers] = useState<string[]>([]);

  const brand = BRAND_BY_ID[brandId];
  const lengths = [...brand.lengths].sort((a, b) => a - b);

  const shown = numbers[0] ?? KNOWN_TEST_NUMBERS[brandId];
  const shownValid = numbers.length > 0;

  const generate = () => {
    setNumbers(Array.from({ length: count }, () => generateTestNumber(brandId, { length })));
  };

  return (
    <div className="space-y-8">
      <CardStage
        className="h-[15rem] sm:h-[19rem]"
        label={`3D ${brand.name} card showing ${numbers.length ? "the first generated" : "a sandbox"} number`}
        brand={brand}
        number={formatNumber(shown, brand, shown.length)}
        name=""
        expiry="12/30"
        cvv=""
        dim={!shownValid}
        flipped={false}
        status={shownValid ? "valid" : "idle"}
      />

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={ids.brand} className="mb-1.5 block text-sm text-ink-soft">
              Network
            </label>
            <select
              id={ids.brand}
              className="field"
              value={brandId}
              onChange={(e) => {
                const next = e.target.value as BrandId;
                setBrandId(next);
                setLength(BRAND_BY_ID[next].lengths[0]);
                setNumbers([]);
              }}
            >
              {BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.length} className="mb-1.5 block text-sm text-ink-soft">
              Length
            </label>
            <select
              id={ids.length}
              className="field"
              value={length}
              onChange={(e) => {
                setLength(Number(e.target.value));
                setNumbers([]);
              }}
            >
              {lengths.map((n) => (
                <option key={n} value={n}>
                  {n} digits
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.count} className="mb-1.5 block text-sm text-ink-soft">
              How many
            </label>
            <select id={ids.count} className="field" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={generate}>
            Generate
          </button>
          {numbers.length > 1 && <CopyButton text={numbers.join("\n")} label="Copy all" />}
        </div>

        {numbers.length > 0 && (
          <ul className="mt-5 divide-y divide-line rounded-xl border border-line" aria-live="polite">
            {numbers.map((n) => {
              const v = validateCard(n);
              return (
                <li key={n} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-base tracking-wide sm:text-lg sm:tracking-wider">{formatNumber(n, brand, n.length)}</span>
                  <span className="flex items-center gap-3">
                    <span className={`text-sm ${v.valid ? "text-ok" : "text-bad"}`}>
                      {v.valid ? "Passes all checks" : "Fails"}
                    </span>
                    <CopyButton text={n} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm leading-relaxed text-ink-soft sm:p-5">
        <p className="font-medium text-warn">These are not cards.</p>
        <p className="mt-1">
          Generated numbers are random digits with a correct check digit. They are not linked to any account and a
          payment processor will decline them. They exist so you can test your own forms. Please do not use them to
          try to pay for anything.
        </p>
      </div>

      <section aria-labelledby="sandbox">
        <h2 id="sandbox" className="text-xl font-semibold tracking-tight">
          Sandbox numbers from payment providers
        </h2>
        <p className="mt-2 max-w-3xl text-ink-soft">
          Providers publish fixed test numbers that work in their test mode. These are the common ones, and they are
          fine to share.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {BRANDS.map((b) => (
            <li key={b.id} className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <span>
                <span className="block text-sm text-ink-soft">{b.name}</span>
                <span className="font-mono">
                  {formatNumber(KNOWN_TEST_NUMBERS[b.id], b, KNOWN_TEST_NUMBERS[b.id].length)}
                </span>
              </span>
              <CopyButton text={KNOWN_TEST_NUMBERS[b.id]} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
