import './components/notes-editor.js';
import '../../components/ui/ui-badge.js';
import '../../components/ui/ui-button.js';
import '../../components/ui/ui-card.js';
import '../../components/ui/ui-dialog.js';
import '../../components/ui/ui-icon.js';
import { notesApi } from './api.js';
import { notesStore } from './store.js';
import { NovaElement, defineOnce, escapeHtml } from '../../components/ui/base.js';

class NotesView extends NovaElement {
  connectedCallback() {
    this.state = notesStore.state;
    this.unsubscribe = notesStore.subscribe(() => this.render());
    this.render();
    this.load();
  }

  disconnectedCallback() { this.unsubscribe?.(); }

  async load() {
    notesStore.patch({ loading: true, error: '' });
    try {
      const result = await notesApi.list({ limit: 50 });
      notesStore.patch({ items: result.items || [], total: result.total || 0, loading: false });
    } catch (error) {
      notesStore.patch({ loading: false, error: error.message });
    }
  }

  async save(note) {
    notesStore.patch({ loading: true, error: '' });
    try {
      const result = note.id ? await notesApi.update(note.id, note) : await notesApi.create(note);
      const items = note.id ? this.state.items.map((item) => item.id === note.id ? result.item : item) : [result.item, ...this.state.items];
      notesStore.patch({ items, total: items.length, editing: null, loading: false });
    } catch (error) {
      notesStore.patch({ loading: false, error: error.message });
    }
  }

  async remove(note) {
    const t = (key, fallback, values) => this.context?.i18n?.t(key, fallback, values) || fallback;
    const dialog = this.shadowRoot.querySelector('ui-dialog');
    const confirmed = await dialog.open({
      title: t('notes.dialog.deleteTitle', '删除笔记'),
      message: t('notes.dialog.deleteMessage', '确定删除“{{title}}”吗？此操作无法撤销。', { title: note.title }),
      confirmLabel: t('notes.dialog.delete', '删除'),
      cancelLabel: t('notes.dialog.keep', '保留'),
    });
    if (!confirmed) return;
    try {
      await notesApi.remove(note.id);
      const items = this.state.items.filter((item) => item.id !== note.id);
      notesStore.patch({ items, total: Math.max(0, this.state.total - 1) });
    } catch (error) {
      notesStore.patch({ error: error.message });
    }
  }

  render() {
    const t = (key, fallback, values) => this.context?.i18n?.t(key, fallback, values) || fallback;
    const editing = this.state?.editing;
    const items = this.state?.items || [];
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; animation: nova-fade-in var(--transition-slow) both; }
        .head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--spacing-3); margin-bottom: var(--spacing-6); }
        .eyebrow { color: hsl(var(--accent)); font-size: var(--font-size-sm); font-weight: 700; }
        h1 { margin: var(--spacing-1) 0 0; font-size: var(--font-size-xl); line-height: var(--line-height-tight); }
        .muted { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-3); }
        .note { display: flex; flex-direction: column; gap: var(--spacing-3); min-height: var(--spacing-12); }
        .note-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-3); }
        .note-title { display: flex; align-items: flex-start; gap: var(--spacing-2); min-width: var(--spacing-0); }
        .note-title ui-icon { color: hsl(var(--accent)); margin-top: var(--spacing-1); }
        .note-title strong { overflow-wrap: anywhere; font-size: var(--font-size-md); }
        .note-content { margin: 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); white-space: pre-wrap; overflow-wrap: anywhere; }
        .note-foot { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); margin-top: auto; color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
        .actions { display: flex; gap: var(--spacing-1); }
        .empty { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-3); padding: var(--spacing-8) var(--spacing-3); border: var(--border-width) dashed hsl(var(--border)); border-radius: var(--radius-lg); text-align: center; }
        .empty ui-icon { width: var(--icon-size-lg); height: var(--icon-size-lg); color: hsl(var(--accent)); }
        .empty p { margin: 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .error { margin-bottom: var(--spacing-3); padding: var(--spacing-3); border-radius: var(--radius); background: hsl(var(--danger) / 0.1); color: hsl(var(--danger)); font-size: var(--font-size-sm); }
        .loading { opacity: 0.62; pointer-events: none; }
        @media (max-width: 48rem) { .list { grid-template-columns: 1fr; } }
        @media (max-width: 40rem) { .head { align-items: flex-start; flex-direction: column; } }
      </style>
      <section class="${this.state?.loading ? 'loading' : ''}"><header class="head"><div><div class="eyebrow">${escapeHtml(t('notes.eyebrow', 'Nova / 笔记'))}</div><h1>${escapeHtml(t('notes.title', '把值得留下的，放在这里。'))}</h1><span class="muted">${escapeHtml(t('notes.subtitle', '从一个标题开始，给想法一个可以回来的地方。'))}</span></div><ui-button class="new"><ui-icon name="plus"></ui-icon>${escapeHtml(t('notes.new', '新建笔记'))}</ui-button></header>${this.state?.error ? `<div class="error">${escapeHtml(this.state.error)}</div>` : ''}${editing ? '<notes-editor></notes-editor>' : `<div class="list">${items.length ? items.map((note) => `<ui-card><article class="note"><div class="note-head"><div class="note-title"><ui-icon name="note"></ui-icon><strong>${escapeHtml(note.title)}</strong></div><div class="actions"><ui-button class="edit" data-id="${note.id}" variant="ghost" size="sm" aria-label="${escapeHtml(t('common.actions.edit', '编辑'))}"><ui-icon name="settings"></ui-icon></ui-button><ui-button class="delete" data-id="${note.id}" variant="ghost" size="sm" aria-label="${escapeHtml(t('common.actions.delete', '删除'))}"><ui-icon name="close"></ui-icon></ui-button></div></div><p class="note-content">${escapeHtml(note.content || t('notes.noContent', '暂无正文'))}</p><div class="note-foot"><span><ui-icon name="clock"></ui-icon> ${escapeHtml(new Date(note.updated_at).toLocaleDateString())}</span><ui-badge>${escapeHtml(t('notes.badge', '已保存'))}</ui-badge></div></article></ui-card>`).join('') : `<div class="empty"><ui-icon name="spark"></ui-icon><p>${escapeHtml(t('notes.empty', '这里还很安静，写下第一条笔记吧。'))}</p><ui-button class="empty-new" size="sm">${escapeHtml(t('notes.new', '新建笔记'))}</ui-button></div>`}</div>`}<ui-dialog></ui-dialog></section>
    `;
    const editor = this.shadowRoot.querySelector('notes-editor');
    if (editor) {
      editor.context = this.context;
      editor.note = editing;
    }
    this.shadowRoot.querySelector('.new, .empty-new')?.addEventListener('click', () => notesStore.patch({ editing: { title: '', content: '' } }));
    this.shadowRoot.querySelector('notes-editor')?.addEventListener('editor-cancel', () => notesStore.patch({ editing: null }));
    this.shadowRoot.querySelector('notes-editor')?.addEventListener('editor-save', (event) => this.save(event.detail.note));
    this.shadowRoot.querySelectorAll('.edit').forEach((button) => button.addEventListener('click', () => {
      const note = this.state.items.find((item) => item.id === Number(button.dataset.id));
      if (note) notesStore.patch({ editing: { ...note } });
    }));
    this.shadowRoot.querySelectorAll('.delete').forEach((button) => button.addEventListener('click', () => {
      const note = this.state.items.find((item) => item.id === Number(button.dataset.id));
      if (note) this.remove(note);
    }));
  }
}

defineOnce('notes-view', NotesView);

export function createNotesView(context) {
  const view = document.createElement('notes-view');
  view.context = context;
  return view;
}
