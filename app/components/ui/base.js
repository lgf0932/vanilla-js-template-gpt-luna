export class NovaElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  getBooleanAttribute(name) {
    return this.hasAttribute(name) && this.getAttribute(name) !== 'false';
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function defineOnce(name, elementClass) {
  if (!customElements.get(name)) {
    customElements.define(name, elementClass);
  }
}
