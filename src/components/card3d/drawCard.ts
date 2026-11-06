import type { Brand } from "@/lib/card";
import { drawLogo } from "./logos";

/** Texture size. The card is 85.6 x 53.98 mm, so keep that ratio. */
export const CARD_W = 1024;
export const CARD_H = 646;
/** Corner radius in texture pixels. Must match the 3D body's corner radius. */
export const CARD_RADIUS = 46;

/** What a card face needs to know about its network. Every `Brand` fits, and so does the neutral look. */
export type FaceBrand = Pick<Brand, "name" | "colors" | "cvvLabel" | "cvvLength"> & { id: string };

/** Shown while the number is still too short to tell which network it belongs to. */
export const NEUTRAL_BRAND: FaceBrand = {
  id: "neutral",
  name: "Card",
  colors: { from: "#3a4258", to: "#151a28", ink: "#eef0f6" },
  cvvLabel: "CVV",
  cvvLength: 3,
};

export interface FaceFonts {
  mono: string;
  sans: string;
}

export interface FrontOptions {
  brand: FaceBrand;
  number: string;
  name: string;
  expiry: string;
  /** Dim the printed details, used for the sample card before anyone types. */
  dim: boolean;
  fonts: FaceFonts;
}

export interface BackOptions {
  brand: FaceBrand;
  cvv: string;
  name: string;
  fonts: FaceFonts;
}

function roundedClip(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, CARD_H, CARD_RADIUS);
  ctx.clip();
}

function paintBackground(ctx: CanvasRenderingContext2D, brand: FaceBrand) {
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, brand.colors.from);
  g.addColorStop(1, brand.colors.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Fine guilloche-style rings, the kind of pattern printed on banknotes.
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = brand.colors.ink;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 38; i++) {
    ctx.beginPath();
    ctx.ellipse(CARD_W * 0.78, CARD_H * 0.1, 60 + i * 20, 40 + i * 15, 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Soft light from the upper left so the flat texture still reads as a surface.
  const shine = ctx.createRadialGradient(CARD_W * 0.15, 0, 0, CARD_W * 0.15, 0, CARD_W * 0.9);
  shine.addColorStop(0, "rgba(255,255,255,0.22)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Fine plastic grain, so the face is not a perfectly clean gradient.
  for (let i = 0; i < 5200; i++) {
    const v = Math.random() < 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.025 + Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * CARD_W, Math.random() * CARD_H, 1.6, 1.6);
  }

  // A thin bright rim and a thin shadow just inside it, the way a real card edge catches light.
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.roundRect(2, 2, CARD_W - 4, CARD_H - 4, CARD_RADIUS - 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.roundRect(6, 6, CARD_W - 12, CARD_H - 12, CARD_RADIUS - 6);
  ctx.stroke();
}

function paintChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const w = 132;
  const h = 102;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#f8e8b0");
  g.addColorStop(0.35, "#e2c06c");
  g.addColorStop(0.7, "#c79a3f");
  g.addColorStop(1, "#a9782a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,240,190,0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Contact pads: a centre pad with separating lines, like an EMV chip.
  ctx.strokeStyle = "rgba(85,55,8,0.6)";
  ctx.lineWidth = 2.2;
  const cx0 = x + w * 0.34;
  const cx1 = x + w * 0.66;
  const y0 = y + h * 0.34;
  const y1 = y + h * 0.66;
  ctx.beginPath();
  ctx.roundRect(cx0, y0, cx1 - cx0, y1 - y0, 7);
  ctx.moveTo(x, y0);
  ctx.lineTo(cx0, y0);
  ctx.moveTo(x, y1);
  ctx.lineTo(cx0, y1);
  ctx.moveTo(cx1, y0);
  ctx.lineTo(x + w, y0);
  ctx.moveTo(cx1, y1);
  ctx.lineTo(x + w, y1);
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y0);
  ctx.moveTo(x + w / 2, y1);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

function paintContactless(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(x - 18, y, i * 14, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
  ctx.restore();
}

const HOLOGRAM_BRANDS = new Set(["visa", "mastercard", "maestro", "jcb", "unionpay", "discover"]);

/** The little foil sticker most networks put on the lower right of the front. */
function paintHologram(ctx: CanvasRenderingContext2D, id: string) {
  if (!HOLOGRAM_BRANDS.has(id)) return;
  const x = 890;
  const y = 508;
  const r = 44;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createConicGradient(0.6, x, y);
  ["#f6d6ff", "#a9e6ff", "#c9ffd9", "#fff3b0", "#ffc4d6", "#f6d6ff"].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(x, y, i * 6.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function embossed(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, ink: string) {
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillText(text, x + 2.5, y + 3);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText(text, x - 1, y - 1);
  ctx.fillStyle = ink;
  ctx.fillText(text, x, y);
}

export function drawFront(ctx: CanvasRenderingContext2D, o: FrontOptions) {
  const { brand, fonts } = o;
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.save();
  roundedClip(ctx);
  paintBackground(ctx, brand);

  paintChip(ctx, 78, 214);
  paintContactless(ctx, 292, 264, brand.colors.ink);

  // Network mark, top right. The neutral card has none until the number says which network it is.
  drawLogo(ctx, brand.id, CARD_W - 70, 118);
  paintHologram(ctx, brand.id);

  ctx.textAlign = "left";
  ctx.globalAlpha = o.dim ? 0.55 : 1;

  // Shrink the number to fit if a 19 digit card comes along.
  const size = o.number.length > 20 ? 50 : 62;
  ctx.font = `500 ${size}px ${fonts.mono}`;
  embossed(ctx, o.number, 74, 440, brand.colors.ink);
  const digits = o.number.replace(/\D/g, "");
  if (digits.length >= 4 && brand.id !== "neutral") {
    ctx.font = `500 19px ${fonts.mono}`;
    ctx.globalAlpha = o.dim ? 0.4 : 0.65;
    ctx.fillText(digits.slice(0, 4), 78, 384);
    ctx.globalAlpha = o.dim ? 0.55 : 1;
  }

  ctx.globalAlpha = o.dim ? 0.55 : 0.9;
  ctx.font = `500 21px ${fonts.sans}`;
  ctx.fillStyle = brand.colors.ink;
  ctx.fillText("VALID THRU", 640, 500);
  ctx.font = `500 40px ${fonts.mono}`;
  embossed(ctx, o.expiry || "MM/YY", 640, 548, brand.colors.ink);

  ctx.font = `500 38px ${fonts.mono}`;
  embossed(ctx, (o.name || "YOUR NAME").toUpperCase().slice(0, 24), 74, 568, brand.colors.ink);

  ctx.restore();
}

export function drawBack(ctx: CanvasRenderingContext2D, o: BackOptions) {
  const { brand, fonts } = o;
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.save();
  roundedClip(ctx);

  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, brand.colors.to);
  g.addColorStop(1, "#05060a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Magnetic stripe.
  ctx.fillStyle = "#07080b";
  ctx.fillRect(0, 70, CARD_W, 110);

  // Signature panel, striped like the real thing, with the security code at the end.
  const panelY = 244;
  ctx.fillStyle = "#e9e6dc";
  ctx.fillRect(60, panelY, 650, 84);
  ctx.strokeStyle = "rgba(60,60,80,0.18)";
  ctx.lineWidth = 2;
  for (let x = 60; x < 710; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, panelY);
    ctx.lineTo(x + 40, panelY + 84);
    ctx.stroke();
  }
  ctx.fillStyle = "#1c1c28";
  ctx.font = `italic 400 34px ${fonts.sans}`;
  ctx.textAlign = "left";
  ctx.fillText((o.name || "Authorised signature").slice(0, 26), 82, panelY + 54);

  ctx.fillStyle = "#f4f4f6";
  ctx.fillRect(724, panelY, 240, 84);
  ctx.fillStyle = "#14141c";
  ctx.font = `600 46px ${fonts.mono}`;
  ctx.textAlign = "center";
  const placeholder = "•".repeat(brand.cvvLength);
  ctx.fillText(o.cvv || placeholder, 844, panelY + 58);

  ctx.fillStyle = brand.colors.ink;
  ctx.globalAlpha = 0.8;
  ctx.font = `600 24px ${fonts.sans}`;
  ctx.fillText(brand.cvvLabel, 844, panelY + 124);
  ctx.globalAlpha = 0.45;
  ctx.textAlign = "left";
  ctx.font = `400 20px ${fonts.sans}`;
  ctx.fillText("For testing and learning. This is not a real card.", 60, 520);
  ctx.globalAlpha = 0.5;
  ctx.font = `400 17px ${fonts.sans}`;
  ctx.fillText("AUTHORISED SIGNATURE. NOT VALID UNLESS SIGNED.", 60, 358);
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(60, 398 + i * 20, 420 - i * 60, 5);
  }
  ctx.globalAlpha = 1;
  drawLogo(ctx, brand.id, CARD_W - 60, 500, 0.62);

  ctx.restore();
}

export interface BumpOptions {
  number: string;
  name: string;
  expiry: string;
  fonts: FaceFonts;
}

/** Height map for the raised (embossed) characters: white is high, black is flat. */
export function drawBump(ctx: CanvasRenderingContext2D, o: BumpOptions) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `500 ${o.number.length > 20 ? 50 : 62}px ${o.fonts.mono}`;
  ctx.fillText(o.number, 74, 440);
  ctx.font = `500 40px ${o.fonts.mono}`;
  ctx.fillText(o.expiry || "MM/YY", 640, 548);
  ctx.font = `500 38px ${o.fonts.mono}`;
  ctx.fillText((o.name || "YOUR NAME").toUpperCase().slice(0, 24), 74, 568);
}

/** Soft diagonal bands used by the moving highlight on top of the card. */
export function drawSheen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.35, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(0.65, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
