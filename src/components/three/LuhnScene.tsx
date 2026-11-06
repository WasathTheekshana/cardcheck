/* eslint-disable react-hooks/immutability -- three.js objects are mutated every frame on purpose; React never owns them. */
"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { LuhnStep } from "@/lib/card";
import { usePointerRef } from "../card3d/hooks";
import { createGlyphCache } from "./glyphs";

export interface LuhnSceneProps {
  steps: LuhnStep[];
  /** 0 to 5, the same stage the lesson text is on. */
  stage: number;
  valid: boolean;
  remainder: number;
  fontFamily: string;
  reducedMotion: boolean;
  active: boolean;
}

type Glyphs = ReturnType<typeof createGlyphCache>;

const SPACING = 0.64;
const FLOOR = -1.4;
const TEAL = new THREE.Color("#5eead4");
const NEUTRAL = new THREE.Color("#1c2336");
const GREEN = new THREE.Color("#2fd47a");
const RED = new THREE.Color("#ff6b6f");

function labelFor(step: LuhnStep, stage: number): string {
  if (stage < 2) return String(step.digit);
  if (stage === 2) return step.doubled ? String(step.rawDoubled) : String(step.digit);
  return String(step.value);
}

function Block({ step, x, stage, glyphs, reducedMotion }: {
  step: LuhnStep;
  x: number;
  stage: number;
  glyphs: Glyphs;
  reducedMotion: boolean;
}) {
  const block = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const bar = useRef<THREE.Mesh>(null);

  const picked = stage >= 1 && step.doubled;
  const label = labelFor(step, stage);
  const map = glyphs.get(label, picked ? "#052e29" : "#eef1fa");

  const a = useRef({
    y: 0,
    scale: 1,
    spin: 0,
    spinTarget: 0,
    label,
    bar: 0.001,
    color: new THREE.Color(NEUTRAL),
  });

  useFrame((state, dt) => {
    const g = block.current;
    const mat = body.current;
    const b = bar.current;
    if (!g || !mat || !b) return;

    const s = a.current;
    const t = state.clock.elapsedTime;
    const damp = THREE.MathUtils.damp;

    // Drop in from above when the scene first appears, one block after another.
    const intro = reducedMotion ? 1 : Math.min(1, Math.max(0, (t - step.index * 0.05) * 1.4));
    const ease = 1 - Math.pow(1 - intro, 3);

    s.y = damp(s.y, picked ? 0.5 : 0, 5, dt);
    s.scale = damp(s.scale, stage >= 2 && step.doubled ? 1.14 : 1, 5, dt);

    // Whenever the number on the face changes, the block does a full turn so the change is easy to see.
    if (s.label !== label) {
      s.label = label;
      if (!reducedMotion) s.spinTarget += Math.PI * 2;
    }
    s.spin = damp(s.spin, s.spinTarget, 5, dt);

    g.position.y = s.y + (1 - ease) * 3 + (reducedMotion ? 0 : Math.sin(t * 1.2 + step.index * 0.5) * 0.025);
    g.rotation.x = s.spin;
    g.scale.setScalar(s.scale * (0.4 + 0.6 * ease));

    s.color.lerp(picked ? TEAL : NEUTRAL, 1 - Math.exp(-8 * dt));
    mat.color.copy(s.color);
    mat.emissive.copy(s.color);
    mat.emissiveIntensity = picked ? 0.35 : 0.04;

    // From the "add everything up" step on, each block grows a bar whose height is its value.
    s.bar = damp(s.bar, stage >= 4 ? step.value * 0.075 + 0.03 : 0.001, 4, dt);
    b.scale.y = s.bar;
    b.position.y = FLOOR + s.bar / 2;
  });

  return (
    <group position-x={x}>
      <group ref={block}>
        <RoundedBox args={[0.52, 0.66, 0.2]} radius={0.07} smoothness={4}>
          <meshStandardMaterial ref={body} color="#1c2336" metalness={0.35} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.102]}>
          <planeGeometry args={[0.46, 0.575]} />
          <meshBasicMaterial map={map} transparent />
        </mesh>
      </group>

      <mesh ref={bar} position-y={FLOOR}>
        <boxGeometry args={[0.38, 1, 0.38]} />
        <meshStandardMaterial color={step.doubled ? "#5eead4" : "#7b8bb5"} metalness={0.2} roughness={0.5} emissive={step.doubled ? "#5eead4" : "#7b8bb5"} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

/** A ring that closes when the sum is a multiple of 10 and stays open, in red, when it is not. */
function Verdict({ stage, valid, remainder, reducedMotion }: { stage: number; valid: boolean; remainder: number; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const shown = useRef(0);
  const arc = valid ? Math.PI * 2 : Math.max((remainder / 10) * Math.PI * 2, 0.35);

  useFrame((state, dt) => {
    const g = group.current;
    const m = mat.current;
    if (!g || !m) return;
    shown.current = THREE.MathUtils.damp(shown.current, stage >= 5 ? 1 : 0, 4, dt);
    const pulse = valid && !reducedMotion ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.04 : 1;
    g.scale.setScalar(Math.max(shown.current, 0.0001) * pulse);
    g.rotation.z += reducedMotion ? 0 : dt * (valid ? 0.6 : 1.4);
    m.color.copy(valid ? GREEN : RED);
    m.emissive.copy(valid ? GREEN : RED);
  });

  return (
    <group ref={group} position={[0, 1.4, 0]} scale={0.0001}>
      <mesh>
        <torusGeometry args={[0.42, 0.05, 20, 96, arc]} />
        <meshStandardMaterial ref={mat} color="#2fd47a" emissiveIntensity={0.9} metalness={0.3} roughness={0.35} />
      </mesh>
    </group>
  );
}

function CameraRig({ span, reducedMotion }: { span: number; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const pointer = usePointerRef();
  const baseZ = useRef(9);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = THREE.MathUtils.degToRad(cam.fov);
    const aspect = size.width / size.height;
    const forWidth = (span * 1.1) / (2 * Math.tan(fov / 2) * aspect);
    const forHeight = 4.0 / (2 * Math.tan(fov / 2));
    baseZ.current = Math.max(forWidth, forHeight, 6);
  }, [camera, size.width, size.height, span]);

  useFrame((_, dt) => {
    const damp = THREE.MathUtils.damp;
    const px = reducedMotion ? 0 : pointer.current.x;
    const py = reducedMotion ? 0 : pointer.current.y;
    camera.position.x = damp(camera.position.x, px * 1.3, 3, dt);
    camera.position.y = damp(camera.position.y, 0.4 + py * 0.6, 3, dt);
    camera.position.z = damp(camera.position.z, baseZ.current, 3, dt);
    camera.lookAt(0, 0.1, 0);
  });

  return null;
}

export default function LuhnScene({ steps, stage, valid, remainder, fontFamily, reducedMotion, active }: LuhnSceneProps) {
  const glyphs = useMemo(() => createGlyphCache(fontFamily), [fontFamily]);
  useEffect(() => () => glyphs.dispose(), [glyphs]);

  const span = steps.length * SPACING;

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ fov: 35, position: [0, 0.4, 14], near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true }}
      flat
    >
      <CameraRig span={span} reducedMotion={reducedMotion} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 6]} intensity={1.8} />
      <pointLight position={[0, 2.5, 3]} intensity={14} distance={12} color="#5eead4" />
      <gridHelper args={[60, 60, "#1f4a47", "#141b2b"]} position={[0, FLOOR - 0.01, 0]} />

      {steps.map((step, i) => (
        <Block
          key={step.index}
          step={step}
          x={(i - (steps.length - 1) / 2) * SPACING}
          stage={stage}
          glyphs={glyphs}
          reducedMotion={reducedMotion}
        />
      ))}

      <Verdict stage={stage} valid={valid} remainder={remainder} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
