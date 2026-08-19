const SUPPORTED_LANGUAGES = ['zh-CN', 'zh-TW', 'en'];

const FALLBACK_BUNDLES = {
  'zh-CN': {
    common: { actions: { enter: '进入工作台', back: '返回首页' } },
    sidebar: { dashboard: '概览', notes: { _label: '笔记' }, settings: { _label: '设置' } },
    landing: { eyebrow: '你的个人工作台', title: '把想法，整理成下一步。', lead: 'Nova 是一个轻盈、清晰、只属于你的工作台。', start: '开始使用', explore: '了解 Nova' },
    auth: { welcome: '欢迎回到你的节奏。', intro: '一个安静、清晰、只属于你的工作台。', quote: '整理不是减法，是为重要的事留出空间。' },
  },
  'zh-TW': {
    common: { actions: { enter: '進入工作台', back: '返回首頁' } },
    sidebar: { dashboard: '概覽', notes: { _label: '筆記' }, settings: { _label: '設定' } },
    landing: { eyebrow: '你的個人工作台', title: '把想法，整理成下一步。', lead: 'Nova 是一個輕盈、清晰、只屬於你的工作台。', start: '開始使用', explore: '了解 Nova' },
    auth: { welcome: '歡迎回到你的節奏。', intro: '一個安靜、清晰、只屬於你的工作台。', quote: '整理不是減法，是為重要的事留出空間。' },
  },
  en: {
    common: { actions: { enter: 'Enter workspace', back: 'Back home' } },
    sidebar: { dashboard: 'Overview', notes: { _label: 'Notes' }, settings: { _label: 'Settings' } },
    landing: { eyebrow: 'Your personal workspace', title: 'Turn ideas into the next step.', lead: 'Nova is a light, clear workspace that belongs to you.', start: 'Get started', explore: 'Explore Nova' },
    auth: { welcome: 'Welcome back to your rhythm.', intro: 'A quiet, clear workspace that belongs to you.', quote: 'Organization makes room for what matters.' },
  },
};

function getNested(object, key) {
  return key.split('.').reduce((value, part) => value?.[part], object);
}

function isFileMode() {
  return globalThis.location?.protocol === 'file:';
}

export class I18n extends EventTarget {
  #language;
  #bundles = new Map();
  #moduleBundles = new Map();
  #moduleNamespaces = new Set();

  constructor(language = 'zh-CN') {
    super();
    this.#language = SUPPORTED_LANGUAGES.includes(language) ? language : 'zh-CN';
  }

  get language() { return this.#language; }

  async init() {
    await this.#loadBundle(this.#language);
    if (globalThis.document) document.documentElement.lang = this.#language;
    return this;
  }

  async setLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) return;
    await this.#loadBundle(language);
    this.#language = language;
    await Promise.all([...this.#moduleNamespaces].map((namespace) => this.loadModule(namespace)));
    if (globalThis.document) document.documentElement.lang = language;
    this.dispatchEvent(new CustomEvent('language-change', { detail: { language } }));
  }

  async loadModule(namespace) {
    this.#moduleNamespaces.add(namespace);
    const key = `${namespace}:${this.#language}`;
    if (this.#moduleBundles.has(key)) return this.#moduleBundles.get(key);
    if (isFileMode()) {
      this.#moduleBundles.set(key, {});
      return {};
    }
    try {
      const response = await fetch(`/app/modules/${namespace}/locales/${this.#language}.json`);
      if (!response.ok) throw new Error(`无法加载模块语言包 ${namespace}`);
      const bundle = await response.json();
      this.#moduleBundles.set(key, bundle);
      return bundle;
    } catch {
      this.#moduleBundles.set(key, {});
      return {};
    }
  }

  t(key, fallback = key, values = {}) {
    let value = getNested(this.#bundles.get(this.#language) || {}, key);
    if (value === undefined) {
      for (const [bundleKey, bundle] of this.#moduleBundles.entries()) {
        if (!bundleKey.endsWith(`:${this.#language}`)) continue;
        value = getNested(bundle, key);
        if (value !== undefined) break;
      }
    }
    if (typeof value !== 'string') value = fallback;
    return Object.entries(values).reduce((result, [name, replacement]) => result.replaceAll(`{{${name}}}`, String(replacement)), value);
  }

  async #loadBundle(language) {
    if (this.#bundles.has(language)) return;
    if (isFileMode()) {
      this.#bundles.set(language, FALLBACK_BUNDLES[language] || FALLBACK_BUNDLES['zh-CN']);
      return;
    }
    try {
      const response = await fetch(`/app/locales/${language}.json`);
      if (!response.ok) throw new Error(`无法加载语言包 ${language}`);
      this.#bundles.set(language, await response.json());
    } catch {
      this.#bundles.set(language, FALLBACK_BUNDLES[language] || FALLBACK_BUNDLES['zh-CN']);
    }
  }
}

export { FALLBACK_BUNDLES, SUPPORTED_LANGUAGES };
