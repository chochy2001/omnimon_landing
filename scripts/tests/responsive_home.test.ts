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
  for (let attempt = 0; attempt < 100; attempt += 1) {
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
});

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
});

test('home fits narrow and desktop viewports without document overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    const response = await page.goto(origin, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 812 });
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(width);
    }
  } finally {
    await page.close();
  }
});
