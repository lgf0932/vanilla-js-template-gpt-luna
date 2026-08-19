import { NovaElement, defineOnce, escapeHtml } from '../ui/base.js';

class AppMain extends NovaElement {
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; min-width: var(--spacing-0); min-height: var(--spacing-0); overflow-y: auto; overflow-x: hidden; background: hsl(var(--background)); }
        .container { width: min(100%, var(--content-max-width)); min-height: 100%; margin: 0 auto; padding: var(--spacing-6); }
        .loading { display: grid; min-height: var(--spacing-12); place-items: center; color: hsl(var(--muted-foreground)); animation: nova-pulse var(--transition-slow) infinite; }
        .error { display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start; padding: var(--spacing-4); border: var(--border-width) solid hsl(var(--danger) / 0.32); border-radius: var(--radius); background: hsl(var(--danger) / 0.08); color: hsl(var(--danger)); }
        @media (max-width: 40rem) { .container { padding: var(--spacing-4); } }
      </style>
      <div class="container"><slot></slot><div class="loading" hidden>加载中…</div></div>
    `;
  }

  setView(view) {
    this.replaceChildren(view);
  }

  setLoading(loading) {
    const indicator = this.shadowRoot.querySelector('.loading');
    if (indicator) indicator.hidden = !loading;
    if (loading) this.replaceChildren();
  }

  showError(error) {
    this.replaceChildren();
    const block = document.createElement('div');
    block.className = 'error';
    block.innerHTML = `<strong>页面加载失败</strong><span>${escapeHtml(error?.message || '请稍后重试')}</span>`;
    this.append(block);
  }
}

defineOnce('app-main', AppMain);
export { AppMain };
