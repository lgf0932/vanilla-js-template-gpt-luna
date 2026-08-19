import { NovaElement, defineOnce } from './base.js';

class UiBadge extends NovaElement {
  static observedAttributes = ['variant'];

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const variant = this.getAttribute('variant') || 'muted';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; }
        span { display: inline-flex; align-items: center; min-height: var(--spacing-6); padding: 0 var(--spacing-2); border-radius: var(--radius-sm); background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); font-weight: 600; }
        span.success { background: hsl(var(--success) / 0.14); color: hsl(var(--success)); }
        span.warning { background: hsl(var(--warning) / 0.16); color: hsl(var(--warning)); }
        span.danger { background: hsl(var(--danger) / 0.14); color: hsl(var(--danger)); }
        span.accent { background: hsl(var(--accent) / 0.16); color: hsl(var(--accent)); }
      </style>
      <span class="${variant}"><slot></slot></span>
    `;
  }
}

defineOnce('ui-badge', UiBadge);
export { UiBadge };
