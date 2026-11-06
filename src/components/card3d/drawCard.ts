import type { Brand } from "@/lib/card";

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
}

function paintChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const w = 128;
  const h = 100;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#f6e3a6");
  g.addColorStop(0.5, "#d9b45f");
  g.addColorStop(1, "#b88a2e");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(90,60,10,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h / 3);
  ctx.lineTo(x + w, y + h / 3);
  ctx.moveTo(x, y + (h * 2) / 3);
  ctx.lineTo(x + w, y + (h * 2) / 3);
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4, 8);
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

  // Network name, top right. Plain type rather than a logo: logos are trademarks.
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "right";
  ctx.fillStyle = brand.colors.ink;
  ctx.font = `italic 700 ${brand.name.length > 12 ? 44 : 56}px ${fonts.sans}`;
  ctx.fillText(brand.name.toUpperCase(), CARD_W - 70, 120);

  ctx.textAlign = "left";
  ctx.globalAlpha = o.dim ? 0.55 : 1;

  // Shrink the number to fit if a 19 digit card comes along.
  const size = o.number.length > 20 ? 50 : 62;
  ctx.font = `500 ${size}px ${fonts.mono}`;
  embossed(ctx, o.number, 74, 440, brand.colors.ink);

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

  ctx.restore();
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
