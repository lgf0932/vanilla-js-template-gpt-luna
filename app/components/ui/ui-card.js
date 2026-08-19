import { NovaElement, defineOnce } from './base.js';

class UiCard extends NovaElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
          padding: var(--spacing-3);
          border: var(--border-width) solid hsl(var(--border));
          border-radius: var(--radius-lg);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          box-shadow: var(--shadow-sm);
        }
        .header:empty { display: none; }
        .header { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); }
        .title { font-size: var(--font-size-md); font-weight: 700; }
        .description { color: hsl(var(--muted-foreground)); font-size: var(--font-size-sm); }
      </style>
      <section>
        <header class="header"><div class="title"><slot name="title"></slot></div><slot name="actions"></slot></header>
        <div class="description"><slot name="description"></slot></div>
        <div><slot></slot></div>
      </section>
    `;
  }
}

defineOnce('ui-card', UiCard);
export { UiCard };
