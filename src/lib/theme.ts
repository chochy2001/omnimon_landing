export type ThemeName = 'light' | 'dark';

export function resolveInitialTheme(
  stored: string | null | undefined,
  prefersDark: boolean,
): ThemeName {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}
