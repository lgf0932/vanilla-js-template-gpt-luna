import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiToast extends NovaElement {
  #timer;

  connectedCallback() {
    this.render();
  }

  show(message, type = 'default', duration = 3200) {
    clearTimeout(this.#timer);
    this.setAttribute('message', message);
    this.setAttribute('type', type);
    this.setAttribute('open', '');
    this.render();
    if (duration > 0) this.#timer = setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.removeAttribute('open');
    this.render();
  }

  render() {
    const message = this.getAttribute('message') || '';
    const type = this.getAttribute('type') || 'default';
    const open = this.hasAttribute('open');
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; z-index: var(--z-dialog); right: var(--spacing-4); bottom: var(--spacing-4); display: ${open ? 'block' : 'none'}; max-width: var(--content-max-width); }
        .toast { display: flex; align-items: center; gap: var(--spacing-3); min-width: var(--spacing-12); padding: var(--spacing-3); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius); background: hsl(var(--card)); color: hsl(var(--card-foreground)); box-shadow: var(--shadow-lg); animation: nova-fade-in var(--transition-normal) both; }
        .message { flex: 1; font-size: var(--font-size-sm); }
        .close { border: 0; background: transparent; color: hsl(var(--muted-foreground)); cursor: pointer; font-size: var(--font-size-lg); }
        .success { border-color: hsl(var(--success) / 0.5); }
        .error { border-color: hsl(var(--danger) / 0.5); }
      </style>
      <div class="toast ${type}" role="status"><span class="message">${escapeHtml(message)}</span><button class="close" type="button" aria-label="关闭">×</button></div>
    `;
    this.shadowRoot.querySelector('.close')?.addEventListener('click', () => this.hide());
  }
}

defineOnce('ui-toast', UiToast);
export { UiToast };
