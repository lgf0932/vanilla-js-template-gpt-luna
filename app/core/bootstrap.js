import '../components/ui/index.js';
import '../components/layout/index.js';
import './auth-view.js';
import './landing-view.js';
import { loadManifests } from '../modules/registry.js';
import { api } from '../lib/fetcher.js';
import { AuthController } from './auth.js';
import { I18n } from './i18n.js';
import { AppRouter } from './router.js';
import { applyTheme, getThemeMode, initTheme } from './theme.js';

function readLanguage() {
  try { return localStorage.getItem('nova.language') || 'zh-CN'; } catch { return 'zh-CN'; }
}

function moduleLabel(i18n, id) {
  return i18n.t(`sidebar.${id}._label`, id);
}

function buildNavigation(manifests, i18n) {
  return manifests.flatMap((manifest) => [
    { path: `/${manifest.id}`, icon: manifest.icon, label: moduleLabel(i18n, manifest.id) },
    ...(manifest.submodules || []).map((submodule) => ({
      path: `/${manifest.id}/${submodule.id}`,
      icon: submodule.icon,
      label: i18n.t(`sidebar.${manifest.id}.${submodule.id}`, submodule.id),
      submodule: true,
    })),
  ]);
}

export async function bootstrap() {
  initTheme();
  const shell = document.querySelector('app-shell');
  const auth = new AuthController();
  const i18n = new I18n(readLanguage());
  await i18n.init();
  const manifests = await loadManifests();
  const router = new AppRouter({ shell, auth, i18n });
  shell.configure({
    items: buildNavigation(manifests, i18n),
    onNavigate: (path) => router.navigate(path),
    onLogout: () => { auth.logout(); router.navigate('/auth', { replace: true }); },
    onSidebarOpen: () => shell.shadowRoot.querySelector('app-sidebar')?.setOpen(true),
    onSidebarClose: () => shell.shadowRoot.querySelector('app-sidebar')?.setOpen(false),
    onThemeChange: (mode) => {
      applyTheme(mode);
      shell.setTheme(mode);
      if (auth.isAuthenticated()) api.put('/api/settings', { display: { theme: mode } }).catch(() => {});
    },
  });
  shell.setTheme(getThemeMode());

  router.add('/', (context) => import('./landing-view.js').then(({ createLandingView }) => createLandingView({ ...context, shell })), { publicRoute: true });
  router.add('/auth', (context) => import('./auth-view.js').then(({ createAuthView }) => createAuthView({ ...context, shell })), { publicRoute: true });
  for (const manifest of manifests) {
    router.add(`/${manifest.id}`, async (context) => {
      const module = await manifest.loadRoot();
      const factory = module[`create${manifest.id[0].toUpperCase()}${manifest.id.slice(1)}View`];
      return factory({ ...context, shell, manifest });
    }, { namespace: manifest.i18nNamespace });
    for (const submodule of manifest.submodules || []) {
      router.add(`/${manifest.id}/${submodule.id}`, async (context) => {
        const module = await submodule.loadRoot();
        const name = submodule.id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
        const factory = module[`create${name}View`] || module[`create${manifest.id[0].toUpperCase()}${manifest.id.slice(1)}${name}View`] || module.default;
        return factory({ ...context, shell, manifest, submodule });
      }, { namespace: submodule.i18nNamespace });
    }
  }
  router.addEventListener('route-change', (event) => {
    const manifest = manifests.find((item) => `/${item.id}` === event.detail.path || event.detail.path.startsWith(`/${item.id}/`));
    shell.setTitle(manifest ? moduleLabel(i18n, manifest.id) : 'Nova');
    if (event.detail.path === '/') shell.setTitle('Nova');
  });
  i18n.addEventListener('language-change', (event) => {
    try { localStorage.setItem('nova.language', event.detail.language); } catch {}
    shell.setNavigation(buildNavigation(manifests, i18n));
  });
  return router.start();
}
