"use client";

import { useEffect, useState } from "react";

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = setTimeout(() => setState("idle"), 1600);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <button
      type="button"
      className={`btn !px-3 !py-1 text-sm ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("done");
        } catch {
          setState("failed");
        }
      }}
    >
      <span aria-live="polite">{state === "done" ? "Copied" : state === "failed" ? "Could not copy" : label}</span>
    </button>
  );
}
