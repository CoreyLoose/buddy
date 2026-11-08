// One-off generator: rasterizes the app star icon (SVG) into the PNG sizes a
// PWA needs, using the Chromium that ships with Playwright. Re-run if the icon
// design changes: `node scripts/gen-pwa-icons.mjs`.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
mkdirSync(publicDir, { recursive: true });

// Build a centered 5-point star path (point up) within the 512 canvas.
function starPath(cx, cy, outer, inner, points = 5) {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + i * step;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d + 'Z';
}

const star = starPath(256, 256, 150, 60);

function svg(size, { rounded }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 96 : 0}" fill="url(#g)"/>
  <path d="${star}" fill="#ffffff"/>
</svg>`;
}

// favicon + source icon (rounded corners look nice in a browser tab / app list)
writeFileSync(join(publicDir, 'favicon.svg'), svg(512, { rounded: true }));
writeFileSync(join(publicDir, 'icon.svg'), svg(512, { rounded: true }));

const targets = [
  { name: 'pwa-192x192.png', size: 192, rounded: true },
  { name: 'pwa-512x512.png', size: 512, rounded: true },
  // Maskable: full-bleed background (the OS applies its own mask/rounding).
  { name: 'maskable-icon-512x512.png', size: 512, rounded: false },
  { name: 'apple-touch-icon.png', size: 180, rounded: true },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<!doctype html><style>*{margin:0;padding:0}</style>${svg(t.size, { rounded: t.rounded })}`,
  );
  const el = await page.locator('svg');
  await el.screenshot({ path: join(publicDir, t.name), omitBackground: true });
  console.log('wrote', t.name, `${t.size}x${t.size}`);
}
await browser.close();
