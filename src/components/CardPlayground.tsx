"use client";

import { motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import {
  BRAND_BY_ID,
  KNOWN_TEST_NUMBERS,
  displayNumber,
  formatExpiry,
  luhn,
  sanitize,
  validateCard,
  validateCvv,
  validateExpiry,
  type BrandId,
  type Issue,
} from "@/lib/card";
import { CardStage } from "./card3d/CardStage";
import { NEUTRAL_BRAND } from "./card3d/drawCard";

type RowState = "idle" | "ok" | "bad";

interface Row {
  label: string;
  state: RowState;
  detail: string;
}

const SAMPLES: BrandId[] = ["amex", "visa", "mastercard", "discover", "jcb", "diners", "unionpay"];

const ISSUE_TEXT: Record<Issue, string> = {
  empty: "Start typing a number.",
  "non-digit": "Only digits, spaces and dashes are allowed.",
  "unknown-brand": "No card network uses this start. Check the first digits.",
  "too-short": "Keep going, there are more digits to come.",
  "too-long": "That is more digits than this card network issues.",
  "bad-length": "This network does not issue cards with this many digits.",
  luhn: "The check digit does not match the rest of the number. Usually a typo.",
};

function Icon({ state }: { state: RowState }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  if (state === "ok") {
    return (
      <svg {...common} stroke="var(--ok)">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.4 2.7 2.7L16 9.5" />
      </svg>
    );
  }
  if (state === "bad") {
    return (
      <svg {...common} stroke="var(--bad)">
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </svg>
    );
  }
  return (
    <svg {...common} stroke="var(--ink-faint)">
      <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />
    </svg>
  );
}

export function CardPlayground() {
  const ids = { number: useId(), name: useId(), expiry: useId(), cvv: useId() };
  const [digits, setDigits] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focus, setFocus] = useState<"number" | "name" | "expiry" | "cvv" | null>(null);

  const v = useMemo(() => validateCard(digits), [digits]);
  const exp = useMemo(() => validateExpiry(expiry), [expiry]);

  const empty = digits.length === 0;
  const brand = v.brand;
  // Wait until the number has reached the usual length before calling anything wrong.
  // A Visa can be 13 digits long, but most people are still typing at 13.
  const settled = brand !== null && digits.length >= brand.lengths[0];
  const failing = settled && !v.valid;

  const status = v.valid ? "valid" : failing ? "invalid" : "idle";
  const sum = useMemo(() => (digits ? luhn(digits) : null), [digits]);

  const rows: Row[] = [
    {
      label: "Card network",
      state: brand ? "ok" : !empty && v.issues.includes("unknown-brand") && digits.length >= 4 ? "bad" : "idle",
      detail: brand
        ? `${brand.name}. Starts with ${digits.slice(0, brand.id === "amex" ? 2 : 4)}.`
        : empty
          ? "Waiting for the first digits."
          : v.candidates.length > 1
            ? `Could still be ${v.candidates.map((c) => c.name).join(", ")}.`
            : "Not recognised yet.",
    },
    {
      label: "Length",
      state: !brand ? "idle" : v.lengthOk ? "ok" : settled || v.issues.includes("too-long") ? "bad" : "idle",
      detail: brand
        ? `${digits.length} digits. ${brand.name} uses ${brand.lengths.length === 1 ? brand.lengths[0] : brand.lengths.slice().sort((a, b) => a - b).join(", ")}.`
        : "Length depends on the network.",
    },
    {
      label: "Luhn checksum",
      state: !settled && !v.valid ? "idle" : v.luhnOk ? "ok" : brand && !brand.luhnRequired ? "idle" : "bad",
      detail:
        sum && (settled || v.valid)
          ? `Digits add up to ${sum.sum}. ${sum.sum} mod 10 = ${sum.remainder}${sum.valid ? ", so it passes." : ", it needs to be 0."}`
          : "Runs once the number is long enough.",
    },
    {
      label: "Expiry",
      state: !expiry ? "idle" : exp.valid ? "ok" : expiry.length >= 4 ? "bad" : "idle",
      detail: !expiry
        ? "Optional. Try 12/30."
        : exp.valid
          ? "Not expired."
          : exp.reason === "expired"
            ? "That date has passed."
            : exp.reason === "too-far"
              ? "Too far in the future."
              : "Use MM/YY.",
    },
    {
      label: brand ? brand.cvvLabel : "Security code",
      state: !cvv ? "idle" : validateCvv(cvv, brand) ? "ok" : cvv.length >= 3 ? "bad" : "idle",
      detail: !cvv
        ? `Optional. ${brand ? `${brand.name} uses ${brand.cvvLength} digits.` : "3 digits, or 4 on American Express."}`
        : validateCvv(cvv, brand)
          ? "Right length."
          : brand
            ? `${brand.name} uses ${brand.cvvLength} digits.`
            : "Should be 3 or 4 digits.",
    },
  ];

  const headline = v.valid
    ? { text: "Looks like a well formed number", tone: "text-ok" }
    : failing
      ? { text: "This number would not pass", tone: "text-bad" }
      : empty
        ? { text: "Waiting for a number", tone: "text-ink-soft" }
        : { text: "Keep typing", tone: "text-ink-soft" };

  const hint = failing
    ? ISSUE_TEXT[v.issues.find((i) => i !== "unknown-brand") ?? v.issues[0] ?? "luhn"]
    : v.issues.includes("non-digit")
      ? ISSUE_TEXT["non-digit"]
      : null;

  const faceBrand = brand ?? (empty ? BRAND_BY_ID.amex : NEUTRAL_BRAND);
  const shownNumber = empty ? displayNumber(KNOWN_TEST_NUMBERS.amex, BRAND_BY_ID.amex) : displayNumber(digits, brand);
  const cardLabel = brand
    ? `3D ${brand.name} card showing the number you typed`
    : "3D sample American Express card, waiting for you to type a number";

  const breakIt = () => {
    if (!digits) return;
    const last = (Number(digits.slice(-1)) + 1) % 10;
    setDigits(digits.slice(0, -1) + last);
  };

  return (
    <section className="relative">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[34rem]" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-6 pt-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:pt-14">
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Runs in your browser. Nothing is sent anywhere.
          </p>
          <h1 className="text-shimmer text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Is that card number even real?
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-ink-soft">
            Long before a bank gets asked, the number itself can tell you if it was mistyped. Type one below and
            watch the card react.
          </p>

          <form
            className="glass mt-7 space-y-4 rounded-2xl p-4 sm:p-5"
            onSubmit={(e) => e.preventDefault()}
            autoComplete="off"
          >
            <div>
              <label htmlFor={ids.number} className="mb-1.5 block text-sm text-ink-soft">
                Card number
              </label>
              <input
                id={ids.number}
                className="field font-mono text-base tracking-wide sm:text-lg sm:tracking-wider"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder="3782 822463 10005"
                value={v.formatted}
                maxLength={24}
                aria-invalid={failing}
                aria-describedby={`${ids.number}-status`}
                onFocus={() => setFocus("number")}
                onBlur={() => setFocus(null)}
                onChange={(e) => setDigits(sanitize(e.target.value).slice(0, 19))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_6.5rem_5.5rem]">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={ids.name} className="mb-1.5 block text-sm text-ink-soft">
                  Name on card
                </label>
                <input
                  id={ids.name}
                  className="field"
                  autoComplete="off"
                  placeholder="Ada Lovelace"
                  maxLength={26}
                  value={name}
                  onFocus={() => setFocus("name")}
                  onBlur={() => setFocus(null)}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={ids.expiry} className="mb-1.5 block text-sm text-ink-soft">
                  Expiry
                </label>
                <input
                  id={ids.expiry}
                  className="field font-mono"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  aria-invalid={expiry.length >= 4 && !exp.valid}
                  onFocus={() => setFocus("expiry")}
                  onBlur={() => setFocus(null)}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor={ids.cvv} className="mb-1.5 block text-sm text-ink-soft">
                  {brand ? brand.cvvLabel : "CVV"}
                </label>
                <input
                  id={ids.cvv}
                  className="field font-mono"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={brand?.cvvLength === 4 ? "1234" : "123"}
                  maxLength={4}
                  value={cvv}
                  aria-invalid={cvv.length >= 3 && !validateCvv(cvv, brand)}
                  onFocus={() => setFocus("cvv")}
                  onBlur={() => setFocus(null)}
                  onChange={(e) => setCvv(sanitize(e.target.value).slice(0, 4))}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-sm text-ink-faint">Try a sandbox number:</span>
              {SAMPLES.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="btn !px-3 !py-1 text-sm"
                  onClick={() => setDigits(KNOWN_TEST_NUMBERS[id])}
                >
                  {BRAND_BY_ID[id].name}
                </button>
              ))}
              <button type="button" className="btn !px-3 !py-1 text-sm" onClick={breakIt} disabled={!digits}>
                Change the last digit
              </button>
              {digits && (
                <button type="button" className="btn !px-3 !py-1 text-sm" onClick={() => setDigits("")}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <div className="order-1 lg:order-2">
          <CardStage
            showcase
            className="h-[16rem] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] sm:h-[23rem] lg:h-[29rem]"
            label={cardLabel}
            brand={faceBrand}
            number={shownNumber}
            name={name}
            expiry={expiry}
            cvv={cvv}
            dim={empty}
            flipped={focus === "cvv"}
            status={status}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass rounded-2xl p-4 sm:p-6" id={`${ids.number}-status`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={`text-lg font-medium ${headline.tone}`} role="status" aria-live="polite">
              {headline.text}
            </p>
            {hint && <p className="text-sm text-ink-soft">{hint}</p>}
          </div>

          <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <li key={row.label} className="flex gap-3">
                <span className="mt-0.5 shrink-0">
                  <Icon state={row.state} />
                </span>
                <span>
                  <span className="block text-sm font-medium">{row.label}</span>
                  <span className="block text-sm text-ink-soft">{row.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
