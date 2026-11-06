/**
 * Simplified, canvas-drawn versions of each network's mark. They are recreations built from basic shapes and
 * plain text, not the official artwork, so they stay small and need no image files. The marks belong to their
 * owners and are here only to say which network a card number belongs to.
 *
 * Each mark is drawn with its right edge at `x` and its vertical centre at `y`.
 */
export interface LogoFonts {
  sans: string;
}

function discs(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, left: string, right: string, overlap: string) {
  const gap = r * 0.62;
  const lx = x - r - gap;
  const rx = x - r;
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.arc(lx, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.arc(rx, y, r, 0, Math.PI * 2);
  ctx.fill();
  // The lens where the two circles cross has its own colour on the real marks.
  ctx.save();
  ctx.beginPath();
  ctx.arc(lx, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = overlap;
  ctx.beginPath();
  ctx.arc(rx, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function slab(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, skew: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + w + skew, y);
  ctx.lineTo(x + w - skew, y + h);
  ctx.lineTo(x - skew, y + h);
  ctx.closePath();
  ctx.fill();
}

export function drawLogo(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  ink: string,
  fonts: LogoFonts,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";

  switch (id) {
    case "visa": {
      ctx.fillStyle = "#ffffff";
      ctx.font = `italic 800 92px ${fonts.sans}`;
      ctx.fillText("VISA", 0, 0);
      // The small golden flick above the A on the real wordmark.
      ctx.fillStyle = "#f7b600";
      ctx.beginPath();
      ctx.moveTo(-58, -48);
      ctx.lineTo(-30, -48);
      ctx.lineTo(-40, -36);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "mastercard": {
      discs(ctx, 0, -8, 46, "#eb001b", "#f79e1b", "#ff5f00");
      ctx.fillStyle = ink;
      ctx.font = `600 22px ${fonts.sans}`;
      ctx.textAlign = "center";
      ctx.fillText("mastercard", -64, 56);
      break;
    }
    case "maestro": {
      discs(ctx, 0, -8, 46, "#0099df", "#ed0000", "#6c6bbd");
      ctx.fillStyle = ink;
      ctx.font = `700 24px ${fonts.sans}`;
      ctx.textAlign = "center";
      ctx.fillText("maestro", -64, 56);
      break;
    }
    case "amex": {
      const w = 148;
      const h = 100;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(-w, -h / 2, w, h, 8);
      ctx.fill();
      ctx.fillStyle = "#006fcf";
      ctx.textAlign = "center";
      ctx.font = `800 31px ${fonts.sans}`;
      ctx.fillText("AMERICAN", -w / 2, -17);
      ctx.fillText("EXPRESS", -w / 2, 19);
      break;
    }
    case "discover": {
      ctx.fillStyle = ink;
      ctx.font = `800 46px ${fonts.sans}`;
      ctx.fillText("DISCOVER", -64, 0);
      const g = ctx.createLinearGradient(-60, -34, 0, 34);
      g.addColorStop(0, "#ffa23a");
      g.addColorStop(1, "#e8590c");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(-30, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "diners": {
      const r = 50;
      const cx = -r;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0079be";
      ctx.beginPath();
      ctx.arc(cx, 0, r - 5, 0, Math.PI * 2);
      ctx.fill();
      // Two white half discs with a thin gap down the middle.
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx - 3, 0, r - 13, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 3, 0, r - 13, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.textAlign = "right";
      ctx.font = `600 22px ${fonts.sans}`;
      ctx.fillText("Diners Club", 0, 70);
      break;
    }
    case "jcb": {
      const w = 44;
      const h = 84;
      const gap = 8;
      const colors = ["#0e4c96", "#d4202c", "#007940"];
      const letters = ["J", "C", "B"];
      colors.forEach((c, i) => {
        const left = -(3 - i) * w - (2 - i) * gap;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(left, -h / 2, w, h, 10);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = `800 40px ${fonts.sans}`;
        ctx.fillText(letters[i] as string, left + w / 2, 3);
      });
      break;
    }
    case "unionpay": {
      const w = 46;
      const h = 84;
      slab(ctx, -3 * w - 8, -h / 2 - 8, w, h, 8, "#e21836");
      slab(ctx, -2 * w - 4, -h / 2 - 8, w, h, 8, "#00447c");
      slab(ctx, -w, -h / 2 - 8, w, h, 8, "#007b84");
      ctx.fillStyle = ink;
      ctx.textAlign = "right";
      ctx.font = `700 26px ${fonts.sans}`;
      ctx.fillText("UnionPay", 0, 60);
      break;
    }
    default:
      break;
  }

  ctx.restore();
}
