/* eslint-disable react-hooks/immutability -- three.js textures, cameras and materials are mutable by design; React never owns them. */
"use client";

import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRANDS, KNOWN_TEST_NUMBERS, formatNumber } from "@/lib/card";
import { seeded } from "../three/glyphs";
import { CARD_H, CARD_RADIUS, CARD_W, drawBack, drawBump, drawFront, drawSheen, type FaceBrand, type FaceFonts } from "./drawCard";
import { usePointerRef } from "./hooks";

export type CardStatus = "idle" | "valid" | "invalid";

export interface CardFace {
  brand: FaceBrand;
  /** Number as printed, already grouped and padded with bullets. */
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  dim: boolean;
}

interface SceneProps extends CardFace {
  flipped: boolean;
  status: CardStatus;
  fonts: FaceFonts;
  reducedMotion: boolean;
}

// World units. The card is 3.4 wide and keeps the real 85.6 x 53.98 mm ratio.
const W = 3.4;
const H = (W * CARD_H) / CARD_W;
const R = (W * CARD_RADIUS) / CARD_W;
const BEVEL = 0.012;
const DEPTH = 0.03;
const HALF_THICKNESS = DEPTH / 2 + BEVEL;

const GREEN = new THREE.Color("#2fd47a");
const RED = new THREE.Color("#e5484d");

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function makeCanvasTexture(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { canvas, texture };
}

function CardMesh({ brand, number, name, expiry, cvv, dim, flipped, status, fonts, reducedMotion }: SceneProps) {
  const pointer = usePointerRef();
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const sheenMat = useRef<THREE.MeshBasicMaterial>(null);
  const sheenTex = useRef<THREE.CanvasTexture | null>(null);

  const bodyGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRectShape(W - 2 * BEVEL, H - 2 * BEVEL, R - BEVEL), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelSize: BEVEL,
      bevelThickness: BEVEL,
      bevelSegments: 3,
      curveSegments: 14,
    });
    geo.center();
    return geo;
  }, []);

  const front = useMemo(() => makeCanvasTexture(CARD_W, CARD_H), []);
  const back = useMemo(() => makeCanvasTexture(CARD_W, CARD_H), []);
  const bump = useMemo(() => {
    const t = makeCanvasTexture(CARD_W, CARD_H);
    t.texture.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);
  const sheen = useMemo(() => {
    const t = makeCanvasTexture(256, 128);
    t.texture.wrapS = THREE.RepeatWrapping;
    t.texture.colorSpace = THREE.NoColorSpace;
    drawSheen(t.canvas.getContext("2d")!, 256, 128);
    t.texture.needsUpdate = true;
    return t;
  }, []);

  useEffect(() => {
    sheenTex.current = sheen.texture;
  }, [sheen]);

  useEffect(() => {
    drawFront(front.canvas.getContext("2d")!, { brand, number, name, expiry, dim, fonts });
    front.texture.needsUpdate = true;
  }, [front, brand, number, name, expiry, dim, fonts]);

  useEffect(() => {
    drawBump(bump.canvas.getContext("2d")!, { number, name, expiry, fonts });
    bump.texture.needsUpdate = true;
  }, [bump, number, name, expiry, fonts]);

  useEffect(() => {
    drawBack(back.canvas.getContext("2d")!, { brand, cvv, name, fonts });
    back.texture.needsUpdate = true;
  }, [back, brand, cvv, name, fonts]);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      front.texture.dispose();
      back.texture.dispose();
      sheen.texture.dispose();
      bump.texture.dispose();
    },
    [bodyGeometry, front, back, sheen, bump],
  );

  // Animation state lives in a ref so frames never touch React.
  const anim = useRef({
    intro: reducedMotion ? 1 : 0,
    rotX: 0,
    rotY: 0,
    flip: 0,
    spin: 0,
    spinTarget: 0,
    glow: 0,
    brand: brand.id,
    edge: new THREE.Color(brand.colors.to),
    tmp: new THREE.Color(),
  });

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const a = anim.current;
    const t = state.clock.elapsedTime;

    if (a.brand !== brand.id) {
      a.brand = brand.id;
      if (!reducedMotion) a.spinTarget += Math.PI * 2;
    }

    const m = THREE.MathUtils.damp;
    a.intro = m(a.intro, 1, 2.2, dt);
    a.spin = m(a.spin, a.spinTarget, 3.2, dt);
    a.flip = m(a.flip, flipped ? Math.PI : 0, 5, dt);

    const tiltX = reducedMotion ? 0 : -pointer.current.y * 0.32;
    const tiltY = reducedMotion ? 0 : pointer.current.x * 0.5;
    a.rotX = m(a.rotX, tiltX, 4, dt);
    a.rotY = m(a.rotY, tiltY, 4, dt);

    const float = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.05;
    const ease = 1 - Math.pow(1 - a.intro, 3);

    g.position.y = float + (1 - ease) * -3.2;
    g.position.z = (1 - ease) * -2;
    g.rotation.x = a.rotX + (1 - ease) * 1.1;
    g.rotation.y = a.rotY + a.flip + a.spin + (1 - ease) * -1.6;
    g.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.012;
    g.scale.setScalar(0.75 + 0.25 * ease);

    // Edge glow: green when valid, red when a full-length number fails, otherwise the brand's own tone.
    const mat = bodyMat.current;
    if (mat) {
      a.edge.set(brand.colors.to);
      const target = status === "valid" ? GREEN : status === "invalid" ? RED : a.edge;
      a.glow = m(a.glow, status === "idle" ? 0 : 0.9, 5, dt);
      a.tmp.copy(mat.color).lerp(target, 1 - Math.exp(-6 * dt));
      mat.color.copy(a.tmp);
      mat.emissive.copy(a.tmp);
      mat.emissiveIntensity = a.glow * 0.55;
    }

    const sm = sheenMat.current;
    const st = sheenTex.current;
    if (sm && st) {
      st.offset.x = -0.5 + (pointer.current.x * 0.5 + 0.5) * 1.0 + Math.sin(t * 0.5) * 0.06;
      sm.opacity = reducedMotion ? 0.1 : 0.12 + Math.abs(pointer.current.x) * 0.22;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={bodyGeometry}>
        <meshStandardMaterial ref={bodyMat} color={brand.colors.to} metalness={0.2} roughness={0.42} />
      </mesh>

      <mesh position={[0, 0, HALF_THICKNESS + 0.002]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial
          map={front.texture}
          bumpMap={bump.texture}
          bumpScale={1.6}
          alphaTest={0.5}
          roughness={0.5}
          metalness={0}
          clearcoat={0.8}
          clearcoatRoughness={0.25}
          envMapIntensity={0.55}
        />
      </mesh>

      <mesh position={[0, 0, HALF_THICKNESS + 0.004]} scale={0.94}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          ref={sheenMat}
          map={sheen.texture}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -HALF_THICKNESS - 0.002]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial
          map={back.texture}
          alphaTest={0.5}
          roughness={0.5}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          envMapIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

/** Every network's card, drifting in a slow ring behind the main one. */
function Orbit({ fonts, reducedMotion }: { fonts: FaceFonts; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const minis = useMemo(() => BRANDS.map(() => makeCanvasTexture(CARD_W, CARD_H)), []);

  useEffect(() => {
    BRANDS.forEach((brand, i) => {
      const sample = KNOWN_TEST_NUMBERS[brand.id];
      drawFront(minis[i].canvas.getContext("2d")!, {
        brand,
        number: formatNumber(sample, brand, sample.length),
        name: "",
        expiry: "",
        dim: false,
        fonts,
      });
      minis[i].texture.needsUpdate = true;
    });
  }, [minis, fonts]);

  useEffect(
    () => () => {
      minis.forEach((m) => m.texture.dispose());
    },
    [minis],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = reducedMotion ? 0 : state.clock.elapsedTime * 0.12;
    g.children.forEach((child, i) => {
      const angle = (i / BRANDS.length) * Math.PI * 2 + t;
      // Always behind the main card (z is negative), so nothing ever covers it.
      child.position.set(Math.cos(angle) * 4.6, Math.sin(angle * 2) * 0.55, -2.2 - (1 + Math.sin(angle)) * 1.6);
      child.rotation.set(0, -Math.cos(angle) * 0.55, Math.sin(angle) * 0.08);
    });
  });

  return (
    <group ref={group}>
      {minis.map((m, i) => (
        <mesh key={BRANDS[i].id} scale={0.5}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={m.texture} transparent alphaTest={0.5} opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const BURST_COUNT = 180;
const BURST_SECONDS = 1.7;

/** A short shower of green sparks when a number turns valid. */
function Burst({ status }: { status: CardStatus }) {
  const points = useRef<THREE.Points>(null);
  const startedAt = useRef(-1);
  const prev = useRef<CardStatus>(status);

  const { dirs, positions } = useMemo(() => {
    const rnd = seeded(23);
    const d = new Float32Array(BURST_COUNT * 3);
    for (let i = 0; i < BURST_COUNT; i++) {
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      const speed = 1.4 + rnd() * 3.2;
      d[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      d[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed * 0.8;
      d[i * 3 + 2] = Math.cos(phi) * speed * 0.6 + 0.8;
    }
    return { dirs: d, positions: new Float32Array(BURST_COUNT * 3) };
  }, []);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    const now = state.clock.elapsedTime;
    if (status === "valid" && prev.current !== "valid") startedAt.current = now;
    prev.current = status;

    const age = now - startedAt.current;
    if (startedAt.current < 0 || age > BURST_SECONDS) {
      p.visible = false;
      return;
    }
    p.visible = true;
    const k = age * (1 - age * 0.25);
    for (let i = 0; i < BURST_COUNT * 3; i++) positions[i] = dirs[i] * k;
    p.geometry.attributes.position.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = 1 - age / BURST_SECONDS;
  });

  return (
    <points ref={points} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#7dffb4" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Keep the whole card in view on narrow screens by backing the camera off. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fov = THREE.MathUtils.degToRad(cam.fov);
    const needed = (W * 1.3) / (2 * Math.tan(fov / 2) * aspect);
    const neededForHeight = (H * 1.7) / (2 * Math.tan(fov / 2));
    cam.position.z = Math.max(needed, neededForHeight, 6);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

export default function Card3D(props: SceneProps & { active: boolean; showcase?: boolean }) {
  const { active, showcase = false, ...scene } = props;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 0, 7.5], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      flat
      style={{ touchAction: "pan-y" }}
    >
      <FitCamera />
      <ambientLight intensity={0.9} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.6} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="circle" intensity={0.8} position={[0, -3, 4]} scale={4} />
      </Environment>
      <CardMesh {...scene} />
      {showcase && (
        <>
          <Orbit fonts={scene.fonts} reducedMotion={scene.reducedMotion} />
          <Burst status={scene.status} />
          <Sparkles count={70} scale={[7, 4.5, 3]} size={2.4} speed={0.35} opacity={0.7} color="#8ff3e3" />
        </>
      )}
    </Canvas>
  );
}
