/**
 * PACER Theme System
 * Campus-wide theme engine for JPG Ventures / FleetFlow / PACER
 * One toggle. Entire campus changes.
 *
 * Usage:
 *   <script src="pacer-theme.js"></script>
 *   Call PACERTheme.init() on page load.
 *   Call PACERTheme.toggle() from any button.
 *   Call PACERTheme.get() to read current theme ('light' | 'dark').
 */

const PACERTheme = (() => {
  const KEY        = 'pacer-theme';
  const ATTR       = 'data-theme';
  const ROOT       = document.documentElement;
  const STORAGE    = window.localStorage;

  function systemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function saved() {
    try { return STORAGE.getItem(KEY); } catch(e) { return null; }
  }

  function save(theme) {
    try { STORAGE.setItem(KEY, theme); } catch(e) {}
  }

  function apply(theme) {
    ROOT.setAttribute(ATTR, theme);
    // Update any registered toggle buttons on the page
    document.querySelectorAll('[data-pacer-toggle]').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀ Light' : '◑ Dark';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    // Dispatch event so rooms can react individually if needed
    window.dispatchEvent(new CustomEvent('pacer-theme-change', { detail: { theme } }));
  }

  function init() {
    const theme = saved() || systemPreference();
    apply(theme);

    // Watch for system preference change (e.g. user switches OS dark/light)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only follow system if user hasn't manually chosen
      if (!saved()) apply(e.matches ? 'dark' : 'light');
    });
  }

  function toggle() {
    const current = ROOT.getAttribute(ATTR) || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    save(next);
    apply(next);
    return next;
  }

  function get() {
    return ROOT.getAttribute(ATTR) || 'light';
  }

  function set(theme) {
    save(theme);
    apply(theme);
  }

  return { init, toggle, get, set };
})();

// Auto-init on script load
PACERTheme.init();
