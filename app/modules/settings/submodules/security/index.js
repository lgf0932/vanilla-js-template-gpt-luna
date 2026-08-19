import '../../../../components/ui/ui-button.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-select.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce } from '../../../../components/ui/base.js';

class SecurityView extends NovaElement {
  async connectedCallback() { this.settings = await api.get('/api/settings').catch(() => ({ sessionDefault: '24h' })); this.render(); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.panel{display:flex;flex-direction:column;gap:var(--spacing-3)}.notice{padding:var(--spacing-3);border-radius:var(--radius);background:hsl(var(--muted));color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}.actions{display:flex;justify-content:flex-end}</style><ui-card><span slot="title">安全会话</span><span slot="description">令牌过期后需要重新输入密码。</span><div class="panel"><div class="notice">原始密码不会进入后续请求；服务端只校验派生的 HMAC 令牌。</div><ui-select class="duration" label="默认会话时长"></ui-select><div class="actions"><ui-button class="save">保存偏好</ui-button></div></div></ui-card>`; const select = this.shadowRoot.querySelector('.duration'); select.options = [{ value: '4h', label: '4 小时' }, { value: '8h', label: '8 小时' }, { value: '12h', label: '12 小时' }, { value: '24h', label: '24 小时' }, { value: '7d', label: '7 天' }, { value: '14d', label: '14 天' }, { value: '30d', label: '30 天' }, { value: '90d', label: '90 天' }, { value: 'session', label: '直到浏览器关闭' }]; select.value = this.settings.sessionDefault || '24h'; this.shadowRoot.querySelector('.save')?.addEventListener('click', () => api.put('/api/settings', { sessionDefault: select.value })); }
}
defineOnce('security-view', SecurityView); export function createSecurityView(context) { const view = document.createElement('security-view'); view.context = context; return view; }
