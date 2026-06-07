import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Client-side port of generate_swish_qr.py.
 *
 * The original script renders a Swish payment poster with Pillow. A deployed
 * SPA (and a phone) can't run Python, so the exact same rendering is done here
 * on a <canvas>: a "swish://payment?data=..." deep link encoded as a QR with
 * diamond modules + rounded finder patterns, a centre logo, and a Sanctum
 * poster around it. Amount, service text and every colour are editable.
 */

// --- Poster geometry (matches generate_swish_qr.py) ------------------------
const BOX_SIZE = 20;
const BORDER = 2;
const W = 2480;
const H = 3508;

const DEFAULT_SWISH_NUMBER = "1236164784";

type Corners = [boolean, boolean, boolean, boolean]; // TL, TR, BR, BL

type ColorKey =
  | "primary"
  | "background"
  | "gradientLight"
  | "gradientDark"
  | "title"
  | "message";

const COLOR_FIELDS: { key: ColorKey; label: string; default: string }[] = [
  { key: "primary", label: "Primär (QR & ram)", default: "#b8956a" },
  { key: "background", label: "Bakgrund", default: "#000000" },
  { key: "gradientLight", label: "Gradient ljus", default: "#b8956a" },
  { key: "gradientDark", label: "Gradient mörk", default: "#8a6a45" },
  { key: "title", label: "Titel & namn", default: "#f4ece0" },
  { key: "message", label: "Meddelandetext", default: "#2c2014" },
];

type Colors = Record<ColorKey, string>;

const DEFAULT_COLORS: Colors = COLOR_FIELDS.reduce((acc, f) => {
  acc[f.key] = f.default;
  return acc;
}, {} as Colors);

// --- Canvas helpers --------------------------------------------------------
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Kunde inte ladda ${src}`));
    img.src = src;
  });
}

/** Rounded rectangle path with per-corner control (corners: TL, TR, BR, BL). */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  corners: Corners = [true, true, true, true],
) {
  const [tl, tr, br, bl] = corners.map((c) => (c ? radius : 0));
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function centerText(
  ctx: CanvasRenderingContext2D,
  cy: number,
  text: string,
  font: string,
  fill: string,
) {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, cy);
}

/** Group a Swish number for display, e.g. 1236164784 -> "123 616 47 84". */
function formatSwishNumber(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

interface PosterOptions {
  amount: number;
  message: string;
  swishNumber: string;
  colors: Colors;
}

async function renderPoster(opts: PosterOptions): Promise<string> {
  const { amount, message, swishNumber, colors } = opts;

  // --- Swish deep link ---------------------------------------------------
  // Encoding "swish://payment?data=..." so a native camera opens the Swish app.
  const payload = {
    version: 1,
    payee: { value: swishNumber.replace(/\D/g, "") },
    amount: { value: amount },
    message: { value: message },
  };
  const data =
    "swish://payment?data=" + encodeURIComponent(JSON.stringify(payload));
  const displayNumber = formatSwishNumber(swishNumber);

  // --- 1. Build the QR tile ---------------------------------------------
  const qr = QRCode.create(data, { errorCorrectionLevel: "Q" });
  const n = qr.modules.size;
  const bits = qr.modules.data;
  const isDark = (r: number, c: number) => !!bits[r * n + c];

  const imgSize = (n + 2 * BORDER) * BOX_SIZE;
  const qrCanvas = document.createElement("canvas");
  qrCanvas.width = imgSize;
  qrCanvas.height = imgSize;
  const qctx = qrCanvas.getContext("2d")!;
  qctx.fillStyle = colors.background;
  qctx.fillRect(0, 0, imgSize, imgSize);

  // finders: (row, col, corners) — corners=(TL,TR,BR,BL); false = sharp corner.
  const finders: { fr: number; fc: number; corners: Corners }[] = [
    { fr: 0, fc: 0, corners: [true, true, false, true] }, // top-left: sharp BR
    { fr: 0, fc: n - 7, corners: [true, true, true, false] }, // top-right: sharp BL
    { fr: n - 7, fc: 0, corners: [true, false, true, true] }, // bottom-left: sharp TR
  ];
  const inFinder = (r: number, c: number) =>
    finders.some((f) => r >= f.fr && r < f.fr + 7 && c >= f.fc && c < f.fc + 7);

  // Diamond modules with whitespace between them for an airier look.
  qctx.fillStyle = colors.primary;
  const half = BOX_SIZE / 2;
  const d = half * 0.78;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isDark(r, c) || inFinder(r, c)) continue;
      const cx = (c + BORDER) * BOX_SIZE + half;
      const cy = (r + BORDER) * BOX_SIZE + half;
      qctx.beginPath();
      qctx.moveTo(cx, cy - d);
      qctx.lineTo(cx + d, cy);
      qctx.lineTo(cx, cy + d);
      qctx.lineTo(cx - d, cy);
      qctx.closePath();
      qctx.fill();
    }
  }

  // Finder patterns: outer (primary), mid (background), inner (primary).
  const outerSize = 7 * BOX_SIZE;
  const midSize = 5 * BOX_SIZE;
  const innerSize = 3 * BOX_SIZE;
  const outerRadius = Math.floor(1.4 * BOX_SIZE);
  const midRadius = Math.floor(1.0 * BOX_SIZE);
  const innerRadius = Math.floor(0.6 * BOX_SIZE);
  for (const { fr, fc, corners } of finders) {
    const x = (fc + BORDER) * BOX_SIZE;
    const y = (fr + BORDER) * BOX_SIZE;
    qctx.fillStyle = colors.primary;
    roundRectPath(qctx, x, y, outerSize, outerSize, outerRadius, corners);
    qctx.fill();
    const midOff = (outerSize - midSize) / 2;
    qctx.fillStyle = colors.background;
    roundRectPath(
      qctx,
      x + midOff,
      y + midOff,
      midSize,
      midSize,
      midRadius,
      corners,
    );
    qctx.fill();
    const innerOff = (outerSize - innerSize) / 2;
    qctx.fillStyle = colors.primary;
    roundRectPath(
      qctx,
      x + innerOff,
      y + innerOff,
      innerSize,
      innerSize,
      innerRadius,
      corners,
    );
    qctx.fill();
  }

  // Centre logo on a circular backplate matching the tile background.
  const centerLogo = await loadImage("/swish_middle.png");
  const logoSize = imgSize / 4;
  const lRatio = logoSize / Math.max(centerLogo.width, centerLogo.height);
  const lW = centerLogo.width * lRatio;
  const lH = centerLogo.height * lRatio;
  const pad = 28;
  const diameter = Math.max(lW, lH) * 1.25 + pad * 2;
  const mid = imgSize / 2;
  qctx.fillStyle = colors.background;
  qctx.beginPath();
  qctx.ellipse(mid, mid, diameter / 2, diameter / 2, 0, 0, Math.PI * 2);
  qctx.fill();
  qctx.drawImage(centerLogo, mid - lW / 2, mid - lH / 2, lW, lH);

  // --- 2. Compose the Sanctum poster ------------------------------------
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, W, H);

  const fontTitle = `bold 180px "Segoe UI", Arial, sans-serif`;
  const fontNumber = `bold 128px "Segoe UI", Arial, sans-serif`;
  const fontMsg = `600 104px "Segoe UI", Arial, sans-serif`;
  const fontLabel = `600 104px "Segoe UI", Arial, sans-serif`;

  // Gold gradient panel with softly rounded corners.
  const margin = 110;
  const panelTop = 120;
  const panelBottom = 2780;
  const pw = W - 2 * margin;
  const ph = panelBottom - panelTop;
  const gradient = ctx.createLinearGradient(0, panelTop, 0, panelBottom);
  gradient.addColorStop(0, colors.gradientLight);
  gradient.addColorStop(1, colors.gradientDark);
  ctx.fillStyle = gradient;
  roundRectPath(ctx, margin, panelTop, pw, ph, 180);
  ctx.fill();

  centerText(ctx, 360, "Betala med Swish", fontTitle, colors.title);

  // Dark card holding the QR + number.
  const targetQr = 1080;
  const cardW = 1500;
  const cardPadTop = 120;
  const numberGap = 70;
  const numH = 128;
  const cardH = cardPadTop + targetQr + numberGap + numH + 130;
  const cardX = (W - cardW) / 2;
  const cardY = 600;

  ctx.fillStyle = colors.primary; // subtle gold frame
  roundRectPath(ctx, cardX - 12, cardY - 12, cardW + 24, cardH + 24, 112);
  ctx.fill();
  ctx.fillStyle = colors.background;
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 100);
  ctx.fill();

  const qrX = (W - targetQr) / 2;
  const qrY = cardY + cardPadTop;
  ctx.drawImage(qrCanvas, qrX, qrY, targetQr, targetQr);

  const numCy = qrY + targetQr + numberGap + numH / 2;
  centerText(ctx, numCy, displayNumber, fontNumber, colors.primary);

  // Message + recipient on the panel below the card.
  const below = cardY + cardH;
  centerText(ctx, below + 260, message, fontMsg, colors.message);
  centerText(ctx, below + 440, "Sanctum", fontLabel, colors.title);

  // Swish branding at the bottom.
  const brand = await loadImage("/swish_secondary_dark.png");
  const brandW = 1080;
  const brRatio = brandW / brand.width;
  const brandH = brand.height * brRatio;
  const brandY = panelBottom + (H - panelBottom - brandH) / 2;
  ctx.drawImage(brand, (W - brandW) / 2, brandY, brandW, brandH);

  return canvas.toDataURL("image/png");
}

// --- Component -------------------------------------------------------------
const QrGenerator = () => {
  const [amount, setAmount] = useState("750");
  const [message, setMessage] = useState("Idrottsmassage");
  const [colors, setColors] = useState<Colors>(DEFAULT_COLORS);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const setColor = (key: ColorKey, value: string) =>
    setColors((prev) => ({ ...prev, [key]: value }));

  // Live preview — re-render (debounced) whenever an input or colour changes.
  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);
    const t = setTimeout(async () => {
      try {
        const url = await renderPoster({
          amount: Number(amount) || 0,
          message: message.trim(),
          swishNumber: DEFAULT_SWISH_NUMBER,
          colors,
        });
        if (!cancelled) {
          setImageUrl(url);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Något gick fel");
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, message, colors]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const slug =
      message.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "") ||
      "swish";
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${slug}_qr.png`;
    link.click();
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex justify-center">
      <div className="w-full max-w-md px-5 pt-10 pb-16">
        {!generated ? (
          /* ---------------- Edit view ---------------- */
          <>
            {/* Live preview */}
            <div className="relative mb-7 flex justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Förhandsvisning av QR-affisch"
                  className="w-52 rounded-xl"
                />
              ) : (
                <div className="flex h-72 w-52 items-center justify-center rounded-xl  bg-[#161616] text-sm text-neutral-500">
                  Förhandsvisning…
                </div>
              )}
              {isRendering && (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] text-neutral-300">
                  uppdaterar…
                </span>
              )}
            </div>

            {/* Summa */}
            <label className="block mb-4">
              <span className="text-sm text-neutral-300">Summa (kr)</span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl bg-[#161616] border border-primary px-4 py-3 text-white focus:border-primary focus:outline-none"
              />
            </label>

            {/* Tjänst */}
            <label className="block mb-6">
              <span className="text-sm text-neutral-300">Tjänst</span>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="t.ex. Idrottsmassage"
                className="mt-1 w-full rounded-xl bg-[#161616] border border-primary px-4 py-3 text-white focus:border-primary focus:outline-none"
              />
            </label>

            {/* Färger */}
            <p className="text-sm font-semibold text-neutral-200 mb-3">
              Färger
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              {COLOR_FIELDS.map((f) => (
                <label
                  key={f.key}
                  className="flex items-center gap-3 rounded-xl bg-[#161616] border border-primary px-3 py-2"
                >
                  <input
                    type="color"
                    value={colors[f.key]}
                    onChange={(e) => setColor(f.key, e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-neutral-300 leading-tight">
                    {f.label}
                  </span>
                </label>
              ))}
            </div>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            {/* Generera */}
            <button
              onClick={() => setGenerated(true)}
              disabled={!imageUrl}
              className="w-full rounded-xl bg-primary text-black font-bold py-4 transition hover:opacity-90 disabled:opacity-60"
            >
              Generera QR
            </button>
          </>
        ) : (
          /* ---------------- Result view ---------------- */
          <div className="flex flex-col items-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="QR-affisch"
                onClick={() => setFullscreen(true)}
                className="w-72 rounded-xl  cursor-zoom-in"
              />
            )}
            <div className="mt-7 flex w-full gap-3">
              <button
                onClick={() => setFullscreen(true)}
                className="flex-1 rounded-xl bg-[#161616] border border-primary font-semibold py-4 transition hover:bg-[#1f1f1f]"
              >
                Visa QR
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-xl bg-primary text-black font-bold py-4 transition hover:opacity-90"
              >
                Ladda ner QR
              </button>
            </div>
            <button
              onClick={() => setGenerated(false)}
              className="mt-3 w-full rounded-xl border border-primary font-semibold py-4 text-neutral-300 transition hover:bg-[#161616]"
            >
              Generera ny QR
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen view */}
      {fullscreen && imageUrl && (
        <div
          onClick={() => setFullscreen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        >
          <img
            src={imageUrl}
            alt="QR-affisch"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default QrGenerator;
