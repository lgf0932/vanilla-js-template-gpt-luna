import '../../components/ui/ui-badge.js';
import '../../components/ui/ui-button.js';
import '../../components/ui/ui-card.js';
import '../../components/ui/ui-icon.js';
import { dashboardApi } from './api.js';
import { dashboardStore } from './store.js';
import { NovaElement, defineOnce, escapeHtml } from '../../components/ui/base.js';

class DashboardView extends NovaElement {
  connectedCallback() {
    this.state = dashboardStore.state;
    this.unsubscribe = dashboardStore.subscribe(() => this.render());
    this.render();
    this.load();
  }

  async load() {
    try {
      dashboardStore.patch({ loading: false, error: '', summary: await dashboardApi.summary() });
    } catch (error) {
      dashboardStore.patch({ loading: false, error: error.message, summary: null });
    }
    this.render();
  }

  disconnectedCallback() { this.unsubscribe?.(); }

  render() {
    const t = (key, fallback, values) => this.context?.i18n?.t(key, fallback, values) || fallback;
    const summary = this.state?.summary;
    const notes = summary?.recentNotes || [];
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; animation: nova-fade-in var(--transition-slow) both; }
        .head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--spacing-3); margin-bottom: var(--spacing-6); }
        .eyebrow { color: hsl(var(--accent)); font-size: var(--font-size-sm); font-weight: 700; }
        h1 { margin: var(--spacing-1) 0 0; font-size: var(--font-size-xl); line-height: var(--line-height-tight); }
        .muted { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-3); margin-bottom: var(--spacing-3); }
        .metric { display: flex; align-items: center; gap: var(--spacing-3); padding: var(--spacing-3); }
        .metric-icon { display: grid; place-items: center; width: var(--spacing-10); height: var(--spacing-10); border-radius: var(--radius); background: hsl(var(--accent) / 0.12); color: hsl(var(--accent)); }
        .metric strong { display: block; font-size: var(--font-size-xl); line-height: var(--line-height-tight); }
        .metric span { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .content { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.65fr); gap: var(--spacing-3); }
        .recent { display: flex; flex-direction: column; gap: var(--spacing-3); }
        .recent-head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); }
        .recent-head h2 { margin: 0; font-size: var(--font-size-md); }
        .note { display: flex; align-items: flex-start; gap: var(--spacing-3); padding: var(--spacing-2) 0; border-bottom: var(--border-width) solid hsl(var(--border)); }
        .note:last-child { border-bottom: 0; }
        .note ui-icon { color: hsl(var(--accent)); margin-top: var(--spacing-1); }
        .note strong { display: block; font-size: var(--font-size-sm); }
        .note p { margin: var(--spacing-1) 0 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .empty { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-3); padding: var(--spacing-6) var(--spacing-3); text-align: center; color: hsl(var(--muted-foreground)); }
        .empty ui-icon { width: var(--icon-size-lg); height: var(--icon-size-lg); color: hsl(var(--accent)); }
        .empty p { margin: 0; font-size: var(--font-size-sm); }
        .error { padding: var(--spacing-3); border-radius: var(--radius); background: hsl(var(--danger) / 0.1); color: hsl(var(--danger)); font-size: var(--font-size-sm); }
        @media (max-width: 48rem) { .content { grid-template-columns: 1fr; } }
        @media (max-width: 40rem) { .head { align-items: flex-start; flex-direction: column; } .metrics { grid-template-columns: 1fr; } }
      </style>
      <section><header class="head"><div><div class="eyebrow">${escapeHtml(t('dashboard.eyebrow', 'Nova / 概览'))}</div><h1>${escapeHtml(t('dashboard.title', '今天，也从清晰开始。'))}</h1><span class="muted">${escapeHtml(t('dashboard.subtitle', '把正在发生的事，放在看得见的位置。'))}</span></div><ui-button class="new-note" size="sm"><ui-icon name="plus"></ui-icon>${escapeHtml(t('dashboard.newNote', '新建笔记'))}</ui-button></header>${this.state?.error ? `<div class="error">${escapeHtml(this.state.error)}</div>` : ''}<div class="metrics"><ui-card><div class="metric"><span class="metric-icon"><ui-icon name="note"></ui-icon></span><div><strong>${summary?.metrics?.notes ?? '—'}</strong><span>${escapeHtml(t('dashboard.metrics.notes', '笔记总数'))}</span></div></div></ui-card><ui-card><div class="metric"><span class="metric-icon"><ui-icon name="layers"></ui-icon></span><div><strong>${summary?.metrics?.modules ?? '—'}</strong><span>${escapeHtml(t('dashboard.metrics.modules', '活跃模块'))}</span></div></div></ui-card><ui-card><div class="metric"><span class="metric-icon"><ui-icon name="check"></ui-icon></span><div><strong>${escapeHtml(t('dashboard.metrics.ready', 'Ready'))}</strong><span>${escapeHtml(t('dashboard.metrics.status', '工作台状态'))}</span></div></div></ui-card></div><div class="content"><ui-card><div class="recent"><div class="recent-head"><h2>${escapeHtml(t('dashboard.recent.title', '最近更新'))}</h2><ui-button class="all-notes" variant="ghost" size="sm">${escapeHtml(t('dashboard.recent.all', '查看全部'))}<ui-icon name="arrow"></ui-icon></ui-button></div>${notes.length ? notes.map((note) => `<article class="note"><ui-icon name="note"></ui-icon><div><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml((note.content || '').slice(0, 96) || t('dashboard.recent.noContent', '暂无正文'))}</p></div></article>`).join('') : `<div class="empty"><ui-icon name="spark"></ui-icon><p>${escapeHtml(t('dashboard.empty', '还没有笔记，先记录一个想法吧。'))}</p><ui-button class="empty-new" size="sm">${escapeHtml(t('dashboard.newNote', '新建笔记'))}</ui-button></div>`}</div></ui-card><ui-card><span slot="title">${escapeHtml(t('dashboard.tip.title', 'Nova 小提示'))}</span><span slot="description">${escapeHtml(t('dashboard.tip.description', '用短标题捕捉重点，再用正文留下上下文。'))}</span><div class="empty"><ui-icon name="spark"></ui-icon><p>${escapeHtml(t('dashboard.tip.body', '好的整理，从下一步足够明确开始。'))}</p></div></ui-card></div></section>
    `;
    this.shadowRoot.querySelectorAll('.new-note, .empty-new').forEach((button) => button.addEventListener('click', () => this.context?.router?.navigate('/notes')));
    this.shadowRoot.querySelector('.all-notes')?.addEventListener('click', () => this.context?.router?.navigate('/notes'));
  }
}

defineOnce('dashboard-view', DashboardView);

export function createDashboardView(context) {
  const view = document.createElement('dashboard-view');
  view.context = context;
  return view;
}
