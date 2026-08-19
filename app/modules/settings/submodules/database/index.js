import '../../../../components/ui/ui-badge.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-icon.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class DatabaseView extends NovaElement {
  async connectedCallback() {
    this.state = { driver: 'checking', ok: false };
    try {
      const result = await api.get('/api/health');
      this.state = { driver: result.driver, ok: result.ok };
    } catch {}
    this.render();
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    const driver = this.state.driver === 'checking' ? t('settingsDatabase.checking', '检查中') : this.state.driver;
    const status = this.state.ok ? t('settingsDatabase.ready', '可用') : t('settingsDatabase.unavailable', '不可用');
    this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.status{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-3);padding:var(--spacing-3);border:var(--border-width) solid hsl(var(--border));border-radius:var(--radius)}.status strong{display:block;font-size:var(--font-size-md)}.status span{color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}.info{display:flex;gap:var(--spacing-2);padding:var(--spacing-3);color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}</style><ui-card><span slot="title">${escapeHtml(t('settingsDatabase.title', '数据库状态'))}</span><span slot="description">${escapeHtml(t('settingsDatabase.description', 'SQL-first 适配器保持业务逻辑的平台无关性。'))}</span><div class="status"><div><strong>${escapeHtml(driver)}</strong><span>${escapeHtml(t('settingsDatabase.driver', '当前数据库驱动'))}</span></div><ui-badge variant="${this.state.ok ? 'success' : 'warning'}">${escapeHtml(status)}</ui-badge></div><div class="info"><ui-icon name="layers"></ui-icon><span>${escapeHtml(t('settingsDatabase.info', '迁移版本与设置快照由服务端统一维护。'))}</span></div></ui-card>`;
  }
}
defineOnce('database-view', DatabaseView);
export function createDatabaseView(context) { const view = document.createElement('database-view'); view.context = context; return view; }
