import { describe, expect, test } from 'bun:test';
import { resolveInitialTheme } from './theme';

describe('resolveInitialTheme', () => {
  test('stored light or dark always wins', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  test('falls back to the operating-system preference', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
    expect(resolveInitialTheme('nonsense', true)).toBe('dark');
    expect(resolveInitialTheme(undefined, false)).toBe('light');
  });
});
