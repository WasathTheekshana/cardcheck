"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FaceFonts } from "./drawCard";

const FALLBACK: FaceFonts = {
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

/**
 * The card faces are painted on a canvas, which cannot see CSS font classes.
 * So read the real family names that next/font generated, wait for them to load,
 * and hand them to the painter.
 */
export function useFaceFonts(): FaceFonts {
  const [fonts, setFonts] = useState<FaceFonts>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const style = getComputedStyle(document.documentElement);
    const mono = style.getPropertyValue("--font-num").trim();
    const sans = style.getPropertyValue("--font-ui").trim();
    if (!mono || !sans) return;

    Promise.all([document.fonts.load(`500 40px ${mono}`), document.fonts.load(`700 40px ${sans}`)])
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFonts({ mono: `${mono}, ${FALLBACK.mono}`, sans: `${sans}, ${FALLBACK.sans}` });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return fonts;
}

const query = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Pointer position across the whole window, -1 to 1 on both axes, without causing re-renders. */
export function usePointerRef() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}

/** True while the element is on screen, so we can stop rendering when it is not. */
export function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible] as const;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
