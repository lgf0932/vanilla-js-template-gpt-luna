import '../../../../components/ui/ui-button.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-icon.js';
import { api } from '../../../../lib/fetcher.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../../components/ui/base.js';

class NotesListView extends NovaElement {
  connectedCallback() {
    this.items = [];
    this.error = '';
    this.render();
    this.load();
  }

  async load() {
    try {
      this.items = (await api.get('/api/notes?limit=50')).items || [];
    } catch (error) {
      this.error = error.message;
    }
    this.render();
  }

  render() {
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    const language = this.context?.i18n?.language || 'zh-CN';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; animation: nova-fade-in var(--transition-slow) both; }
        h1 { margin: 0; font-size: var(--font-size-xl); }
        p { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .list { display: flex; flex-direction: column; gap: var(--spacing-2); margin-top: var(--spacing-6); }
        .item { display: flex; align-items: center; gap: var(--spacing-3); padding: var(--spacing-3); }
        .item ui-icon { color: hsl(var(--accent)); }
        strong { flex: 1; font-size: var(--font-size-sm); }
        .empty { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-3); padding: var(--spacing-6); text-align: center; }
      </style>
      <section><h1>${escapeHtml(t('notesList.title', '全部笔记'))}</h1><p>${escapeHtml(t('notesList.description', '按最近更新时间浏览你的记录。'))}</p>${this.error ? `<p>${escapeHtml(this.error)}</p>` : `<div class="list">${this.items.length ? this.items.map((item) => `<ui-card><div class="item"><ui-icon name="note"></ui-icon><strong>${escapeHtml(item.title)}</strong><span class="u-muted">${escapeHtml(new Date(item.updated_at).toLocaleDateString(language))}</span></div></ui-card>`).join('') : `<div class="empty"><ui-icon name="spark"></ui-icon><p>${escapeHtml(t('notesList.empty', '暂无笔记'))}</p><ui-button class="create">${escapeHtml(t('notesList.create', '新建笔记'))}</ui-button></div>`}</div>`}</section>
    `;
    this.shadowRoot.querySelector('.create')?.addEventListener('click', () => this.context?.router?.navigate('/notes'));
  }
}

defineOnce('notes-list-view', NotesListView);
export function createNotesListView(context) { const view = document.createElement('notes-list-view'); view.context = context; return view; }
export const createListView = createNotesListView;
