import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiTabs extends NovaElement {
  static observedAttributes = ['value'];
  #tabs = [];

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  set tabs(value) { this.#tabs = Array.isArray(value) ? value : []; this.render(); }
  get value() { return this.getAttribute('value') || this.#tabs[0]?.value || ''; }
  set value(value) { this.setAttribute('value', value ?? ''); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .tabs { display: flex; gap: var(--spacing-1); overflow: hidden; border-bottom: var(--border-width) solid hsl(var(--border)); }
        button { min-height: var(--control-height); padding: 0 var(--spacing-3); border: 0; border-bottom: var(--border-width) solid transparent; background: transparent; color: hsl(var(--muted-foreground)); cursor: pointer; font-size: var(--font-size-sm); }
        button.active { border-bottom-color: hsl(var(--accent)); color: hsl(var(--foreground)); font-weight: 700; }
        button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
      </style>
      <div class="tabs" role="tablist">${this.#tabs.map((tab) => `<button type="button" role="tab" data-value="${escapeHtml(tab.value)}" aria-selected="${tab.value === this.value}" class="${tab.value === this.value ? 'active' : ''}">${escapeHtml(tab.label)}</button>`).join('')}</div>
    `;
    this.shadowRoot.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      this.setAttribute('value', button.dataset.value);
      this.emit('tabs-change', { value: button.dataset.value });
      this.render();
    }));
  }
}

defineOnce('ui-tabs', UiTabs);
export { UiTabs };
