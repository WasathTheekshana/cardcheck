"use client";

import { useState } from "react";
import { SNIPPETS } from "@/data/snippets";
import { CopyButton } from "./CopyButton";

export function CodeSnippets() {
  const [id, setId] = useState(SNIPPETS[0].id);
  const snippet = SNIPPETS.find((s) => s.id === id) ?? SNIPPETS[0];

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
        <div role="tablist" aria-label="Language" className="flex flex-wrap gap-1.5">
          {SNIPPETS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === id}
              onClick={() => setId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                s.id === id ? "bg-accent/15 text-accent" : "text-ink-soft hover:bg-white/5 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <CopyButton text={snippet.code} />
      </div>

      {snippet.note && <p className="border-b border-line px-4 py-2 text-sm text-ink-soft">{snippet.note}</p>}

      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed sm:p-5 sm:text-sm" tabIndex={0}>
        <code className="font-mono" lang={snippet.language}>
          {snippet.code}
        </code>
      </pre>
    </div>
  );
}
