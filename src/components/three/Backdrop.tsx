"use client";

import { Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { usePointerRef } from "../card3d/hooks";
import { createGlyphCache, seeded } from "./glyphs";

interface Props {
  fontFamily: string;
  reducedMotion: boolean;
  /** Fewer glyphs on small screens keeps phones cool. */
  density: number;
}

const DIGITS = "0123456789".split("");

/** One instanced mesh per digit: a drifting cloud of that glyph at different depths. */
function DigitCloud({ digit, count, texture, seed, reducedMotion }: {
  digit: string;
  count: number;
  texture: THREE.Texture;
  seed: number;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const items = useMemo(() => {
    const rnd = seeded(seed + Number(digit) * 101);
    return Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * 34,
      y: (rnd() - 0.5) * 24,
      z: -2 - rnd() * 16,
      speed: 0.12 + rnd() * 0.35,
      spin: (rnd() - 0.5) * 0.5,
      phase: rnd() * Math.PI * 2,
      size: 0.55 + rnd() * 0.9,
    }));
  }, [count, digit, seed]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      // Drift upward and wrap around, so the cloud never runs out.
      const y = ((((it.y + t * it.speed + 12) % 24) + 24) % 24) - 12;
      dummy.position.set(it.x + Math.sin(t * 0.3 + it.phase) * 0.35, y, it.z);
      dummy.rotation.set(0, Math.sin(t * 0.25 + it.phase) * 0.6, it.spin * 0.3 * Math.sin(t * 0.2 + it.phase));
      dummy.scale.setScalar(it.size);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[0.8, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0.5} fog />
    </instancedMesh>
  );
}

function Rig({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointerRef();

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const scroll = window.scrollY;
    const damp = THREE.MathUtils.damp;
    // The world slides as you scroll, so the page feels like it has depth.
    g.position.y = damp(g.position.y, scroll * 0.006, 3, dt);
    g.rotation.y = damp(g.rotation.y, reducedMotion ? 0 : pointer.current.x * 0.08, 2, dt);
    g.rotation.x = damp(g.rotation.x, reducedMotion ? 0 : -pointer.current.y * 0.04, 2, dt);
  });

  return <group ref={group}>{children}</group>;
}

export default function Backdrop({ fontFamily, reducedMotion, density }: Props) {
  const cache = useMemo(() => createGlyphCache(fontFamily), [fontFamily]);
  useEffect(() => () => cache.dispose(), [cache]);

  const perDigit = Math.round(7 * density);

  return (
    <Canvas
      frameloop={reducedMotion ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={{ fov: 50, position: [0, 0, 8], near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      flat
      aria-hidden
    >
      <fog attach="fog" args={["#07090f", 6, 26]} />
      <Rig reducedMotion={reducedMotion}>
        {DIGITS.map((d) => (
          <DigitCloud
            key={d}
            digit={d}
            count={perDigit}
            texture={cache.get(d, "#5eead4")}
            seed={7}
            reducedMotion={reducedMotion}
          />
        ))}
        <Sparkles count={Math.round(90 * density)} scale={[30, 20, 12]} size={2.2} speed={0.25} opacity={0.5} color="#8ff3e3" noise={1} />
      </Rig>
    </Canvas>
  );
}
