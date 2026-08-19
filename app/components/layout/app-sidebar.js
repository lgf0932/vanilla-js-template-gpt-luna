import { NovaElement, defineOnce, escapeHtml } from '../ui/base.js';

class AppSidebar extends NovaElement {
  connectedCallback() {
    this.items = [];
    this.activePath = '';
    this.labels = {};
    this.render();
  }

  setItems(items) {
    this.items = items || [];
    this.render();
  }

  setLabels(labels = {}) {
    this.labels = labels;
    this.render();
  }

  setActive(path) {
    this.activePath = path;
    this.shadowRoot.querySelectorAll('[data-path]').forEach((item) => item.classList.toggle('active', item.dataset.path === path));
  }

  setOpen(open) {
    this.toggleAttribute('open', open);
    this.render();
  }

  render() {
    const labels = this.labels || {};
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; z-index: var(--z-sidebar); inset: var(--header-height) auto var(--spacing-0) var(--spacing-0); display: block; width: var(--sidebar-width); overflow: hidden; border-right: var(--border-width) solid hsl(var(--border)); background: hsl(var(--card)); color: hsl(var(--foreground)); transition: transform var(--transition-normal), width var(--transition-normal); }
        .nav { display: flex; flex-direction: column; gap: var(--spacing-1); height: 100%; padding: var(--spacing-4) var(--spacing-3); overflow: hidden; }
        .label { padding: 0 var(--spacing-2) var(--spacing-2); color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        button { display: flex; align-items: center; gap: var(--spacing-3); min-height: var(--control-height); width: 100%; padding: 0 var(--spacing-2); border: var(--border-width) solid transparent; border-radius: var(--radius); background: transparent; color: hsl(var(--muted-foreground)); cursor: pointer; text-align: left; font-size: var(--font-size-sm); font-weight: 600; }
        button:hover { background: hsl(var(--muted)); color: hsl(var(--foreground)); }
        button.active { background: hsl(var(--accent) / 0.12); color: hsl(var(--accent)); }
        button.sub { padding-inline-start: var(--spacing-5); font-size: var(--font-size-xs); }
        button:focus-visible { outline: none; box-shadow: var(--focus-ring); }
        ui-icon { width: var(--icon-size); height: var(--icon-size); }
        .close { display: none; align-self: flex-end; width: auto; }
        @media (max-width: 40rem) { :host { transform: translateX(-100%); box-shadow: var(--shadow-lg); } :host([open]) { transform: translateX(var(--spacing-0)); } .close { display: flex; } }
      </style>
      <nav class="nav" aria-label="${escapeHtml(labels.navigation || '主导航')}"><button class="close" type="button" aria-label="${escapeHtml(labels.close || '关闭菜单')}"><ui-icon name="close"></ui-icon></button><span class="label">${escapeHtml(labels.workspace || '工作台')}</span>${this.items.map((item) => `<button type="button" data-path="${escapeHtml(item.path)}" class="${item.path === this.activePath ? 'active' : ''}${item.submodule ? ' sub' : ''}"><ui-icon name="${escapeHtml(item.icon)}"></ui-icon><span>${escapeHtml(item.label)}</span></button>`).join('')}</nav>
    `;
    this.shadowRoot.querySelector('.close')?.addEventListener('click', () => this.emit('sidebar-close'));
    this.shadowRoot.querySelectorAll('[data-path]').forEach((button) => button.addEventListener('click', () => {
      this.emit('sidebar-navigate', { path: button.dataset.path });
      this.removeAttribute('open');
    }));
  }
}

defineOnce('app-sidebar', AppSidebar);
export { AppSidebar };
