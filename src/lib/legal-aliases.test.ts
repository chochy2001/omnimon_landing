import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Typed /privacidad and /terminos returned 404 while the Spanish pages live
// at /es/privacy/ and /es/terms/ (LEGALS 2026-10-11). Hostinger serves the
// apex, so public/.htaccess must 301 each alias to its single canonical
// page. English /privacy and /terms already resolve to Astro pages.
describe('canonical legal URL aliases', () => {
  const htaccess = readFileSync(join(import.meta.dir, '../../public/.htaccess'), 'utf8');

  test.each([
    ['privacidad', '/es/privacy/'],
    ['terminos', '/es/terms/'],
  ])('/%s 301s to %s', (alias, target) => {
    expect(htaccess).toMatch(
      new RegExp(`RewriteRule\\s+\\^${alias}/\\?\\$\\s+${target.replace(/\//g, '\\/')}\\s+\\[R=301,L\\]`)
    );
  });

  test('keeps the legacy /en home alias and the product 404', () => {
    expect(htaccess).toContain('RewriteRule ^en/?$ / [R=301,L]');
    expect(htaccess).toContain('ErrorDocument 404 /404.html');
  });
});
