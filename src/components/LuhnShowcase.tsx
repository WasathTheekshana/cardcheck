"use client";

import { useEffect, useMemo, useState } from "react";
import { luhn } from "@/lib/card";
import { LUHN_STAGES } from "@/data/luhn-stages";
import { useOnScreen } from "./card3d/hooks";
import { LuhnStage } from "./three/LuhnStage";

const EXAMPLE = "4012888888881881";

/** The Luhn scene on the home page. It plays itself while it is on screen. */
export function LuhnShowcase() {
  const result = useMemo(() => luhn(EXAMPLE), []);
  const [stage, setStage] = useState(0);
  const [ref, visible] = useOnScreen<HTMLDivElement>();

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setStage((s) => (s + 1) % LUHN_STAGES.length), 2400);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div ref={ref} className="glass overflow-hidden rounded-3xl">
      <LuhnStage
        className="h-[17rem] w-full sm:h-[22rem]"
        steps={result.steps}
        stage={stage}
        valid={result.valid}
        remainder={result.remainder}
      />

      <div className="border-t border-line p-4 sm:p-6">
        <ol className="flex flex-wrap gap-2" aria-label="Steps">
          {LUHN_STAGES.map((s, i) => (
            <li key={s.short}>
              <button
                type="button"
                onClick={() => setStage(i)}
                aria-current={i === stage ? "step" : undefined}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  i === stage ? "border-accent bg-accent/15 text-accent" : "border-line text-ink-soft hover:text-ink"
                }`}
              >
                {i + 1}. {s.short}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-lg font-medium">{LUHN_STAGES[stage].title}</p>
        <p className="mt-1 max-w-3xl text-ink-soft" aria-live="off">
          {LUHN_STAGES[stage].body}
        </p>
      </div>
    </div>
  );
}
