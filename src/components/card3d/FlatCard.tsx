"use client";

import { useEffect, useRef } from "react";
import type { CardFace } from "./Card3D";
import { CARD_H, CARD_W, drawBack, drawFront, type FaceFonts } from "./drawCard";
import { usePointerRef } from "./hooks";

interface Props extends CardFace {
  flipped: boolean;
  fonts: FaceFonts;
  reducedMotion: boolean;
}

/**
 * The same card, drawn flat with CSS 3D. It is what you see while the WebGL scene loads,
 * and what you keep if WebGL is unavailable.
 */
export default function FlatCard({ brand, number, name, expiry, cvv, dim, flipped, fonts, reducedMotion }: Props) {
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const pointer = usePointerRef();

  useEffect(() => {
    const ctx = frontRef.current?.getContext("2d");
    if (ctx) drawFront(ctx, { brand, number, name, expiry, dim, fonts });
  }, [brand, number, name, expiry, dim, fonts]);

  useEffect(() => {
    const ctx = backRef.current?.getContext("2d");
    if (ctx) drawBack(ctx, { brand, cvv, name, fonts });
  }, [brand, cvv, name, fonts]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      const el = tiltRef.current;
      if (el) {
        el.style.transform = `rotateX(${pointer.current.y * 14}deg) rotateY(${pointer.current.x * 20}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer, reducedMotion]);

  const face = "absolute inset-0 h-full w-full [backface-visibility:hidden] rounded-[4.5%] shadow-2xl";

  return (
    <div className="grid h-full w-full place-items-center [perspective:1200px]">
      <div className="relative w-[min(86%,26rem)]" style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}>
        <div ref={tiltRef} className="absolute inset-0 transition-transform duration-150 ease-out [transform-style:preserve-3d]">
          <div
            className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
          >
            <canvas ref={frontRef} width={CARD_W} height={CARD_H} className={face} aria-hidden />
            <canvas
              ref={backRef}
              width={CARD_W}
              height={CARD_H}
              className={`${face} [transform:rotateY(180deg)]`}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
