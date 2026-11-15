import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Short content hash of a file in public/, used as a cache-busting query token.
 * The hero screenshots keep fixed file names and the edge caches them for a week,
 * so a replaced capture must change its URL or visitors keep seeing the old one.
 */
export function assetToken(publicPath: string, root: string = process.cwd()): string {
  return createHash('sha256').update(readFileSync(join(root, 'public', publicPath))).digest('hex').slice(0, 10);
}
