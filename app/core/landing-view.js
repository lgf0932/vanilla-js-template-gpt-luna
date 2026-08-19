import '../components/ui/ui-badge.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-icon.js';
import { NovaElement, defineOnce, escapeHtml } from '../components/ui/base.js';

class LandingView extends NovaElement {
  connectedCallback() {
    this.context = this.context || {};
    this.render();
  }

  render() {
    const i18n = this.context?.i18n;
    const t = (key, fallback) => i18n?.t(key, fallback) || fallback;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; min-height: 100%; }
        .landing { position: relative; min-height: 100%; overflow: hidden; background: hsl(var(--background)); }
        .landing::before { content: ''; position: absolute; inset: var(--spacing-0) var(--spacing-0) auto; height: var(--spacing-12); background: linear-gradient(180deg, hsl(var(--accent) / 0.14), transparent); pointer-events: none; }
        .nav { position: relative; display: flex; align-items: center; justify-content: space-between; max-width: var(--content-max-width); margin: 0 auto; padding: var(--spacing-5) var(--spacing-6); }
        .brand { display: flex; align-items: center; gap: var(--spacing-2); font-weight: 800; letter-spacing: -0.03em; }
        .mark { display: grid; place-items: center; width: var(--spacing-8); height: var(--spacing-8); border-radius: var(--radius); background: hsl(var(--accent)); color: hsl(var(--accent-foreground)); }
        .hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr); align-items: center; gap: var(--spacing-10); max-width: var(--content-max-width); margin: 0 auto; padding: var(--spacing-12) var(--spacing-6); }
        .eyebrow { display: inline-flex; align-items: center; gap: var(--spacing-2); color: hsl(var(--accent)); font-size: var(--font-size-sm); font-weight: 700; }
        h1 { max-width: 42rem; margin: var(--spacing-3) 0; font-size: clamp(var(--font-size-2xl), 6vw, var(--font-size-display)); line-height: var(--line-height-tight); letter-spacing: -0.06em; }
        .lead { max-width: 38rem; color: hsl(var(--muted-foreground)); font-size: var(--font-size-lg); }
        .actions { display: flex; flex-wrap: wrap; gap: var(--spacing-3); margin-top: var(--spacing-6); }
        .signal { position: relative; min-height: 20rem; padding: var(--spacing-4); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius-xl); background: linear-gradient(145deg, hsl(var(--card)), hsl(var(--accent) / 0.08)); box-shadow: var(--shadow-lg); transform: rotate(2deg); }
        .signal::after { content: ''; position: absolute; inset: var(--spacing-5); border: var(--border-width) dashed hsl(var(--accent) / 0.32); border-radius: var(--radius-lg); pointer-events: none; }
        .signal-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: var(--spacing-4); border-bottom: var(--border-width) solid hsl(var(--border)); }
        .signal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-3); margin-top: var(--spacing-4); }
        .metric { display: flex; flex-direction: column; gap: var(--spacing-2); padding: var(--spacing-3); border-radius: var(--radius); background: hsl(var(--muted) / 0.72); }
        .metric strong { font-size: var(--font-size-xl); }
        .metric span { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .feature-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-3); max-width: var(--content-max-width); margin: 0 auto; padding: 0 var(--spacing-6) var(--spacing-12); }
        .feature { padding: var(--spacing-3); border-top: var(--border-width) solid hsl(var(--border)); }
        .feature ui-icon { color: hsl(var(--accent)); }
        .feature h2 { margin: var(--spacing-3) 0 var(--spacing-1); font-size: var(--font-size-md); }
        .feature p { margin: 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        @media (max-width: 48rem) { .hero { grid-template-columns: 1fr; padding-top: var(--spacing-8); } .signal { transform: rotate(0); } .feature-row { grid-template-columns: 1fr; } }
        @media (max-width: 40rem) { .nav, .hero, .feature-row { padding-inline: var(--spacing-4); } h1 { font-size: var(--font-size-2xl); } .lead { font-size: var(--font-size-md); } }
      </style>
      <main class="landing">
        <nav class="nav"><div class="brand"><span class="mark"><ui-icon name="spark"></ui-icon></span><span>Nova</span></div><ui-button class="enter" variant="outline" size="sm">${escapeHtml(t('common.actions.enter', '进入工作台'))}</ui-button></nav>
        <section class="hero"><div><div class="eyebrow"><ui-icon name="spark"></ui-icon>${escapeHtml(t('landing.eyebrow', '你的个人工作台'))}</div><h1>${escapeHtml(t('landing.title', '把想法，整理成下一步。'))}</h1><p class="lead">${escapeHtml(t('landing.lead', 'Nova 用清晰的模块、轻盈的交互和可靠的本地优先体验，让记录、复盘与行动回到同一个节奏里。'))}</p><div class="actions"><ui-button class="start">${escapeHtml(t('landing.start', '开始使用'))}<ui-icon name="arrow"></ui-icon></ui-button><ui-button class="explore" variant="ghost">${escapeHtml(t('landing.explore', '了解 Nova'))}</ui-button></div></div><div class="signal" aria-label="Nova 工作台预览"><div class="signal-head"><span class="u-muted">今日概览</span><ui-badge variant="success">运行正常</ui-badge></div><div class="signal-grid"><div class="metric"><ui-icon name="note"></ui-icon><strong>12</strong><span>条灵感笔记</span></div><div class="metric"><ui-icon name="layers"></ui-icon><strong>03</strong><span>个工作模块</span></div><div class="metric"><ui-icon name="clock"></ui-icon><strong>24h</strong><span>专注窗口</span></div><div class="metric"><ui-icon name="check"></ui-icon><strong>100%</strong><span>掌控感</span></div></div></div></section>
        <section class="feature-row"><article class="feature"><ui-icon name="layers"></ui-icon><h2>${escapeHtml(t('landing.feature.modular.title', '模块化整理'))}</h2><p>${escapeHtml(t('landing.feature.modular.description', '笔记、设置与概览各司其职，越用越顺手。'))}</p></article><article class="feature"><ui-icon name="lock"></ui-icon><h2>${escapeHtml(t('landing.feature.private.title', '私密而可靠'))}</h2><p>${escapeHtml(t('landing.feature.private.description', '单密码鉴权与加密设置，让自托管也有安心边界。'))}</p></article><article class="feature"><ui-icon name="spark"></ui-icon><h2>${escapeHtml(t('landing.feature.focus.title', '保持轻盈'))}</h2><p>${escapeHtml(t('landing.feature.focus.description', '原生 Web Components 驱动，零依赖、快启动、低负担。'))}</p></article></section>
      </main>
    `;
    this.shadowRoot.querySelector('.enter')?.addEventListener('click', () => this.context?.router?.navigate('/auth'));
    this.shadowRoot.querySelector('.start')?.addEventListener('click', () => this.context?.router?.navigate('/auth'));
    this.shadowRoot.querySelector('.explore')?.addEventListener('click', () => this.shadowRoot.querySelector('.feature-row')?.scrollIntoView({ behavior: 'smooth' }));
  }
}

defineOnce('landing-view', LandingView);

export function createLandingView(context) {
  const view = document.createElement('landing-view');
  view.context = context;
  return view;
}
