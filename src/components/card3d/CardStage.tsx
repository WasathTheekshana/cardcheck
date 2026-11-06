"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { CardFace, CardStatus } from "./Card3D";
import FlatCard from "./FlatCard";
import { hasWebGL, useFaceFonts, useOnScreen, useReducedMotion } from "./hooks";

const Card3D = dynamic(() => import("./Card3D"), { ssr: false });

interface Props extends CardFace {
  flipped?: boolean;
  status?: CardStatus;
  className?: string;
  /** Adds the orbiting brand cards, sparkles and the success burst. Meant for the hero. */
  showcase?: boolean;
  /** Describes the card for screen readers, since the canvas itself is decorative. */
  label: string;
}

/**
 * Picks the WebGL card when it can, the CSS card when it cannot, and stops rendering
 * whenever the card is scrolled out of view.
 */
export function CardStage({ flipped = false, status = "idle", className = "", showcase = false, label, ...face }: Props) {
  const fonts = useFaceFonts();
  const reducedMotion = useReducedMotion();
  const [ref, visible] = useOnScreen<HTMLDivElement>();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    // Detection touches `document`, so it has to wait until we are on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} role="img" aria-label={label}>
      {webgl ? (
        <Card3D
          {...face}
          flipped={flipped}
          status={status}
          fonts={fonts}
          reducedMotion={reducedMotion}
          active={visible}
          showcase={showcase}
        />
      ) : (
        <FlatCard {...face} flipped={flipped} fonts={fonts} reducedMotion={reducedMotion} />
      )}
    </div>
  );
}
