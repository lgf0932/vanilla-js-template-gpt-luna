import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiThemeSwitch extends NovaElement {
  static observedAttributes = ['value'];

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  get value() { return this.getAttribute('value') || 'system'; }
  set value(value) { this.setAttribute('value', value); }

  render() {
    const options = [
      { value: 'system', label: '系统', icon: 'monitor' },
      { value: 'light', label: '浅色', icon: 'sun' },
      { value: 'dark', label: '深色', icon: 'moon' },
    ];
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; }
        .switch { display: inline-flex; align-items: center; gap: var(--spacing-1); padding: var(--spacing-1); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius-lg); background: hsl(var(--muted)); }
        button { display: inline-flex; align-items: center; gap: var(--spacing-1); min-height: var(--spacing-8); padding: 0 var(--spacing-2); border: 0; border-radius: var(--radius); background: transparent; color: hsl(var(--muted-foreground)); cursor: pointer; font-size: var(--font-size-xs); }
        button.active { background: hsl(var(--card)); color: hsl(var(--foreground)); box-shadow: var(--shadow-sm); }
        button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
        ui-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
        @media (max-width: 40rem) { button { padding-inline: var(--spacing-1); } button span { display: none; } }
      </style>
      <div class="switch" role="radiogroup" aria-label="主题模式">${options.map((option) => `<button type="button" role="radio" aria-checked="${option.value === this.value}" class="${option.value === this.value ? 'active' : ''}" data-value="${option.value}"><ui-icon name="${option.icon}"></ui-icon><span>${escapeHtml(option.label)}</span></button>`).join('')}</div>
    `;
    this.shadowRoot.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      this.setAttribute('value', button.dataset.value);
      this.emit('theme-change', { value: button.dataset.value });
    }));
  }
}

defineOnce('ui-theme-switch', UiThemeSwitch);
export { UiThemeSwitch };
