import test from 'node:test';
import assert from 'node:assert/strict';
import { I18n } from './i18n.js';

test('i18n switches language and loads submodule fallback bundles in file mode', async () => {
  const previousLocation = globalThis.location;
  globalThis.location = { protocol: 'file:' };
  try {
    const i18n = new I18n('zh-CN');
    await i18n.init();
    await i18n.loadModule('settings/display');
    assert.equal(i18n.t('settingsDisplay.title', ''), '显示与语言');
    let changedLanguage = '';
    i18n.addEventListener('language-change', (event) => { changedLanguage = event.detail.language; });
    await i18n.setLanguage('en');
    assert.equal(changedLanguage, 'en');
    assert.equal(i18n.t('common.language', ''), 'Language');
    assert.equal(i18n.t('settingsDisplay.title', ''), 'Display & language');
  } finally {
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
  }
});

test('i18n requests submodule locale files from their actual directory', async () => {
  const previousLocation = globalThis.location;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.location = { protocol: 'http:' };
  globalThis.fetch = async (url) => {
    requests.push(url);
    return {
      ok: true,
      async json() {
        return url.includes('/app/locales/')
          ? { common: { language: 'Language' } }
          : { settingsDisplay: { title: 'Display & language' } };
      },
    };
  };
  try {
    const i18n = new I18n('en');
    await i18n.init();
    await i18n.loadModule('settings/display');
    assert.deepEqual(requests, [
      '/app/locales/en.json',
      '/app/modules/settings/submodules/display/locales/en.json',
    ]);
    assert.equal(i18n.t('settingsDisplay.title', ''), 'Display & language');
  } finally {
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousFetch === undefined) delete globalThis.fetch;
    else globalThis.fetch = previousFetch;
  }
});
