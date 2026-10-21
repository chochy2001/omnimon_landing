// Regression guards for the legal footer, cookie consent and keyboard/a11y
// contracts. Runs against the built site served by `astro preview`, so it
// checks what is actually rendered, not the source.
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn, type Subprocess } from 'bun';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

let server: Subprocess;
let browser: Browser;
const port = 4329;
const origin = `http://127.0.0.1:${port}`;
const axeSource = readFileSync(fileURLToPath(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url)), 'utf8');

// Hosts that only analytics or ad tags use. Nothing from this list may be
// requested before the visitor chooses, and the repo must not add one ungated.
const ANALYTICS_HOSTS = [/posthog\.com/, /googletagmanager\.com/, /google-analytics\.com/, /doubleclick\.net/, /connect\.facebook\.net/, /clarity\.ms/, /hotjar/];

const LEGAL = {
  es: { privacy: '/es/privacy', terms: '/es/terms', cookies: '/es/cookies', skip: 'Saltar al contenido' },
  en: { privacy: '/privacy', terms: '/terms', cookies: '/cookies', skip: 'Skip to content' },
};

describe('legal footer, cookie consent and a11y guards', () => {
beforeAll(async () => {
  // astro preview runs as a detached daemon: clear any leftover one first.
  await spawn({ cmd: ['bun', 'run', 'astro', 'preview', 'stop'], cwd: process.cwd(), stdout: 'ignore', stderr: 'ignore' }).exited;
  server = spawn({
    cmd: ['bun', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    cwd: process.cwd(),
    stdout: 'ignore',
    stderr: 'ignore',
  });
  let ready = false;
  for (let attempt = 0; attempt < 300 && !ready; attempt += 1) {
    try {
      ready = (await fetch(origin)).ok;
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
  await spawn({ cmd: ['bun', 'run', 'astro', 'preview', 'stop'], cwd: process.cwd(), stdout: 'ignore', stderr: 'ignore' }).exited;
}, 30_000);

async function newPage(opts: { width?: number; theme?: 'light' | 'dark'; consent?: boolean } = {}) {
  const context: BrowserContext = await browser.newContext({ viewport: { width: opts.width ?? 1280, height: 800 } });
  await context.addInitScript(
    ({ theme, consent }) => {
      try {
        localStorage.setItem('omnimon-theme', theme);
        if (consent) {
          localStorage.setItem('omnimon-cookie-consent', JSON.stringify({ accepted: true, timestamp: Date.now(), version: 1 }));
        }
      } catch {
        // storage blocked: the test still exercises the page without a stored choice
      }
    },
    { theme: opts.theme ?? 'light', consent: opts.consent ?? false },
  );
  const page: Page = await context.newPage();
  return { context, page };
}

test('footer links to privacy, terms and cookies on every route, in both languages', async () => {
  for (const path of ['/es/', '/', LEGAL.es.privacy, LEGAL.en.privacy]) {
    const { context, page } = await newPage();
    try {
      await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
      const lang = path.startsWith('/es') ? 'es' : 'en';
      for (const key of ['privacy', 'terms', 'cookies'] as const) {
        const count = await page.locator(`footer a[href="${LEGAL[lang][key]}"]`).count();
        expect(count, `${path} footer must link ${LEGAL[lang][key]}`).toBeGreaterThan(0);
      }
    } finally {
      await context.close();
    }
  }
});

test('skip link is the first tab stop and its target exists', async () => {
  for (const lang of ['es', 'en'] as const) {
    const { context, page } = await newPage();
    try {
      await page.goto(`${origin}${lang === 'es' ? '/es/' : '/'}`, { waitUntil: 'domcontentloaded' });
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLAnchorElement | null;
        return { text: el?.textContent?.trim() ?? '', href: el?.getAttribute('href') ?? '' };
      });
      expect(focused.text).toBe(LEGAL[lang].skip);
      expect(focused.href).toBe('#main-content');
      expect(await page.locator('#main-content').count()).toBe(1);
    } finally {
      await context.close();
    }
  }
});

test('code blocks that can scroll at 360px are keyboard reachable', async () => {
  const { context, page } = await newPage({ width: 360 });
  try {
    for (const path of ['/es/', '/']) {
      await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
      const tabindexes = await page.$$eval('pre', (els) => els.map((el) => el.getAttribute('tabindex')));
      expect(tabindexes.length).toBeGreaterThan(0);
      for (const value of tabindexes) expect(value).toBe('0');
    }
  } finally {
    await context.close();
  }
});

test('visitor can reopen cookie preferences from the footer after choosing', async () => {
  const { context, page } = await newPage({ consent: true });
  try {
    await page.goto(`${origin}/es/`, { waitUntil: 'domcontentloaded' });
    expect(await page.locator('[data-omnimon-cookie-banner]').isVisible()).toBe(false);
    await page.locator('footer [data-omnimon-cookie-reopen]').click();
    expect(await page.locator('[data-omnimon-cookie-banner]').isVisible()).toBe(true);
    expect(await page.locator('[data-omnimon-cookie-prefs]').isVisible()).toBe(true);
    expect(await page.locator('[data-omnimon-prefs-analytics]').isVisible()).toBe(true);
  } finally {
    await context.close();
  }
});

test('no analytics host is contacted before the visitor chooses', async () => {
  const { context, page } = await newPage();
  try {
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));
    await page.goto(`${origin}/es/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const offending = requested.filter((url) => ANALYTICS_HOSTS.some((re) => re.test(url)));
    expect(offending).toEqual([]);
  } finally {
    await context.close();
  }
});

test('key routes have no serious or critical axe violations in light and dark at 360px', async () => {
  for (const theme of ['light', 'dark'] as const) {
    const { context, page } = await newPage({ width: 360, theme });
    try {
      for (const path of ['/es/', '/', LEGAL.es.privacy]) {
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
        await page.addScriptTag({ content: axeSource });
        const serious = await page.evaluate(async () => {
          const axe = (window as unknown as { axe: { run: (c: Document, o: object) => Promise<{ violations: Array<{ id: string; impact: string | null; nodes: unknown[] }> }> } }).axe;
          const result = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
          return result.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .map((v) => `${v.id}:${v.impact}:${v.nodes.length}`);
        });
        expect(serious, `${theme} ${path}`).toEqual([]);
      }
    } finally {
      await context.close();
    }
  }
});
});
