import '../../../../components/ui/ui-button.js';
import '../../../../components/ui/ui-card.js';
import '../../../../components/ui/ui-icon.js';
import { NovaElement, defineOnce } from '../../../../components/ui/base.js';

class NotesTagsView extends NovaElement {
  connectedCallback() { this.render(); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; animation: nova-fade-in var(--transition-slow) both; }
        h1 { margin: 0; font-size: var(--font-size-xl); }
        .subtitle { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .empty { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-3); padding: var(--spacing-10) var(--spacing-3); text-align: center; }
        .empty ui-icon { width: var(--icon-size-lg); height: var(--icon-size-lg); color: hsl(var(--accent)); }
        .empty p { margin: 0; color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
      </style>
      <section><h1>笔记标签</h1><p class="subtitle">用标签为不同主题建立轻量索引。</p><ui-card><div class="empty"><ui-icon name="layers"></ui-icon><p>还没有标签，创建第一组主题吧。</p><ui-button class="create">新建标签</ui-button></div></ui-card></section>
    `;
    this.shadowRoot.querySelector('.create')?.addEventListener('click', () => this.context?.router?.navigate('/notes'));
  }
}

defineOnce('notes-tags-view', NotesTagsView);
export function createNotesTagsView(context) { const view = document.createElement('notes-tags-view'); view.context = context; return view; }
export const createTagsView = createNotesTagsView;
