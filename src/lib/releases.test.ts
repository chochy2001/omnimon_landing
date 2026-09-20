import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { OMNIMON_VERSION, RELEASE_DATE, RELEASE_DATE_ES } from '../consts';
import {
  buildReleaseSlug,
  latestReleasePost,
  latestReleasePostEs,
  publishedPosts,
} from './releases';

describe('release metadata', () => {
  test('builds locale-aware release slugs from the central version', () => {
    expect(buildReleaseSlug(OMNIMON_VERSION)).toBe(
      `v${OMNIMON_VERSION.replaceAll('.', '-')}-release`,
    );
    expect(buildReleaseSlug(OMNIMON_VERSION, 'es')).toBe(
      `v${OMNIMON_VERSION.replaceAll('.', '-')}-release-es`,
    );
  });

  test('keeps english blog metadata aligned with src/consts.ts', () => {
    expect(latestReleasePost.slug).toBe(buildReleaseSlug(OMNIMON_VERSION));
    expect(latestReleasePost.title).toContain(`v${OMNIMON_VERSION}`);
    expect(latestReleasePost.date).toBe(RELEASE_DATE);
  });

  test('keeps spanish blog metadata aligned with src/consts.ts', () => {
    expect(latestReleasePostEs.slug).toBe(buildReleaseSlug(OMNIMON_VERSION, 'es'));
    expect(latestReleasePostEs.title).toContain(`v${OMNIMON_VERSION}`);
    expect(latestReleasePostEs.date).toBe(RELEASE_DATE_ES);
  });

  test('blog indexes only list posts that have pages', () => {
    const pages = join(import.meta.dir, '../pages');
    for (const post of publishedPosts('en')) {
      expect(existsSync(join(pages, 'blog', `${post.slug}.astro`))).toBe(true);
    }
    for (const post of publishedPosts('es')) {
      expect(existsSync(join(pages, 'es/blog', `${post.slug}.astro`))).toBe(true);
    }
    expect(publishedPosts('en').map((post) => post.slug)).toEqual([
      'v6-8-0-release',
      'v6-7-0-release',
      'v6-6-0-release',
      'v6-5-0-release',
      'v6-4-1-release',
    ]);
    expect(publishedPosts('es').map((post) => post.slug)).toEqual([
      'v6-8-0-release-es',
      'v6-7-0-release-es',
      'v6-6-0-release-es',
      'v6-5-0-release-es',
      'v6-4-1-release-es',
    ]);
  });
});
