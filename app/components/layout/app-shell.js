import './app-sidebar.js';
import './app-header.js';
import './app-main.js';
import { NovaElement, defineOnce } from '../ui/base.js';

class AppShell extends NovaElement {
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; min-height: 100vh; }
        .shell { min-height: 100vh; }
        .content { position: fixed; inset: var(--header-height) var(--spacing-0) var(--spacing-0) var(--sidebar-width); display: flex; min-width: var(--spacing-0); min-height: var(--spacing-0); transition: inset var(--transition-normal); }
        app-main { flex: 1; }
        .public app-main { padding-top: var(--spacing-0); }
        .public .content { inset: var(--header-height) var(--spacing-0) var(--spacing-0); }
        .public app-sidebar { display: none; }
        @media (max-width: 40rem) { .content { inset-inline-start: var(--spacing-0); } }
      </style>
      <div class="shell"><app-sidebar></app-sidebar><app-header></app-header><div class="content"><app-main></app-main></div><ui-toast></ui-toast><ui-dialog></ui-dialog></div>
    `;
    this.mode = 'app';
  }

  configure({ items = [], onNavigate, onLogout, onSidebarOpen, onSidebarClose, onThemeChange } = {}) {
    this.onNavigate = onNavigate;
    this.onLogout = onLogout;
    this.sidebar = this.shadowRoot.querySelector('app-sidebar');
    this.header = this.shadowRoot.querySelector('app-header');
    this.main = this.shadowRoot.querySelector('app-main');
    this.toast = this.shadowRoot.querySelector('ui-toast');
    this.dialog = this.shadowRoot.querySelector('ui-dialog');
    this.sidebar.setItems(items);
    this.sidebar.addEventListener('sidebar-navigate', (event) => onNavigate?.(event.detail.path));
    this.sidebar.addEventListener('sidebar-close', () => onSidebarClose?.());
    this.header.addEventListener('sidebar-open', () => onSidebarOpen?.());
    this.header.addEventListener('logout', () => onLogout?.());
    this.header.addEventListener('theme-change', (event) => onThemeChange?.(event.detail.value));
  }

  setMode(mode) {
    this.mode = mode;
    this.shadowRoot.querySelector('.shell')?.classList.toggle('public', mode === 'public');
    this.header?.setContext({ publicMode: mode === 'public', theme: this.theme || 'system', title: this.title || '工作台' });
  }

  setActivePath(path) {
    this.sidebar?.setActive(path);
  }

  setLoading(loading) {
    this.main?.setLoading(loading);
  }

  mountView(view) {
    this.main?.setView(view);
  }

  setNavigation(items) {
    this.sidebar?.setItems(items);
  }

  setTitle(title) {
    this.title = title;
    this.header?.setContext({ title, publicMode: this.mode === 'public', theme: this.theme || 'system' });
  }

  setTheme(theme) {
    this.theme = theme;
    this.header?.setContext({ title: this.title || '工作台', publicMode: this.mode === 'public', theme });
  }

  showToast(message, type = 'default') {
    this.toast?.show(message, type);
  }

  showError(error) {
    this.main?.showError(error);
  }
}

defineOnce('app-shell', AppShell);
export { AppShell };
