"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { LuhnStep } from "@/lib/card";
import { hasWebGL, useFaceFonts, useOnScreen, useReducedMotion } from "../card3d/hooks";

const LuhnScene = dynamic(() => import("./LuhnScene"), { ssr: false });

interface Props {
  steps: LuhnStep[];
  stage: number;
  valid: boolean;
  remainder: number;
  className?: string;
}

/** The Luhn algorithm as a 3D scene. Pauses off screen and renders nothing without WebGL. */
export function LuhnStage({ steps, stage, valid, remainder, className = "" }: Props) {
  const fonts = useFaceFonts();
  const reducedMotion = useReducedMotion();
  const [ref, visible] = useOnScreen<HTMLDivElement>();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    // Needs `document`, so it can only run after the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  if (!webgl || steps.length === 0) return null;

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label="3D view of the Luhn steps. The same steps are written out as text above and below."
    >
      <LuhnScene
        steps={steps}
        stage={stage}
        valid={valid}
        remainder={remainder}
        fontFamily={fonts.mono}
        reducedMotion={reducedMotion}
        active={visible}
      />
    </div>
  );
}
