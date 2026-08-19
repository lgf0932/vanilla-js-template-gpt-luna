import '../../../components/ui/ui-card.js';
import '../../../components/ui/ui-icon.js';
import { NovaElement, defineOnce, escapeHtml } from '../../../components/ui/base.js';

class DashboardMetric extends NovaElement {
  static observedAttributes = ['icon', 'value', 'label'];

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .metric { display: flex; align-items: center; gap: var(--spacing-3); padding: var(--spacing-3); }
        .icon { display: grid; place-items: center; width: var(--spacing-10); height: var(--spacing-10); border-radius: var(--radius); background: hsl(var(--accent) / 0.12); color: hsl(var(--accent)); }
        strong { display: block; font-size: var(--font-size-xl); line-height: var(--line-height-tight); }
        span { color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
      </style>
      <ui-card><div class="metric"><span class="icon"><ui-icon name="${escapeHtml(this.getAttribute('icon') || 'spark')}"></ui-icon></span><div><strong>${escapeHtml(this.getAttribute('value') || '—')}</strong><span>${escapeHtml(this.getAttribute('label') || '')}</span></div></div></ui-card>
    `;
  }
}

defineOnce('dashboard-metric', DashboardMetric);
export { DashboardMetric };
