"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { LUHN_STAGES } from "@/data/luhn-stages";
import { luhn, sanitize } from "@/lib/card";
import { LuhnStage } from "./three/LuhnStage";

const START = "4012888888881881";

export function LuhnLesson() {
  const [digits, setDigits] = useState(START);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);

  const result = useMemo(() => luhn(digits), [digits]);
  const last = LUHN_STAGES.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStage((s) => {
        if (s >= last) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [playing, last]);

  const mistype = () => {
    if (!digits) return;
    const i = Math.floor(Math.random() * digits.length);
    const next = (Number(digits[i]) + 1 + Math.floor(Math.random() * 8)) % 10;
    setDigits(digits.slice(0, i) + next + digits.slice(i + 1));
    setStage(last);
  };

  const info = LUHN_STAGES[stage];
  const empty = digits.length < 2;

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-4 sm:p-6">
        <label htmlFor="luhn-input" className="mb-1.5 block text-sm text-ink-soft">
          Any number to walk through
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="luhn-input"
            className="field max-w-md flex-1 font-mono text-lg tracking-wider"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={digits}
            maxLength={19}
            onChange={(e) => setDigits(sanitize(e.target.value).slice(0, 19))}
          />
          <button type="button" className="btn" onClick={() => setDigits(START)}>
            Reset
          </button>
          <button type="button" className="btn" onClick={mistype}>
            Mistype one digit
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-accent">
            Step {stage + 1} of {LUHN_STAGES.length}
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn !py-1.5" disabled={stage === 0} onClick={() => setStage(stage - 1)}>
              Back
            </button>
            <button type="button" className="btn !py-1.5" disabled={stage === last} onClick={() => setStage(stage + 1)}>
              Next
            </button>
            <button
              type="button"
              className="btn btn-primary !py-1.5"
              onClick={() => {
                if (stage === last) setStage(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : stage === last ? "Replay" : "Play"}
            </button>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={last}
          value={stage}
          onChange={(e) => {
            setPlaying(false);
            setStage(Number(e.target.value));
          }}
          aria-label="Lesson step"
          className="mt-4 w-full accent-[var(--accent)]"
        />

        <h2 className="mt-4 text-xl font-semibold tracking-tight">{info.title}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-ink-soft" aria-live="polite">
          {info.body}
        </p>

        {!empty && (
          <LuhnStage
            className="mt-6 h-[19rem] w-full overflow-hidden rounded-xl border border-line bg-black/20 sm:h-[24rem]"
            steps={result.steps}
            stage={stage}
            valid={result.valid}
            remainder={result.remainder}
          />
        )}

        {empty ? (
          <p className="mt-8 text-ink-soft">Type at least two digits to see the steps.</p>
        ) : (
          <>
            <ol className="mt-8 flex flex-wrap justify-center gap-x-1.5 gap-y-5 sm:gap-x-2" aria-label="Digits">
              {result.steps.map((s) => {
                const picked = stage >= 1 && s.doubled;
                const doubledNow = stage >= 2 && s.doubled;
                const folded = stage >= 3 && s.doubled && (s.rawDoubled ?? 0) > 9;
                const shown = stage >= 3 ? s.value : doubledNow ? (s.rawDoubled ?? s.digit) : s.digit;

                return (
                  <li key={s.index} className="flex w-9 flex-col items-center gap-1.5 sm:w-11">
                    <span
                      className={`grid h-10 w-full place-items-center rounded-lg border font-mono text-lg transition-colors sm:h-12 sm:text-xl ${
                        picked ? "border-accent bg-accent/10 text-accent" : "border-line bg-white/[0.03]"
                      }`}
                    >
                      {s.digit}
                    </span>

                    <span className="h-4 font-mono text-[11px] text-ink-faint">
                      {doubledNow ? (folded ? `${s.rawDoubled}-9` : `×2`) : ""}
                    </span>

                    <motion.span
                      key={`${s.index}-${stage >= 2 ? "v" : "d"}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: stage >= 2 ? 1 : 0, y: 0 }}
                      transition={{ duration: 0.35, delay: stage >= 2 ? (result.steps.length - s.index) * 0.02 : 0 }}
                      className={`grid h-10 w-full place-items-center rounded-lg font-mono text-lg sm:h-12 sm:text-xl ${
                        s.doubled ? "bg-accent text-accent-ink" : "bg-white/10"
                      }`}
                    >
                      {shown}
                    </motion.span>
                  </li>
                );
              })}
            </ol>

            {stage >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-xl border border-line bg-black/20 p-4"
              >
                <p className="break-words font-mono text-sm leading-relaxed text-ink-soft">
                  {result.steps.map((s) => s.value).join(" + ")} = <span className="text-ink">{result.sum}</span>
                </p>

                {stage >= 5 && (
                  <p className={`mt-3 text-lg font-medium ${result.valid ? "text-ok" : "text-bad"}`}>
                    {result.sum} ÷ 10 leaves {result.remainder}.{" "}
                    {result.valid
                      ? "Nothing left over, so it passes."
                      : "That is not 0, so this number fails. One digit is wrong."}
                  </p>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
