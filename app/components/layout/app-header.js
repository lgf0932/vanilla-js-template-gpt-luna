import '../ui/ui-button.js';
import '../ui/ui-icon.js';
import '../ui/ui-select.js';
import '../ui/ui-theme-switch.js';
import { NovaElement, defineOnce, escapeHtml } from '../ui/base.js';

class AppHeader extends NovaElement {
  connectedCallback() {
    this.render();
  }

  setContext({ title = '工作台', publicMode = false, theme = 'system', language = 'zh-CN', labels = {} } = {}) {
    this.title = title;
    this.publicMode = publicMode;
    this.theme = theme;
    this.language = language;
    this.labels = labels;
    this.render();
  }

  render() {
    const title = this.title || '工作台';
    const publicMode = Boolean(this.publicMode);
    const labels = this.labels || {};
    const languageOptions = labels.languageOptions || [
      { value: 'zh-CN', label: '简体中文' },
      { value: 'zh-TW', label: '繁體中文' },
      { value: 'en', label: 'English' },
    ];
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; z-index: var(--z-header); inset: var(--spacing-0) var(--spacing-0) auto; display: block; height: var(--header-height); overflow: hidden; border-bottom: var(--border-width) solid hsl(var(--border)); background: hsl(var(--background) / 0.92); color: hsl(var(--foreground)); backdrop-filter: blur(var(--spacing-2)); }
        header { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 var(--spacing-5); }
        .left, .right { display: flex; align-items: center; gap: var(--spacing-3); min-width: var(--spacing-0); }
        .title { font-size: var(--font-size-sm); font-weight: 700; }
        .crumb { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .menu { display: none; }
        .language { width: var(--language-control-width); }
        .logout { display: ${publicMode ? 'none' : 'inline-flex'}; }
        @media (max-width: 40rem) { header { padding-inline: var(--spacing-4); } .menu { display: inline-flex; } .crumb { display: none; } .language { width: var(--language-control-width); } }
      </style>
      <header><div class="left"><ui-button class="menu" variant="ghost" size="sm" aria-label="${escapeHtml(labels.menu || '打开菜单')}"><ui-icon name="menu"></ui-icon></ui-button><span class="crumb">Nova /</span><span class="title">${escapeHtml(title)}</span></div><div class="right"><ui-select class="language" aria-label="${escapeHtml(labels.languageLabel || '语言')}"></ui-select><ui-theme-switch value="${escapeHtml(this.theme || 'system')}"></ui-theme-switch><ui-button class="logout" variant="ghost" size="sm"><ui-icon name="logout"></ui-icon><span>${escapeHtml(labels.logout || '退出')}</span></ui-button></div></header>
    `;
    const language = this.shadowRoot.querySelector('.language');
    if (language) {
      language.options = languageOptions;
      language.value = this.language || 'zh-CN';
      language.addEventListener('ui-change', (event) => this.emit('language-change', event.detail));
    }
    const theme = this.shadowRoot.querySelector('ui-theme-switch');
    if (theme) {
      theme.labels = labels.theme;
      theme.addEventListener('theme-change', (event) => this.emit('theme-change', event.detail));
    }
    this.shadowRoot.querySelector('.menu')?.addEventListener('click', () => this.emit('sidebar-open'));
    this.shadowRoot.querySelector('.logout')?.addEventListener('click', () => this.emit('logout'));
  }
}

defineOnce('app-header', AppHeader);
export { AppHeader };
