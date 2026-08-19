function isFileMode() {
  return globalThis.location?.protocol === 'file:';
}

function normalizePath(path) {
  const value = path.split('?')[0] || '/';
  return value.length > 1 ? value.replace(/\/$/, '') : value;
}

function currentTarget() {
  if (isFileMode()) return globalThis.location.hash.slice(1) || '/';
  return `${globalThis.location.pathname}${globalThis.location.search}`;
}

export class AppRouter extends EventTarget {
  #routes = [];
  #shell;
  #auth;
  #i18n;
  #current;

  constructor({ shell, auth, i18n }) {
    super();
    this.#shell = shell;
    this.#auth = auth;
    this.#i18n = i18n;
    globalThis.addEventListener('popstate', () => this.renderCurrent());
    if (isFileMode()) globalThis.addEventListener('hashchange', () => this.renderCurrent());
    this.#auth.addEventListener('auth-change', () => this.renderCurrent());
  }

  add(path, loader, options = {}) {
    this.#routes.push({ path, loader, publicRoute: Boolean(options.publicRoute), namespace: options.namespace || '' });
    return this;
  }

  navigate(path, { replace = false } = {}) {
    const target = path || '/';
    if (isFileMode()) {
      const hashTarget = target.startsWith('#') ? target : `#${target}`;
      const url = `${globalThis.location.pathname}${hashTarget}`;
      if (replace) history.replaceState({}, '', url);
      else history.pushState({}, '', url);
    } else if (replace) {
      history.replaceState({}, '', target);
    } else {
      history.pushState({}, '', target);
    }
    return this.renderCurrent();
  }

  match(pathname) {
    const path = normalizePath(pathname);
    return this.#routes.find((route) => route.path === path)
      || this.#routes.find((route) => route.path.endsWith('/*') && path.startsWith(route.path.slice(0, -1)));
  }

  async start() {
    return this.renderCurrent();
  }

  async renderCurrent() {
    const target = currentTarget();
    const pathname = normalizePath(target);
    const route = this.match(pathname);
    if (!route) return this.navigate('/', { replace: true });
    const authenticated = this.#auth.isAuthenticated();
    if (!route.publicRoute && !authenticated) {
      return this.navigate(`/auth?returnTo=${encodeURIComponent(target)}`, { replace: true });
    }
    if (route.path === '/auth' && authenticated) {
      return this.navigate('/dashboard', { replace: true });
    }
    this.#current = route;
    this.#shell.setMode(route.publicRoute ? 'public' : 'app');
    const activePath = pathname.split('/').slice(0, 2).join('/') || '/';
    this.#shell.setActivePath(activePath);
    this.#shell.setLoading(true);
    try {
      if (route.namespace) await this.#i18n.loadModule(route.namespace);
      const view = await route.loader({ router: this, auth: this.#auth, i18n: this.#i18n, pathname, shell: this.#shell });
      this.#shell.mountView(view);
      this.#shell.setLoading(false);
      this.dispatchEvent(new CustomEvent('route-change', { detail: { path: pathname } }));
    } catch (error) {
      this.#shell.setLoading(false);
      this.#shell.showError(error);
      console.error(error);
    }
  }
}
