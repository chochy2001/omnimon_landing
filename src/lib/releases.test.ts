import { describe, expect, test } from 'bun:test';
import { OMNIMON_VERSION, RELEASE_DATE, RELEASE_DATE_ES } from '../consts';
import {
  buildReleaseSlug,
  latestReleasePost,
  latestReleasePostEs,
} from './releases';

describe('release metadata', () => {
  test('builds locale-aware release slugs from the central version', () => {
    expect(buildReleaseSlug(OMNIMON_VERSION)).toBe('v6-7-0-release');
    expect(buildReleaseSlug(OMNIMON_VERSION, 'es')).toBe('v6-7-0-release-es');
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
});
