/**
 * Network logos on the card faces.
 *
 * The SVG files in `public/logos` are the networks' marks, served from this site's own origin (no third party
 * requests). They belong to their owners and are used here to show which network a card number belongs to, for
 * education only. Visa's mark is a white copy, because that is how it prints on a blue card.
 *
 * Canvas drawing is synchronous, so the images are loaded up front with `loadLogos()` and a face painted before
 * they arrive simply has no logo yet. `useFaceFonts` waits for them and triggers a repaint.
 */
const FILES: Record<string, string> = {
  visa: "/logos/visa-white.svg",
  mastercard: "/logos/mastercard.svg",
  maestro: "/logos/maestro.svg",
  amex: "/logos/amex.svg",
  discover: "/logos/discover.svg",
  diners: "/logos/diners.svg",
  jcb: "/logos/jcb.svg",
  unionpay: "/logos/unionpay.svg",
};

const images = new Map<string, HTMLImageElement>();
let loading: Promise<void> | null = null;

export function loadLogos(): Promise<void> {
  if (loading) return loading;
  loading = Promise.all(
    Object.entries(FILES).map(
      ([id, src]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.set(id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
  return loading;
}

/** Widest and tallest a logo may be, in texture pixels, before `scale` is applied. */
const MAX_W = 250;
const MAX_H = 128;

/** Draws the logo with its right edge at `x` and its vertical centre at `y`. Does nothing until it has loaded. */
export function drawLogo(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, scale = 1) {
  const img = images.get(id);
  if (!img || !img.naturalWidth) return;
  const fit = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight) * scale;
  const w = img.naturalWidth * fit;
  const h = img.naturalHeight * fit;
  ctx.drawImage(img, x - w, y - h / 2, w, h);
}
