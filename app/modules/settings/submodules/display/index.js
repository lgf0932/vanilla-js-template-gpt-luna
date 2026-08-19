import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-select.js';
import '../../../../components/ui/ui-theme-switch.js';
import { api } from '../../../../lib/fetcher.js';
import { applyTheme } from '../../../../core/theme.js';
import { NovaElement, defineOnce } from '../../../../components/ui/base.js';

class DisplayView extends NovaElement {
  async connectedCallback() { this.settings = await api.get('/api/settings').catch(() => ({ display: {} })); this.render(); }
  render() { const display = this.settings?.display || {}; this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.panel{display:flex;flex-direction:column;gap:var(--spacing-3)}.row{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-3);padding:var(--spacing-3);border:var(--border-width) solid hsl(var(--border));border-radius:var(--radius)}.row strong{display:block;font-size:var(--font-size-sm)}.row span{color:hsl(var(--muted-foreground));font-size:var(--font-size-xs)}@media(max-width:40rem){.row{align-items:flex-start;flex-direction:column}}</style><ui-card><span slot="title">显示与语言</span><span slot="description">选择你喜欢的呈现方式。</span><div class="panel"><div class="row"><div><strong>主题模式</strong><span>系统、浅色或深色</span></div><ui-theme-switch></ui-theme-switch></div><ui-select class="language" label="语言"></ui-select></div></ui-card>`; const theme = this.shadowRoot.querySelector('ui-theme-switch'); theme.value = display.theme || 'system'; theme.addEventListener('theme-change', (event) => { applyTheme(event.detail.value); api.put('/api/settings', { display: { ...display, theme: event.detail.value } }); }); const language = this.shadowRoot.querySelector('.language'); language.options = [{ value: 'zh-CN', label: '简体中文' }, { value: 'zh-TW', label: '繁體中文' }, { value: 'en', label: 'English' }]; language.value = display.language || 'zh-CN'; language.addEventListener('ui-change', (event) => api.put('/api/settings', { display: { ...display, language: event.detail.value } })); }
}
defineOnce('display-view', DisplayView); export function createDisplayView(context) { const view = document.createElement('display-view'); view.context = context; return view; }
