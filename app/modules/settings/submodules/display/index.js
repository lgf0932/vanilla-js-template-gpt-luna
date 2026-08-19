import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-select.js';
import '../../../../components/ui/ui-theme-switch.js';
import { api } from '../../../../lib/fetcher.js';
import { applyTheme } from '../../../../core/theme.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class DisplayView extends NovaElement {
  async connectedCallback() {
    this.settings = await api.get('/api/settings').catch(() => ({ display: {} }));
    this.render();
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    const display = this.settings?.display || {};
    this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.panel{display:flex;flex-direction:column;gap:var(--spacing-3)}.row{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-3);padding:var(--spacing-3);border:var(--border-width) solid hsl(var(--border));border-radius:var(--radius)}.row strong{display:block;font-size:var(--font-size-sm)}.row span{color:hsl(var(--muted-foreground));font-size:var(--font-size-xs)}@media(max-width:40rem){.row{align-items:flex-start;flex-direction:column}}</style><ui-card><span slot="title">${escapeHtml(t('settingsDisplay.title', '显示与语言'))}</span><span slot="description">${escapeHtml(t('settingsDisplay.description', '选择你喜欢的呈现方式。'))}</span><div class="panel"><div class="row"><div><strong>${escapeHtml(t('settingsDisplay.theme', '主题模式'))}</strong><span>${escapeHtml(t('settingsDisplay.themeHint', '系统、浅色或深色'))}</span></div><ui-theme-switch></ui-theme-switch></div><ui-select class="language" aria-label="${escapeHtml(t('settingsDisplay.language', '语言'))}"></ui-select></div></ui-card>`;
    const theme = this.shadowRoot.querySelector('ui-theme-switch');
    theme.labels = {
      label: t('common.theme.label', '主题模式'),
      system: t('common.theme.system', '系统'),
      light: t('common.theme.light', '浅色'),
      dark: t('common.theme.dark', '深色'),
    };
    theme.value = display.theme || 'system';
    theme.addEventListener('theme-change', async (event) => {
      applyTheme(event.detail.value);
      this.settings = { ...this.settings, display: { ...display, theme: event.detail.value } };
      await api.put('/api/settings', { display: this.settings.display }).catch(() => {});
    });
    const language = this.shadowRoot.querySelector('.language');
    language.options = [
      { value: 'zh-CN', label: t('common.languages.zhCN', '简体中文') },
      { value: 'zh-TW', label: t('common.languages.zhTW', '繁體中文') },
      { value: 'en', label: t('common.languages.en', 'English') },
    ];
    language.value = display.language || this.context?.i18n?.language || 'zh-CN';
    language.addEventListener('ui-change', async (event) => {
      const nextDisplay = { ...display, language: event.detail.value };
      await this.context?.i18n?.setLanguage(event.detail.value);
      this.settings = { ...this.settings, display: nextDisplay };
      await api.put('/api/settings', { display: nextDisplay }).catch(() => {});
    });
  }
}
defineOnce('display-view', DisplayView);
export function createDisplayView(context) { const view = document.createElement('display-view'); view.context = context; return view; }
