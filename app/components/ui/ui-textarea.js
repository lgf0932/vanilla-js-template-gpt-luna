import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiTextarea extends NovaElement {
  static observedAttributes = ['label', 'name', 'placeholder', 'value', 'rows', 'error'];

  connectedCallback() { this.render(); }
  attributeChangedCallback(name) { if (this.isConnected && name !== 'value') this.render(); }

  get value() { return this.shadowRoot?.querySelector('textarea')?.value ?? ''; }
  set value(value) { const textarea = this.shadowRoot?.querySelector('textarea'); if (textarea) textarea.value = value ?? ''; }

  render() {
    const label = this.getAttribute('label') || '';
    const name = this.getAttribute('name') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') || '';
    const rows = this.getAttribute('rows') || '8';
    const error = this.getAttribute('error') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        label { display: flex; flex-direction: column; gap: var(--spacing-1); color: hsl(var(--foreground)); font-size: var(--font-size-sm); font-weight: 600; }
        textarea { width: 100%; min-height: var(--spacing-12); resize: vertical; border: var(--border-width) solid hsl(var(--input)); border-radius: var(--radius); padding: var(--spacing-2) var(--spacing-3); background: hsl(var(--background)); color: hsl(var(--foreground)); outline: none; line-height: var(--line-height-normal); transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }
        textarea::placeholder { color: hsl(var(--muted-foreground)); }
        textarea:focus { border-color: hsl(var(--ring)); box-shadow: var(--focus-ring); }
        .error { color: hsl(var(--danger)); font-size: var(--font-size-xs); font-weight: 400; }
      </style>
      <label>${escapeHtml(label)}<textarea name="${escapeHtml(name)}" rows="${escapeHtml(rows)}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>${error ? `<span class="error">${escapeHtml(error)}</span>` : ''}</label>
    `;
    this.shadowRoot.querySelector('textarea')?.addEventListener('input', (event) => {
      this.emit('ui-input', { value: event.target.value, name });
    });
  }
}

defineOnce('ui-textarea', UiTextarea);
export { UiTextarea };
