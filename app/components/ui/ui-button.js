import { NovaElement, defineOnce } from './base.js';

class UiButton extends NovaElement {
  static observedAttributes = ['variant', 'size', 'disabled', 'type', 'aria-label'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'md';
    const type = this.getAttribute('type') || 'button';
    const label = this.getAttribute('aria-label') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; }
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-2);
          min-height: var(--control-height);
          border: var(--border-width) solid transparent;
          border-radius: var(--radius);
          padding: 0 var(--spacing-3);
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: 600;
          line-height: var(--line-height-tight);
          transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast), opacity var(--transition-fast);
        }
        button:hover:not(:disabled) { opacity: 0.88; }
        button:active:not(:disabled) { transform: translateY(var(--spacing-0)); }
        button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
        button:disabled { cursor: not-allowed; opacity: 0.5; }
        button.secondary { background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); }
        button.outline { background: transparent; color: hsl(var(--foreground)); border-color: hsl(var(--border)); }
        button.ghost { background: transparent; color: hsl(var(--muted-foreground)); }
        button.danger { background: hsl(var(--danger)); color: hsl(var(--accent-foreground)); }
        button.sm { min-height: var(--spacing-8); padding-inline: var(--spacing-2); font-size: var(--font-size-xs); }
        button.lg { min-height: var(--spacing-12); padding-inline: var(--spacing-5); font-size: var(--font-size-md); }
        ::slotted(ui-icon) { width: var(--icon-size-sm); height: var(--icon-size-sm); }
      </style>
      <button type="${type}" class="${variant} ${size}" ${this.disabled ? 'disabled' : ''} ${label ? `aria-label="${label}"` : ''}>
        <slot></slot>
      </button>
    `;
  }
}

defineOnce('ui-button', UiButton);
export { UiButton };
