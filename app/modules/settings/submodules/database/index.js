import '../../../../components/ui/ui-badge.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-icon.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class DatabaseView extends NovaElement {
  async connectedCallback() { this.state = { driver: 'checking', ok: false }; try { const result = await api.get('/api/health'); this.state = { driver: result.driver, ok: result.ok }; } catch {} this.render(); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.status{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-3);padding:var(--spacing-3);border:var(--border-width) solid hsl(var(--border));border-radius:var(--radius)}.status strong{display:block;font-size:var(--font-size-md)}.status span{color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}.info{display:flex;gap:var(--spacing-2);padding:var(--spacing-3);color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}</style><ui-card><span slot="title">数据库状态</span><span slot="description">SQL-first 适配器会保持业务逻辑的平台无关性。</span><div class="status"><div><strong>${escapeHtml(this.state.driver)}</strong><span>当前数据库驱动</span></div><ui-badge variant="${this.state.ok ? 'success' : 'warning'}">${this.state.ok ? '可用' : '检查中'}</ui-badge></div><div class="info"><ui-icon name="layers"></ui-icon><span>迁移版本与设置快照由服务端统一维护。</span></div></ui-card>`; }
}
defineOnce('database-view', DatabaseView); export function createDatabaseView(context) { const view = document.createElement('database-view'); view.context = context; return view; }
