import '../../../../components/ui/ui-button.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-select.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class SecurityView extends NovaElement {
  async connectedCallback() {
    this.settings = await api.get('/api/settings').catch(() => ({ sessionDefault: '24h' }));
    this.render();
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    const options = ['4h', '8h', '12h', '24h', '7d', '14d', '30d', '90d', 'session'];
    this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.panel{display:flex;flex-direction:column;gap:var(--spacing-3)}.notice{padding:var(--spacing-3);border-radius:var(--radius);background:hsl(var(--muted));color:hsl(var(--muted-foreground));font-size:var(--font-size-sm)}.actions{display:flex;justify-content:flex-end}</style><ui-card><span slot="title">${escapeHtml(t('settingsSecurity.title', '安全会话'))}</span><span slot="description">${escapeHtml(t('settingsSecurity.description', '令牌过期后需要重新输入密码。'))}</span><div class="panel"><div class="notice">${escapeHtml(t('settingsSecurity.notice', '原始密码不会进入后续请求；服务端只校验派生的 HMAC 令牌。'))}</div><ui-select class="duration" aria-label="${escapeHtml(t('settingsSecurity.duration', '默认会话时长'))}"></ui-select><div class="actions"><ui-button class="save">${escapeHtml(t('settingsSecurity.save', '保存偏好'))}</ui-button></div></div></ui-card>`;
    const select = this.shadowRoot.querySelector('.duration');
    select.options = options.map((value) => ({ value, label: t(`settingsSecurity.options.${value}`, value) }));
    select.value = this.settings.sessionDefault || '24h';
    this.shadowRoot.querySelector('.save')?.addEventListener('click', () => api.put('/api/settings', { sessionDefault: select.value }));
  }
}
defineOnce('security-view', SecurityView);
export function createSecurityView(context) { const view = document.createElement('security-view'); view.context = context; return view; }
