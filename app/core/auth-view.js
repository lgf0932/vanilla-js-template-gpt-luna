import '../components/ui/ui-button.js';
import '../components/ui/ui-card.js';
import '../components/ui/ui-input.js';
import '../components/ui/ui-select.js';
import '../components/ui/ui-icon.js';
import { NovaElement, defineOnce, escapeHtml } from '../components/ui/base.js';

function routeSearchParams() {
  if (globalThis.location?.protocol === 'file:') {
    return new URLSearchParams(globalThis.location.hash.split('?')[1] || '');
  }
  return new URLSearchParams(globalThis.location.search);
}

class AuthView extends NovaElement {
  connectedCallback() {
    this.state = { loading: true, configured: false, error: '' };
    this.render();
    this.loadStatus();
  }

  async loadStatus() {
    try {
      const status = await this.context.auth.status();
      this.state = { ...this.state, loading: false, configured: status.configured };
    } catch (error) {
      this.state = { ...this.state, loading: false, error: error.message };
    }
    this.render();
  }

  render() {
    const i18n = this.context?.i18n;
    const t = (key, fallback) => i18n?.t(key, fallback) || fallback;
    const { loading, configured, error } = this.state || {};
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: grid; min-height: 100%; place-items: center; padding: var(--spacing-4); background: radial-gradient(circle at top right, hsl(var(--accent) / 0.14), transparent var(--spacing-12)), hsl(var(--background)); }
        .wrap { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr); width: min(100%, var(--auth-max-width)); overflow: hidden; border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius-xl); background: hsl(var(--card)); box-shadow: var(--shadow-lg); }
        .intro { display: flex; flex-direction: column; justify-content: space-between; gap: var(--spacing-8); padding: var(--spacing-8); background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        .brand { display: flex; align-items: center; gap: var(--spacing-2); font-weight: 800; }
        .mark { display: grid; place-items: center; width: var(--spacing-8); height: var(--spacing-8); border-radius: var(--radius); background: hsl(var(--accent)); color: hsl(var(--accent-foreground)); }
        .intro h1 { margin: 0; font-size: var(--font-size-2xl); line-height: var(--line-height-tight); letter-spacing: -0.04em; }
        .intro p { margin: 0; color: hsl(var(--primary-foreground) / 0.68); font-size: var(--font-size-sm); }
        .quote { color: hsl(var(--primary-foreground) / 0.58); font-size: var(--font-size-xs); }
        .form { padding: var(--spacing-8); }
        .form h2 { margin: 0 0 var(--spacing-2); font-size: var(--font-size-xl); }
        .form > p { margin: 0 0 var(--spacing-6); color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        form { display: flex; flex-direction: column; gap: var(--spacing-3); }
        .actions { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); margin-top: var(--spacing-2); }
        .error { padding: var(--spacing-2) var(--spacing-3); border-radius: var(--radius); background: hsl(var(--danger) / 0.1); color: hsl(var(--danger)); font-size: var(--font-size-sm); }
        .back { margin-bottom: var(--spacing-4); }
        @media (max-width: 48rem) { .wrap { grid-template-columns: 1fr; } .intro { padding: var(--spacing-5); } .intro h1 { font-size: var(--font-size-xl); } .quote { display: none; } .form { padding: var(--spacing-5); } }
      </style>
      <section class="wrap">
        <aside class="intro"><div><div class="brand"><span class="mark"><ui-icon name="spark"></ui-icon></span><span>Nova</span></div><h1>${escapeHtml(t('auth.welcome', '欢迎回到你的节奏。'))}</h1><p>${escapeHtml(t('auth.intro', '一个安静、清晰、只属于你的工作台。'))}</p></div><span class="quote">${escapeHtml(t('auth.quote', '整理不是减法，是为重要的事留出空间。'))}</span></aside>
        <section class="form"><ui-button class="back" variant="ghost" size="sm"><ui-icon name="arrow"></ui-icon>${escapeHtml(t('common.actions.back', '返回首页'))}</ui-button><h2>${escapeHtml(loading ? t('auth.loading', '正在准备…') : configured ? t('auth.loginTitle', '进入工作台') : t('auth.setupTitle', '设置管理密码'))}</h2><p>${escapeHtml(configured ? t('auth.loginDescription', '输入密码继续，你的会话仅在选定的时间内有效。') : t('auth.setupDescription', '首次使用请设置一个至少 8 位的管理密码。'))}</p>${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}${loading ? `<div class="u-muted">${escapeHtml(t('common.loading', '加载中…'))}</div>` : `<form><ui-input name="password" type="password" label="${escapeHtml(t('auth.password', '管理密码'))}" placeholder="${escapeHtml(t('auth.passwordPlaceholder', '请输入密码'))}" required></ui-input>${configured ? `<ui-select name="duration" aria-label="${escapeHtml(t('auth.duration', '会话时长'))}"></ui-select>` : `<ui-input name="confirm" type="password" label="${escapeHtml(t('auth.passwordConfirm', '确认密码'))}" placeholder="${escapeHtml(t('auth.passwordConfirmPlaceholder', '请再次输入密码'))}" required></ui-input>`}<div class="actions"><span class="u-muted">${escapeHtml(t('auth.secureHint', '你的凭证只用于本设备会话。'))}</span><ui-button type="submit">${escapeHtml(configured ? t('auth.login', '登录') : t('auth.setup', '创建并进入'))}<ui-icon name="arrow"></ui-icon></ui-button></div></form>`}</section>
      </section>
    `;
    this.shadowRoot.querySelector('.back')?.addEventListener('click', () => this.context.router.navigate('/'));
    const duration = this.shadowRoot.querySelector('ui-select');
    if (duration) {
      duration.options = ['4h', '8h', '12h', '24h', '7d', '14d', '30d', '90d', 'session'].map((value) => ({ value, label: t(`auth.durationOptions.${value}`, value) }));
      duration.value = '24h';
    }
    this.shadowRoot.querySelector('form')?.addEventListener('submit', (event) => this.submit(event));
  }

  async submit(event) {
    event.preventDefault();
    const password = this.shadowRoot.querySelector('ui-input[name="password"]')?.value || '';
    const confirm = this.shadowRoot.querySelector('ui-input[name="confirm"]')?.value || '';
    const duration = this.shadowRoot.querySelector('ui-select')?.value || '24h';
    if (password.length < 8) {
      this.state = { ...this.state, error: this.context.i18n?.t('auth.validation.passwordLength', '密码至少需要 8 个字符') || '密码至少需要 8 个字符' };
      this.render();
      return;
    }
    if (!this.state.configured && password !== confirm) {
      this.state = { ...this.state, error: this.context.i18n?.t('auth.validation.passwordMismatch', '两次输入的密码不一致') || '两次输入的密码不一致' };
      this.render();
      return;
    }
    this.state = { ...this.state, error: '', loading: true };
    this.render();
    try {
      if (this.state.configured) await this.context.auth.login(password, duration);
      else await this.context.auth.setup(password);
      const query = routeSearchParams();
      this.context.router.navigate(query.get('returnTo') || '/dashboard', { replace: true });
    } catch (error) {
      this.state = { ...this.state, loading: false, error: error.message };
      this.render();
    }
  }
}

defineOnce('auth-view', AuthView);

export function createAuthView(context) {
  const view = document.createElement('auth-view');
  view.context = context;
  return view;
}
