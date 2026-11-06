import * as THREE from "three";

/** Small seeded generator, so scenes look the same on every render and in every browser. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paint a short label (a digit, or two) onto a transparent canvas and return it as a texture. */
export function makeGlyphTexture(label: string, fontFamily: string, ink: string) {
  const w = 192;
  const h = 240;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${label.length > 1 ? 120 : 170}px ${fontFamily}`;
  ctx.fillText(label, w / 2, h / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Creates glyph textures on demand and remembers them. Call `dispose` when the scene goes away. */
export function createGlyphCache(fontFamily: string) {
  const cache = new Map<string, THREE.CanvasTexture>();
  return {
    get(label: string, ink: string) {
      const key = `${label}|${ink}`;
      let t = cache.get(key);
      if (!t) {
        t = makeGlyphTexture(label, fontFamily, ink);
        cache.set(key, t);
      }
      return t;
    },
    dispose() {
      cache.forEach((t) => t.dispose());
      cache.clear();
    },
  };
}
