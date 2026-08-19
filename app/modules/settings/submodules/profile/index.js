import '../../../../components/ui/ui-button.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-input.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class ProfileView extends NovaElement {
  connectedCallback() {
    this.state = { profile: {}, error: '' };
    this.render();
    this.load();
  }

  async load() {
    try {
      this.state.profile = (await api.get('/api/settings')).profile || {};
    } catch (error) {
      this.state.error = error.message;
    }
    this.render();
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    this.shadowRoot.innerHTML = `<style>:host{display:block;animation:nova-fade-in var(--transition-slow) both}.form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--spacing-3)}.actions{display:flex;justify-content:flex-end;margin-top:var(--spacing-3)}.error{padding:var(--spacing-3);color:hsl(var(--danger));background:hsl(var(--danger)/.1);border-radius:var(--radius)}@media(max-width:40rem){.form{grid-template-columns:1fr}}</style><ui-card><span slot="title">${escapeHtml(t('settingsProfile.title', '个人资料'))}</span><span slot="description">${escapeHtml(t('settingsProfile.description', '资料会使用 AES-GCM 信封加密保存。'))}</span>${this.state.error ? `<p class="error">${escapeHtml(this.state.error)}</p>` : ''}<div class="form"><ui-input name="name" label="${escapeHtml(t('settingsProfile.name', '称呼'))}" value="${escapeHtml(this.state.profile.name || '')}"></ui-input><ui-input name="email" type="email" label="${escapeHtml(t('settingsProfile.email', '邮箱'))}" value="${escapeHtml(this.state.profile.email || '')}"></ui-input><ui-input name="phone" label="${escapeHtml(t('settingsProfile.phone', '电话'))}" value="${escapeHtml(this.state.profile.phone || '')}"></ui-input><ui-input name="address" label="${escapeHtml(t('settingsProfile.address', '地址'))}" value="${escapeHtml(this.state.profile.address || '')}"></ui-input></div><div class="actions"><ui-button class="save">${escapeHtml(t('settingsProfile.save', '保存资料'))}</ui-button></div></ui-card>`;
    this.shadowRoot.querySelector('.save')?.addEventListener('click', async () => {
      try {
        const profile = Object.fromEntries([...this.shadowRoot.querySelectorAll('ui-input')].map((input) => [input.getAttribute('name'), input.value]));
        await api.put('/api/settings', { profile });
      } catch (error) {
        this.state.error = error.message;
        this.render();
      }
    });
  }
}

defineOnce('profile-view', ProfileView);
export function createProfileView(context) { const view = document.createElement('profile-view'); view.context = context; return view; }
