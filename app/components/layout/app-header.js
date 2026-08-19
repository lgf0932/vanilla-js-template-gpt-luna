import '../ui/ui-button.js';
import '../ui/ui-icon.js';
import '../ui/ui-theme-switch.js';
import { NovaElement, defineOnce, escapeHtml } from '../ui/base.js';

class AppHeader extends NovaElement {
  connectedCallback() {
    this.render();
  }

  setContext({ title = '工作台', publicMode = false, theme = 'system' } = {}) {
    this.title = title;
    this.publicMode = publicMode;
    this.theme = theme;
    this.render();
  }

  render() {
    const title = this.title || '工作台';
    const publicMode = Boolean(this.publicMode);
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; z-index: var(--z-header); inset: var(--spacing-0) var(--spacing-0) auto; display: block; height: var(--header-height); overflow: hidden; border-bottom: var(--border-width) solid hsl(var(--border)); background: hsl(var(--background) / 0.92); color: hsl(var(--foreground)); backdrop-filter: blur(var(--spacing-2)); }
        header { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 var(--spacing-5); }
        .left, .right { display: flex; align-items: center; gap: var(--spacing-3); min-width: var(--spacing-0); }
        .title { font-size: var(--font-size-sm); font-weight: 700; }
        .crumb { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .menu { display: none; }
        .logout { display: ${publicMode ? 'none' : 'inline-flex'}; }
        @media (max-width: 40rem) { header { padding-inline: var(--spacing-4); } .menu { display: inline-flex; } .crumb { display: none; } }
      </style>
      <header><div class="left"><ui-button class="menu" variant="ghost" size="sm" aria-label="打开菜单"><ui-icon name="menu"></ui-icon></ui-button><span class="crumb">Nova /</span><span class="title">${escapeHtml(title)}</span></div><div class="right"><ui-theme-switch value="${escapeHtml(this.theme || 'system')}"></ui-theme-switch><ui-button class="logout" variant="ghost" size="sm"><ui-icon name="logout"></ui-icon><span>退出</span></ui-button></div></header>
    `;
    this.shadowRoot.querySelector('.menu')?.addEventListener('click', () => this.emit('sidebar-open'));
    this.shadowRoot.querySelector('.logout')?.addEventListener('click', () => this.emit('logout'));
    this.shadowRoot.querySelector('ui-theme-switch')?.addEventListener('theme-change', (event) => this.emit('theme-change', event.detail));
  }
}

defineOnce('app-header', AppHeader);
export { AppHeader };
