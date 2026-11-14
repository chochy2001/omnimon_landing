import { afterAll, beforeAll, expect, test } from 'bun:test';
import { spawn, type Subprocess } from 'bun';
import { chromium } from 'playwright';

let server: Subprocess;
let browser: Awaited<ReturnType<typeof chromium.launch>>;
const port = 4328;
const origin = `http://127.0.0.1:${port}`;

beforeAll(async () => {
  server = spawn({
    cmd: ['bun', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    cwd: process.cwd(),
    stdout: 'ignore',
    stderr: 'ignore',
  });

  let ready = false;
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      const response = await fetch(origin);
      ready = response.ok;
      if (ready) break;
    } catch {
      await Bun.sleep(100);
    }
  }
  if (!ready) throw new Error('Astro preview did not become ready');
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser?.close();
  server?.kill();
  await server?.exited;
  const stopPreview = spawn({
    cmd: ['bun', 'run', 'astro', 'preview', 'stop'],
    cwd: process.cwd(),
    stdout: 'ignore',
    stderr: 'ignore',
  });
  await stopPreview.exited;
}, 30_000);

const ROUTES = ['/', '/es/', '/privacy/', '/es/privacy/', '/blog/', '/404.html'] as const;
const WIDTHS = [320, 390, 768, 1280, 1440, 2560] as const;

test('home fits narrow and desktop viewports without document overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    const response = await page.goto(origin, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 812 });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
    }
  } finally {
    await page.close();
  }
});

test('key routes fit mobile through ultrawide viewports without horizontal overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 812 } });
  try {
    for (const route of ROUTES) {
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
      const expectedStatus = route === '/404.html' ? 404 : 200;
      const status = response?.status();
      expect(status === 200 || status === expectedStatus, `${route} returned ${status}`).toBe(true);

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 812 });
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `${route} at ${width}px`).toBeLessThanOrEqual(clientWidth);
      }
    }
  } finally {
    await page.close();
  }
}, 60_000);
