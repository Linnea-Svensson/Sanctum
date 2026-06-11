import { useEffect, useRef, useState } from "react";
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

const COLOR_DEFAULTS_KIRO: { [key in ColorKey]: string } = {
  primary: "#b8956a",
  background: "#000000",
  gradientLight: "#b8956a",
  gradientDark: "#8a6a45",
  title: "#f4ece0",
  message: "#2c2014",
};

const COLOR_DEFAULTS_IDROTTSMASSAGE: { [key in ColorKey]: string } = {
  primary: "#27a18d",
  background: "#000000",
  gradientLight: "#27a18d",
  gradientDark: "#053a31",
  title: "#c7fff6",
  message: "#001d18",
};

type ColorDefaultsTheme = "kiro" | "idrottsmassage";

// Default service text shown on the poster for each theme.
const THEME_MESSAGE: { [key in ColorDefaultsTheme]: string } = {
  kiro: "Kiropraktisk behandling",
  idrottsmassage: "Idrottsmassage",
};

const THEME_COLORS: { [key in ColorDefaultsTheme]: { [k in ColorKey]: string } } =
  {
    kiro: COLOR_DEFAULTS_KIRO,
    idrottsmassage: COLOR_DEFAULTS_IDROTTSMASSAGE,
  };

type Colors = Record<ColorKey, string>;

// --- Colour math (hex <-> HSV) for the gradient wheel ----------------------
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/**
 * Gradient colour wheel: hue around the circle, saturation toward the centre,
 * with a brightness slider beneath so dark/light colours are reachable too.
 */
function ColorWheel({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const SIZE = 220;
  const radius = SIZE / 2;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHex = useRef(value);
  const [hsv, setHsv] = useState(() => rgbToHsv(...hexToRgb(value)));

  // Sync internal HSV when the colour is changed from outside (e.g. reset).
  useEffect(() => {
    if (value.toLowerCase() !== lastHex.current.toLowerCase()) {
      lastHex.current = value;
      setHsv(rgbToHsv(...hexToRgb(value)));
    }
  }, [value]);

  // Draw the wheel once: hue wedges + a white radial overlay for saturation.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    for (let a = 0; a < 360; a++) {
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(
        radius,
        radius,
        radius,
        ((a - 0.5) * Math.PI) / 180,
        ((a + 1.5) * Math.PI) / 180,
      );
      ctx.closePath();
      ctx.fillStyle = `hsl(${a}, 100%, 50%)`;
      ctx.fill();
    }
    const g = ctx.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius,
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();
  }, [radius]);

  const emit = (next: { h: number; s: number; v: number }) => {
    setHsv(next);
    const hex = rgbToHex(...hsvToRgb(next.h, next.s, next.v));
    lastHex.current = hex;
    onChange(hex);
  };

  const pick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const dx = (clientX - rect.left) * scale - radius;
    const dy = (clientY - rect.top) * scale - radius;
    let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (ang < 0) ang += 360;
    const dist = Math.min(Math.hypot(dx, dy), radius);
    emit({ h: ang, s: dist / radius, v: hsv.v });
  };

  // Marker position (hue angle + saturation radius).
  const markRad = (hsv.h * Math.PI) / 180;
  const mr = hsv.s * radius;
  const mx = radius + mr * Math.cos(markRad);
  const my = radius + mr * Math.sin(markRad);
  const fullBright = rgbToHex(...hsvToRgb(hsv.h, hsv.s, 1));

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative touch-none"
        style={{ width: SIZE, height: SIZE }}
      >
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="rounded-full cursor-crosshair"
          style={{ width: SIZE, height: SIZE }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pick(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.buttons) pick(e.clientX, e.clientY);
          }}
        />
        <span
          className="pointer-events-none absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            left: mx,
            top: my,
            background: value,
            boxShadow: "0 0 0 1px rgba(0,0,0,.5)",
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(hsv.v * 100)}
        onChange={(e) => emit({ ...hsv, v: Number(e.target.value) / 100 })}
        className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(to right, #000, ${fullBright})` }}
      />
    </div>
  );
}

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
  mode: QrMode;
  allowTip: boolean;
}

// Which scanner the QR targets:
//  - "swish":  Type C string, read by the Swish app's own in-app scanner.
//  - "camera": "swish://" deep link, opened by a phone's native camera.
// A single QR can only be one of these (see the two builders below).
type QrMode = "swish" | "camera";

/**
 * Swish "Type C" QR string that the Swish app's own scanner reads:
 *   C<number>;<amount>;<message>;<editable bitmask>
 * Bitmask bits: 1 = number editable, 2 = amount editable, 4 = message editable.
 */
function swishTypeC(
  amount: number,
  message: string,
  swishNumber: string,
  allowTip: boolean,
) {
  const number = swishNumber.replace(/\D/g, "");
  // Semicolons separate fields, so they can't appear inside the message; Swish
  // also caps the message at 50 characters.
  const msg = message.replace(/;/g, " ").slice(0, 50);
  const amountField = amount > 0 ? String(amount) : "";
  // Make the amount editable when tips are allowed, or when no amount is set
  // (Swish needs the payer to enter one). Otherwise lock everything.
  const amountEditable = allowTip || amount <= 0;
  const editable = amountEditable ? 0b010 : 0;
  return `C${number};${amountField};${msg};${editable}`;
}

/**
 * "swish://payment?data=..." deep link. A phone's native camera follows the
 * URL scheme into the Swish app; the Swish app's own scanner does NOT read it.
 */
function swishDeepLink(
  amount: number,
  message: string,
  swishNumber: string,
  allowTip: boolean,
) {
  const payload = {
    version: 1,
    payee: { value: swishNumber.replace(/\D/g, "") },
    amount: { value: amount, editable: allowTip || amount <= 0 },
    message: { value: message },
  };
  return "swish://payment?data=" + encodeURIComponent(JSON.stringify(payload));
}

function swishQrData(
  mode: QrMode,
  amount: number,
  message: string,
  swishNumber: string,
  allowTip: boolean,
) {
  return mode === "camera"
    ? swishDeepLink(amount, message, swishNumber, allowTip)
    : swishTypeC(amount, message, swishNumber, allowTip);
}

/**
 * Render just the QR tile — diamond modules, rounded finders and the centre
 * Swish logo on a circular backplate. Used both inside the poster and on its
 * own for the landscape "scan me" view.
 */
async function buildQrTile(
  data: string,
  colors: Colors,
): Promise<HTMLCanvasElement> {
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

  return qrCanvas;
}

/** Standalone QR tile (used for the large landscape "scan me" view). */
async function renderQrOnly(opts: PosterOptions): Promise<string> {
  const { amount, message, swishNumber, colors, mode, allowTip } = opts;
  const data = swishQrData(mode, amount, message, swishNumber, allowTip);
  const tile = await buildQrTile(data, colors);
  return tile.toDataURL("image/png");
}

async function renderPoster(opts: PosterOptions): Promise<string> {
  const { amount, message, swishNumber, colors, mode, allowTip } = opts;
  const data = swishQrData(mode, amount, message, swishNumber, allowTip);
  const displayNumber = formatSwishNumber(swishNumber);
  const qrCanvas = await buildQrTile(data, colors);

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
  const [colorTheme, setColorTheme] = useState<ColorDefaultsTheme>("kiro");

  const COLOR_FIELDS: { key: ColorKey; label: string; default: string }[] = [
    {
      key: "primary",
      label: "Primär (QR & ram)",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.primary
          : COLOR_DEFAULTS_IDROTTSMASSAGE.primary,
    },
    {
      key: "background",
      label: "Bakgrund",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.background
          : COLOR_DEFAULTS_IDROTTSMASSAGE.background,
    },
    {
      key: "gradientLight",
      label: "Gradient ljus",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.gradientLight
          : COLOR_DEFAULTS_IDROTTSMASSAGE.gradientLight,
    },
    {
      key: "gradientDark",
      label: "Gradient mörk",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.gradientDark
          : COLOR_DEFAULTS_IDROTTSMASSAGE.gradientDark,
    },
    {
      key: "title",
      label: "Titel & namn",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.title
          : COLOR_DEFAULTS_IDROTTSMASSAGE.title,
    },
    {
      key: "message",
      label: "Meddelandetext",
      default:
        colorTheme === "kiro"
          ? COLOR_DEFAULTS_KIRO.message
          : COLOR_DEFAULTS_IDROTTSMASSAGE.message,
    },
  ];

  const DEFAULT_COLORS: Colors = COLOR_FIELDS.reduce((acc, f) => {
    acc[f.key] = f.default;
    return acc;
  }, {} as Colors);

  const [amount, setAmount] = useState("750");
  const [message, setMessage] = useState(THEME_MESSAGE.kiro);
  const [colors, setColors] = useState<Colors>(DEFAULT_COLORS);
  const [mode, setMode] = useState<QrMode>("swish");
  const [allowTip, setAllowTip] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [qrOnlyUrl, setQrOnlyUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [activeColor, setActiveColor] = useState<ColorKey | null>(null);

  const setColor = (key: ColorKey, value: string) =>
    setColors((prev) => ({ ...prev, [key]: value }));

  // Switch theme and apply its colours + service text (overwrites any tweaks).
  const applyTheme = (theme: ColorDefaultsTheme) => {
    setColorTheme(theme);
    setColors({ ...THEME_COLORS[theme] });
    setMessage(THEME_MESSAGE[theme]);
  };

  // The "fullscreen" view is just an in-page overlay covering the viewport —
  // we don't request real device fullscreen (it was janky across browsers and
  // iOS Safari blocks it anyway).
  const openFullscreen = () => setFullscreen(true);
  const closeFullscreen = () => setFullscreen(false);

  // Track landscape orientation — used to show just the big QR for scanning.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const update = () => setIsLandscape(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Live preview — re-render (debounced) whenever an input or colour changes.
  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);
    const t = setTimeout(async () => {
      try {
        const opts = {
          amount: Number(amount) || 0,
          message: message.trim(),
          swishNumber: DEFAULT_SWISH_NUMBER,
          colors,
          mode,
          allowTip,
        };
        const [poster, qrOnly] = await Promise.all([
          renderPoster(opts),
          renderQrOnly(opts),
        ]);
        if (!cancelled) {
          setImageUrl(poster);
          setQrOnlyUrl(qrOnly);
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
  }, [amount, message, colors, mode, allowTip]);

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

  // After "Generera QR", in landscape: show nothing but a big QR for scanning.
  if (generated && isLandscape && qrOnlyUrl) {
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black p-4">
        <img
          src={qrOnlyUrl}
          alt="Swish QR-kod"
          className="h-full max-h-full w-auto max-w-full object-contain"
        />
      </div>
    );
  }

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

            {/* QR-typ: vem som ska kunna skanna koden */}
            <p className="text-sm font-semibold text-neutral-200 mb-3">
              QR-typ
            </p>
            <div className="mb-2 grid grid-cols-2 gap-3">
              {(
                [
                  { key: "swish", label: "Swish-appen" },
                  { key: "camera", label: "Mobilkamera" },
                ] as { key: QrMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    mode === m.key
                      ? "border-primary bg-primary text-black"
                      : "border-primary bg-[#161616] text-neutral-200 hover:bg-[#1f1f1f]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mb-6 text-xs leading-snug text-neutral-500">
              {mode === "swish"
                ? "Skannas inifrån Swish-appen (”Skanna QR-kod”). Så fungerar officiella Swish-koder."
                : "Öppnas med mobilens vanliga kamera, som föreslår att öppna Swish-appen."}
            </p>

            {/* Dricks: gör beloppet redigerbart så kunden kan lägga till dricks */}
            <button
              type="button"
              onClick={() => setAllowTip((v) => !v)}
              className="mb-6 flex w-full items-center justify-between rounded-xl bg-[#161616] border border-primary px-4 py-3 text-left transition hover:bg-[#1f1f1f]"
            >
              <span className="text-sm text-neutral-200">
                Tillåt dricks
                <span className="block text-xs text-neutral-500">
                  Kunden kan ändra beloppet i appen
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  allowTip ? "bg-primary" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    allowTip ? "left-5.5" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            {/* Färgtema */}
            <p className="text-sm font-semibold text-neutral-200 mb-3">
              Färgtema
            </p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {(
                [
                  { key: "kiro", label: "Kiro" },
                  { key: "idrottsmassage", label: "Idrottsmassage" },
                ] as { key: ColorDefaultsTheme; label: string }[]
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTheme(t.key)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    colorTheme === t.key
                      ? "border-primary bg-primary text-black"
                      : "border-primary bg-[#161616] text-neutral-200 hover:bg-[#1f1f1f]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Färger */}
            <p className="text-sm font-semibold text-neutral-200 mb-3">
              Färger
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              {COLOR_FIELDS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveColor(f.key)}
                  className="flex items-center gap-3 rounded-xl bg-[#161616] border border-primary px-3 py-2 text-left transition hover:bg-[#1f1f1f]"
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border border-white/20"
                    style={{ background: colors[f.key] }}
                  />
                  <span className="text-xs text-neutral-300 leading-tight">
                    {f.label}
                  </span>
                </button>
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
                onClick={openFullscreen}
                className="w-72 rounded-xl  cursor-zoom-in"
              />
            )}
            <div className="mt-7 flex w-full gap-3">
              <button
                onClick={openFullscreen}
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
          onClick={closeFullscreen}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        >
          <img
            src={imageUrl}
            alt="QR-affisch"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      {/* Colour picker (gradient wheel) */}
      {activeColor && (
        <div
          onClick={() => setActiveColor(null)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-primary bg-[#161616] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-100">
                {COLOR_FIELDS.find((f) => f.key === activeColor)?.label}
              </span>
              <button
                type="button"
                onClick={() => setActiveColor(null)}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-black transition hover:opacity-90"
              >
                Klar
              </button>
            </div>

            <ColorWheel
              value={colors[activeColor]}
              onChange={(hex) => setColor(activeColor, hex)}
            />

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-7 w-7 rounded-md border border-white/20"
                  style={{ background: colors[activeColor] }}
                />
                <span className="font-mono text-xs uppercase text-neutral-300">
                  {colors[activeColor]}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setColor(activeColor, DEFAULT_COLORS[activeColor])
                }
                disabled={
                  colors[activeColor].toLowerCase() ===
                  DEFAULT_COLORS[activeColor].toLowerCase()
                }
                className="rounded-lg border border-primary px-4 py-1.5 text-sm font-semibold text-neutral-200 transition hover:bg-[#1f1f1f] disabled:opacity-40"
              >
                Återställ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;
