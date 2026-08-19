import { NovaElement, defineOnce, escapeHtml } from './base.js';

class UiSelect extends NovaElement {
  #options = [];
  #open = false;
  #activeIndex = 0;

  connectedCallback() {
    this.render();
  }

  set options(value) {
    this.#options = Array.isArray(value) ? value : [];
    this.render();
  }

  get options() { return this.#options; }
  get value() { return this.getAttribute('value') || this.#options[0]?.value || ''; }
  set value(value) { this.setAttribute('value', value ?? ''); this.render(); }

  toggle() {
    this.#open = !this.#open;
    this.render();
  }

  choose(option) {
    this.setAttribute('value', option.value);
    this.#open = false;
    this.emit('ui-change', { value: option.value, option });
    this.render();
  }

  render() {
    const label = this.getAttribute('label') || '';
    const selected = this.#options.find((option) => option.value === this.value) || this.#options[0] || { value: '', label: '' };
    this.#activeIndex = Math.max(0, this.#options.findIndex((option) => option.value === selected.value));
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: relative; display: block; }
        .label { display: block; margin-bottom: var(--spacing-1); color: hsl(var(--foreground)); font-size: var(--font-size-sm); font-weight: 600; }
        .trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: var(--control-height); gap: var(--spacing-2); padding: 0 var(--spacing-3); border: var(--border-width) solid hsl(var(--input)); border-radius: var(--radius); background: hsl(var(--background)); color: hsl(var(--foreground)); cursor: pointer; text-align: left; }
        .trigger:focus-visible { outline: none; box-shadow: var(--focus-ring); border-color: hsl(var(--ring)); }
        .chevron { color: hsl(var(--muted-foreground)); transition: transform var(--transition-fast); }
        .chevron.open { transform: rotate(180deg); }
        .menu { position: absolute; z-index: var(--z-dialog); top: calc(100% + var(--spacing-1)); left: var(--spacing-0); right: var(--spacing-0); display: ${this.#open ? 'flex' : 'none'}; flex-direction: column; gap: var(--spacing-1); padding: var(--spacing-1); border: var(--border-width) solid hsl(var(--border)); border-radius: var(--radius); background: hsl(var(--card)); box-shadow: var(--shadow-md); }
        .option { display: flex; align-items: center; min-height: var(--spacing-8); padding: 0 var(--spacing-2); border: 0; border-radius: var(--radius-sm); background: transparent; color: hsl(var(--foreground)); cursor: pointer; text-align: left; }
        .option:hover, .option.active { background: hsl(var(--muted)); }
        .option.selected { color: hsl(var(--accent)); font-weight: 700; }
      </style>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ''}
      <button class="trigger" type="button" aria-haspopup="listbox" aria-expanded="${this.#open}"><span>${escapeHtml(selected.label)}</span><span class="chevron ${this.#open ? 'open' : ''}">⌄</span></button>
      <div class="menu" role="listbox" tabindex="-1">${this.#options.map((option, index) => `<button type="button" class="option ${option.value === selected.value ? 'selected' : ''} ${index === this.#activeIndex ? 'active' : ''}" data-value="${escapeHtml(option.value)}" role="option" aria-selected="${option.value === selected.value}">${escapeHtml(option.label)}</button>`).join('')}</div>
    `;
    this.shadowRoot.querySelector('.trigger')?.addEventListener('click', () => this.toggle());
    this.shadowRoot.querySelector('.trigger')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.toggle(); }
      if (event.key === 'Escape') { this.#open = false; this.render(); }
      if (event.key === 'ArrowDown') { event.preventDefault(); this.#activeIndex = Math.min(this.#options.length - 1, this.#activeIndex + 1); this.#open = true; this.render(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); this.#activeIndex = Math.max(0, this.#activeIndex - 1); this.#open = true; this.render(); }
    });
    this.shadowRoot.querySelectorAll('.option').forEach((option) => option.addEventListener('click', () => {
      const selectedOption = this.#options.find((item) => item.value === option.dataset.value);
      if (selectedOption) this.choose(selectedOption);
    }));
  }
}

defineOnce('ui-select', UiSelect);
export { UiSelect };
