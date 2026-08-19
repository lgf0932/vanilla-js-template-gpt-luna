import '../../../components/ui/ui-button.js';
import '../../../components/ui/ui-card.js';
import '../../../components/ui/ui-input.js';
import '../../../components/ui/ui-textarea.js';
import '../../../components/ui/ui-icon.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../components/ui/base.js';

class NotesEditor extends NovaElement {
  set note(value) {
    this._note = value || { title: '', content: '' };
    if (this.isConnected) this.render();
  }

  get note() { return this._note || { title: '', content: '' }; }

  connectedCallback() { this.render(); }

  render() {
    const isNew = !this.note.id;
    const t = (key, fallback) => this.context?.i18n?.t(key, fallback) || fallback;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .editor { display: flex; flex-direction: column; gap: var(--spacing-3); }
        .editor-head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); }
        .editor-head h2 { margin: 0; font-size: var(--font-size-md); }
        .actions { display: flex; justify-content: flex-end; gap: var(--spacing-2); }
      </style>
      <ui-card><span slot="title">${escapeHtml(t(isNew ? 'notes.editor.new' : 'notes.editor.edit', isNew ? '新建笔记' : '编辑笔记'))}</span><div class="editor"><ui-input name="title" label="${escapeHtml(t('notes.editor.title', '标题'))}" placeholder="${escapeHtml(t('notes.editor.titlePlaceholder', '给这条记录一个清晰标题'))}" value="${escapeHtml(this.note.title)}" required></ui-input><ui-textarea name="content" label="${escapeHtml(t('notes.editor.content', '内容'))}" placeholder="${escapeHtml(t('notes.editor.contentPlaceholder', '记录上下文、链接或下一步…'))}" rows="10" value="${escapeHtml(this.note.content)}"></ui-textarea><div class="actions"><ui-button class="cancel" variant="ghost">${escapeHtml(t('notes.editor.cancel', '取消'))}</ui-button><ui-button class="save"><ui-icon name="check"></ui-icon>${escapeHtml(t('notes.editor.save', '保存'))}</ui-button></div></div></ui-card>
    `;
    this.shadowRoot.querySelector('.cancel')?.addEventListener('click', () => this.emit('editor-cancel'));
    this.shadowRoot.querySelector('.save')?.addEventListener('click', () => {
      const title = this.shadowRoot.querySelector('ui-input[name="title"]')?.value?.trim() || '';
      const content = this.shadowRoot.querySelector('ui-textarea[name="content"]')?.value || '';
      if (!title) {
        this.shadowRoot.querySelector('ui-input[name="title"]')?.setAttribute('error', t('notes.editor.titleRequired', '请输入标题'));
        return;
      }
      this.emit('editor-save', { note: { ...this.note, title, content } });
    });
  }
}

defineOnce('notes-editor', NotesEditor);
export { NotesEditor };
