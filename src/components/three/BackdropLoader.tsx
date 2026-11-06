"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL, useFaceFonts, useReducedMotion } from "../card3d/hooks";

const Backdrop = dynamic(() => import("./Backdrop"), { ssr: false });

/**
 * A fixed, full-page 3D layer behind everything: digits drift upward through fog and the whole
 * world slides as you scroll. It never takes pointer events and is skipped when WebGL is missing.
 */
export function BackdropLoader() {
  const fonts = useFaceFonts();
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<{ webgl: boolean; density: number } | null>(null);

  useEffect(() => {
    // Needs `window`, so it can only run after the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ webgl: hasWebGL(), density: window.innerWidth < 700 ? 0.5 : 1 });
  }, []);

  if (!state?.webgl) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-70">
      <Backdrop fontFamily={fonts.mono} reducedMotion={reducedMotion} density={state.density} />
    </div>
  );
}
