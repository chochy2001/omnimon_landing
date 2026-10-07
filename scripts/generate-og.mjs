/**
 * Build-time OG image generator for omnimon.com.mx.
 * Produces public/og.png at 1200x630 (replaces omnimon-screenshot.png as OG source).
 * Run via `bun run generate:og` (called from build in package.json).
 *
 * Design: dark #060a14 background (matches site theme), white headline,
 * accent color #00b4d8 (OmniMon brand cyan).
 * Uses sharp's built-in SVG rasterizer (librsvg via libvips).
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

const W = 1200;
const H = 630;
const BG = '#060a14';
const ACCENT = '#00b4d8';
const WHITE = '#FFFFFF';
const SUBTEXT = '#94a3b8';

// Read favicon-32.png as logo stand-in — small but crisp at OG scale
let logoDataUri = '';
try {
  const logoPath = resolve(publicDir, 'favicon-32.png');
  const logoBytes = readFileSync(logoPath);
  const logoResized = await sharp(logoBytes)
    .resize(120, 120, { fit: 'contain', background: { r: 6, g: 10, b: 20, alpha: 0 } })
    .png()
    .toBuffer();
  logoDataUri = `data:image/png;base64,${logoResized.toString('base64')}`;
} catch {
  // graceful degradation
}

const logoEl = logoDataUri
  ? `<image href="${logoDataUri}" x="100" y="215" width="120" height="120" />`
  : '';
const textX = logoDataUri ? '260' : '100';

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}" />

  <!-- Accent gradient bar at bottom -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="${ACCENT}" />

  <!-- Logo icon -->
  ${logoEl}

  <!-- Product name -->
  <text x="${textX}" y="260"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="80" font-weight="700" fill="${WHITE}"
        letter-spacing="-2">OmniMon</text>

  <!-- Tagline -->
  <text x="${textX}" y="320"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="34" fill="${ACCENT}">macOS System Monitor</text>

  <!-- Divider -->
  <rect x="${textX}" y="345" width="520" height="2" fill="${ACCENT}" rx="1" opacity="0.5" />

  <!-- Domain -->
  <text x="${textX}" y="400"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="28" fill="${SUBTEXT}">omnimon.com.mx</text>
</svg>`;

const outPath = resolve(publicDir, 'og.png');
await sharp(Buffer.from(svg))
  .resize(W, H)
  .png({ compressionLevel: 9 })
  .toFile(outPath);
console.log(`Generated ${outPath}`);
console.log('OG image generated successfully.');
