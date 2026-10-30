import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// The OmniMon app repository moved from chochy2001/omnimon to CAPDESIS/omnimon.
// Links to the old owner only work while GitHub keeps the transfer redirect, so
// the served pages must point at the new owner directly.
//
// The Homebrew tap is a different repository that did NOT move:
// `brew tap chochy2001/omnimon` resolves to github.com/chochy2001/homebrew-omnimon
// (CAPDESIS/homebrew-omnimon does not exist), so that command must stay as is.
//
// This reads the BUILT site (dist/), not the sources, so it also sees links that
// come from the shared layout. CI runs `bun run build` before `bun run test`.

const distDir = join(import.meta.dir, '..', '..', 'dist');

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name.endsWith('.html')) out.push(path);
  }
  return out.sort();
}

// github.com/chochy2001/omnimon or raw.githubusercontent.com/chochy2001/omnimon,
// but not the landing repository itself (chochy2001/omnimon_landing).
const OLD_OWNER_LINK = /(?:github\.com|githubusercontent\.com)\/chochy2001\/omnimon(?![\w-])/g;
const NEW_OWNER_LINK = /(?:github\.com|githubusercontent\.com)\/CAPDESIS\/omnimon(?![\w-])/g;

describe('served pages link the OmniMon repository at its current owner', () => {
  test('the site has been built', () => {
    expect(
      existsSync(join(distDir, 'index.html')),
      'dist/index.html is missing: run `bun run build` before this test',
    ).toBe(true);
  });

  const pages = existsSync(distDir) ? htmlFiles(distDir) : [];

  test('no served page links the repository at its old owner', () => {
    expect(pages.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const page of pages) {
      const html = readFileSync(page, 'utf8');
      for (const match of html.matchAll(OLD_OWNER_LINK)) {
        offenders.push(`${relative(distDir, page)}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('the home page and release posts do link the repository at CAPDESIS', () => {
    const home = readFileSync(join(distDir, 'index.html'), 'utf8');
    expect(home).toContain('https://github.com/CAPDESIS/omnimon/releases/latest');
    expect(home).toContain('https://github.com/CAPDESIS/omnimon#readme');
    expect(home).toContain(
      'https://raw.githubusercontent.com/CAPDESIS/omnimon/main/scripts/install-web.sh',
    );
    const linked = pages.filter((page) => readFileSync(page, 'utf8').match(NEW_OWNER_LINK));
    // Home (en, es), every blog release post, and every page that uses the
    // shared layout header. A floor, not an equality, so new pages do not break it.
    expect(linked.length).toBeGreaterThanOrEqual(10);
  });

  test('the Homebrew tap command keeps the tap owner that actually exists', () => {
    const withTap = pages.filter((page) => readFileSync(page, 'utf8').includes('brew tap '));
    expect(withTap.length).toBeGreaterThan(0);
    for (const page of withTap) {
      const html = readFileSync(page, 'utf8');
      expect(html, relative(distDir, page)).toContain('brew tap chochy2001/omnimon');
      expect(html, relative(distDir, page)).not.toContain('brew tap CAPDESIS/omnimon');
    }
  });
});
