import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiInput extends NovaElement {
  static observedAttributes = ['label', 'name', 'type', 'placeholder', 'value', 'disabled', 'required', 'error'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name) {
    if (this.isConnected && name !== 'value') this.render();
  }

  get value() {
    return this.shadowRoot?.querySelector('input')?.value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this.setAttribute('value', value ?? '');
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.value = value ?? '';
  }

  focus() {
    this.shadowRoot?.querySelector('input')?.focus();
  }

  render() {
    const label = this.getAttribute('label') || '';
    const name = this.getAttribute('name') || '';
    const type = this.getAttribute('type') || 'text';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') || '';
    const error = this.getAttribute('error') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        label { display: flex; flex-direction: column; gap: var(--spacing-1); color: hsl(var(--foreground)); font-size: var(--font-size-sm); font-weight: 600; }
        input { width: 100%; min-height: var(--control-height); border: var(--border-width) solid hsl(var(--input)); border-radius: var(--radius); padding: 0 var(--spacing-3); background: hsl(var(--background)); color: hsl(var(--foreground)); outline: none; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }
        input::placeholder { color: hsl(var(--muted-foreground)); }
        input:focus { border-color: hsl(var(--ring)); box-shadow: var(--focus-ring); }
        input:disabled { cursor: not-allowed; opacity: 0.6; }
        .error { color: hsl(var(--danger)); font-size: var(--font-size-xs); font-weight: 400; }
      </style>
      <label>${escapeHtml(label)}<input name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${this.hasAttribute('disabled') ? 'disabled' : ''} ${this.hasAttribute('required') ? 'required' : ''} />${error ? `<span class="error">${escapeHtml(error)}</span>` : ''}</label>
    `;
    this.shadowRoot.querySelector('input')?.addEventListener('input', (event) => {
      this.emit('ui-input', { value: event.target.value, name });
    });
  }
}

defineOnce('ui-input', UiInput);
export { UiInput };
