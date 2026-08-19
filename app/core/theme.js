const THEME_KEY = 'nova.theme';

function readLocalTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}

function systemTheme() {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(mode) {
  const value = ['system', 'light', 'dark'].includes(mode) ? mode : 'system';
  const resolved = value === 'system' ? systemTheme() : value;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = value;
  try { localStorage.setItem(THEME_KEY, value); } catch {}
  return { mode: value, resolved };
}

export function getThemeMode() {
  return document.documentElement.dataset.themeMode || readLocalTheme();
}

export function initTheme() {
  const mode = readLocalTheme();
  const result = applyTheme(mode);
  const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  media?.addEventListener?.('change', () => { if (getThemeMode() === 'system') applyTheme('system'); });
  return result;
}
