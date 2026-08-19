import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiDialog extends NovaElement {
  #resolver;

  connectedCallback() { this.render(); }

  open({ title = '', message = '', confirmLabel = '确认', cancelLabel = '取消' } = {}) {
    this.setAttribute('open', '');
    this.setAttribute('title', title);
    this.setAttribute('message', message);
    this.setAttribute('confirm-label', confirmLabel);
    this.setAttribute('cancel-label', cancelLabel);
    this.render();
    return new Promise((resolve) => { this.#resolver = resolve; });
  }

  close(value) {
    this.removeAttribute('open');
    this.render();
    this.#resolver?.(value);
    this.#resolver = null;
  }

  render() {
    const open = this.hasAttribute('open');
    const title = this.getAttribute('title') || '';
    const message = this.getAttribute('message') || '';
    const confirmLabel = this.getAttribute('confirm-label') || '确认';
    const cancelLabel = this.getAttribute('cancel-label') || '取消';
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; inset: var(--spacing-0); z-index: var(--z-dialog); display: ${open ? 'grid' : 'none'}; place-items: center; padding: var(--spacing-4); }
        .backdrop { position: absolute; inset: var(--spacing-0); background: hsl(var(--foreground) / 0.5); }
        .panel { position: relative; display: flex; flex-direction: column; gap: var(--spacing-3); width: min(100%, var(--content-max-width)); max-width: var(--dialog-max-width); padding: var(--spacing-4); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius-lg); background: hsl(var(--card)); color: hsl(var(--card-foreground)); box-shadow: var(--shadow-lg); animation: nova-fade-in var(--transition-normal) both; }
        h2 { margin: var(--spacing-0); font-size: var(--font-size-lg); }
        p { margin: var(--spacing-0); color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
        .actions { display: flex; justify-content: flex-end; gap: var(--spacing-2); }
        button { min-height: var(--control-height); padding: 0 var(--spacing-3); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius); background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); cursor: pointer; }
        button.primary { border-color: transparent; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
      </style>
      <div class="backdrop"></div>
      <section class="panel" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>
        <div class="actions"><button class="cancel" type="button">${escapeHtml(cancelLabel)}</button><button class="primary confirm" type="button">${escapeHtml(confirmLabel)}</button></div>
      </section>
    `;
    this.shadowRoot.querySelector('.backdrop')?.addEventListener('click', () => this.close(false));
    this.shadowRoot.querySelector('.cancel')?.addEventListener('click', () => this.close(false));
    this.shadowRoot.querySelector('.confirm')?.addEventListener('click', () => this.close(true));
    this.shadowRoot.querySelector('.panel')?.addEventListener('keydown', (event) => { if (event.key === 'Escape') this.close(false); });
    if (open) queueMicrotask(() => this.shadowRoot.querySelector('.cancel')?.focus());
  }
}

defineOnce('ui-dialog', UiDialog);
export { UiDialog };
