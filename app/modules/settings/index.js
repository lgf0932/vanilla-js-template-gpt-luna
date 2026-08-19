import '../../components/ui/ui-badge.js';
import '../../components/ui/ui-button.js';
import '../../components/ui/ui-card.js';
import '../../components/ui/ui-icon.js';
import '../../components/ui/ui-input.js';
import '../../components/ui/ui-select.js';
import '../../components/ui/ui-tabs.js';
import '../../components/ui/ui-theme-switch.js';
import { applyTheme } from '../../core/theme.js';
import { settingsApi } from './api.js';
import { settingsStore } from './store.js';
import { NovaElement, defineOnce, escapeHtml } from '../../components/ui/base.js';

class SettingsView extends NovaElement {
  connectedCallback() {
    this.state = settingsStore.state;
    this.unsubscribe = settingsStore.subscribe(() => this.render());
    this.activeTab = 'profile';
    this.render();
    this.load();
  }

  disconnectedCallback() { this.unsubscribe?.(); }

  async load() {
    settingsStore.patch({ loading: true, error: '' });
    try {
      const result = await settingsApi.get();
      settingsStore.patch({ ...result, loading: false });
    } catch (error) {
      settingsStore.patch({ loading: false, error: error.message });
    }
  }

  async update(input) {
    try {
      const result = await settingsApi.update(input);
      settingsStore.patch(result);
      this.context?.shell?.showToast(this.context?.i18n?.t('settings.saved', '设置已保存') || '设置已保存', 'success');
    } catch (error) {
      settingsStore.patch({ error: error.message });
    }
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    const state = this.state || {};
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; animation: nova-fade-in var(--transition-slow) both; }
        .head { margin-bottom: var(--spacing-6); }
        .eyebrow { color: hsl(var(--accent)); font-size: var(--font-size-sm); font-weight: 700; }
        h1 { margin: var(--spacing-1) 0 0; font-size: var(--font-size-xl); line-height: var(--line-height-tight); }
        .subtitle { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .tabs { margin-bottom: var(--spacing-3); }
        .panel { display: flex; flex-direction: column; gap: var(--spacing-3); }
        .panel h2 { margin: 0; font-size: var(--font-size-md); }
        .panel p { margin: 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-3); }
        .form .full { grid-column: 1 / -1; }
        .actions { display: flex; justify-content: flex-end; gap: var(--spacing-2); }
        .theme-row { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); padding: var(--spacing-3); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius); }
        .theme-row strong { display: block; font-size: var(--font-size-sm); }
        .theme-row span { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .links { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-2); }
        .link { display: flex; align-items: center; gap: var(--spacing-2); padding: var(--spacing-3); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius); background: transparent; color: hsl(var(--foreground)); cursor: pointer; text-align: left; }
        .link:hover { border-color: hsl(var(--accent)); }
        .link ui-icon { color: hsl(var(--accent)); }
        .error { margin-bottom: var(--spacing-3); padding: var(--spacing-3); border-radius: var(--radius); background: hsl(var(--danger) / 0.1); color: hsl(var(--danger)); font-size: var(--font-size-sm); }
        @media (max-width: 40rem) { .form, .links { grid-template-columns: 1fr; } .form .full { grid-column: auto; } .theme-row { align-items: flex-start; flex-direction: column; } }
      </style>
      <section><header class="head"><div class="eyebrow">${escapeHtml(t('settings.eyebrow', 'Nova / 设置'))}</div><h1>${escapeHtml(t('settings.title', '让工作台适合你。'))}</h1><span class="subtitle">${escapeHtml(t('settings.subtitle', '调整偏好、会话与数据边界。'))}</span></header>${state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : ''}<ui-tabs class="tabs"></ui-tabs>${this.panelTemplate(t, state)}</section>
    `;
    const tabs = this.shadowRoot.querySelector('ui-tabs');
    tabs.tabs = [
      { value: 'profile', label: t('settings.tabs.profile', '个人资料') },
      { value: 'display', label: t('settings.tabs.display', '显示与语言') },
      { value: 'security', label: t('settings.tabs.security', '安全会话') },
      { value: 'database', label: t('settings.tabs.database', '数据库') },
    ];
    tabs.value = this.activeTab;
    tabs.addEventListener('tabs-change', (event) => { this.activeTab = event.detail.value; this.render(); });
    this.bindPanel(state, t);
  }

  panelTemplate(t, state) {
    if (this.activeTab === 'display') return `<ui-card><div class="panel"><h2>${escapeHtml(t('settings.display.title', '显示与语言'))}</h2><p>${escapeHtml(t('settings.display.description', '选择 Nova 在不同设备上的呈现方式。'))}</p><div class="theme-row"><div><strong>${escapeHtml(t('settings.display.theme', '主题模式'))}</strong><span>${escapeHtml(t('settings.display.themeHint', '系统模式会跟随设备偏好。'))}</span></div><ui-theme-switch></ui-theme-switch></div><ui-select class="language" label="${escapeHtml(t('settings.display.language', '语言'))}"></ui-select></div></ui-card>`;
    if (this.activeTab === 'security') return `<ui-card><div class="panel"><h2>${escapeHtml(t('settings.security.title', '安全会话'))}</h2><p>${escapeHtml(t('settings.security.description', '登录令牌只携带过期时间与随机数，不保存原始密码。'))}</p><ui-select class="session" aria-label="${escapeHtml(t('settings.security.defaultDuration', '默认会话时长'))}"></ui-select><div class="actions"><ui-button class="security-save">${escapeHtml(t('common.actions.save', '保存'))}</ui-button></div></div></ui-card>`;
    if (this.activeTab === 'database') return `<ui-card><div class="panel"><h2>${escapeHtml(t('settings.database.title', '数据库状态'))}</h2><p>${escapeHtml(t('settings.database.description', 'Nova 通过适配器在本地 SQLite、Cloudflare D1 与 Turso 之间切换。'))}</p><div class="theme-row"><div><strong>${escapeHtml(t('settings.database.driver', '当前驱动'))}</strong><span class="driver">检查中…</span></div><ui-badge class="health" variant="success">${escapeHtml(t('settings.database.ready', '可用'))}</ui-badge></div><div class="links"><button class="link" type="button" data-path="/settings/profile"><ui-icon name="note"></ui-icon><span>${escapeHtml(t('settings.links.profile', '编辑个人资料'))}</span></button><button class="link" type="button" data-path="/settings/display"><ui-icon name="sun"></ui-icon><span>${escapeHtml(t('settings.links.display', '调整显示'))}</span></button></div></div></ui-card>`;
    return `<ui-card><div class="panel"><h2>${escapeHtml(t('settings.profile.title', '个人资料'))}</h2><p>${escapeHtml(t('settings.profile.description', '资料使用信封加密保存；没有配置密钥时不会写入敏感字段。'))}</p><div class="form"><ui-input name="name" label="${escapeHtml(t('settings.profile.name', '称呼'))}" placeholder="${escapeHtml(t('settings.profile.namePlaceholder', '例如：小 Nova'))}" value="${escapeHtml(state.profile?.name || '')}"></ui-input><ui-input name="email" type="email" label="${escapeHtml(t('settings.profile.email', '邮箱'))}" placeholder="name@example.com" value="${escapeHtml(state.profile?.email || '')}"></ui-input><ui-input class="full" name="address" label="${escapeHtml(t('settings.profile.address', '地址（可选）'))}" placeholder="${escapeHtml(t('settings.profile.addressPlaceholder', '仅在需要时填写'))}" value="${escapeHtml(state.profile?.address || '')}"></ui-input></div><div class="actions"><ui-button class="profile-save">${escapeHtml(t('common.actions.save', '保存'))}</ui-button></div></div></ui-card>`;
  }

  bindPanel(state, t) {
    const language = this.shadowRoot.querySelector('.language');
    if (language) {
      language.options = [{ value: 'zh-CN', label: t('common.languages.zhCN', '简体中文') }, { value: 'zh-TW', label: t('common.languages.zhTW', '繁體中文') }, { value: 'en', label: t('common.languages.en', 'English') }];
      language.value = state.display?.language || 'zh-CN';
      language.addEventListener('ui-change', async (event) => { await this.context.i18n.setLanguage(event.detail.value); await this.update({ display: { ...state.display, language: event.detail.value } }); this.render(); });
    }
    const theme = this.shadowRoot.querySelector('ui-theme-switch');
    if (theme) { theme.labels = { label: t('common.theme.label', '主题模式'), system: t('common.theme.system', '系统'), light: t('common.theme.light', '浅色'), dark: t('common.theme.dark', '深色') }; theme.value = state.display?.theme || 'system'; theme.addEventListener('theme-change', (event) => { applyTheme(event.detail.value); this.context.shell?.setTheme(event.detail.value); this.update({ display: { ...state.display, theme: event.detail.value } }); }); }
    const session = this.shadowRoot.querySelector('.session');
    if (session) { session.options = ['4h', '8h', '12h', '24h', '7d', '14d', '30d', '90d', 'session'].map((value) => ({ value, label: t(`auth.durationOptions.${value}`, value) })); session.value = state.sessionDefault || '24h'; }
    this.shadowRoot.querySelector('.security-save')?.addEventListener('click', () => this.update({ sessionDefault: this.shadowRoot.querySelector('.session')?.value || '24h' }));
    this.shadowRoot.querySelector('.profile-save')?.addEventListener('click', () => this.update({ profile: Object.fromEntries([...this.shadowRoot.querySelectorAll('ui-input')].map((input) => [input.getAttribute('name'), input.value])) }));
    this.shadowRoot.querySelectorAll('[data-path]').forEach((button) => button.addEventListener('click', () => this.context?.router?.navigate(button.dataset.path)));
    if (this.activeTab === 'database') settingsApi.health().then((health) => { const driver = this.shadowRoot.querySelector('.driver'); if (driver) driver.textContent = health.driver || 'sqlite'; }).catch(() => {});
  }
}

defineOnce('settings-view', SettingsView);
export function createSettingsView(context) { const view = document.createElement('settings-view'); view.context = context; return view; }
