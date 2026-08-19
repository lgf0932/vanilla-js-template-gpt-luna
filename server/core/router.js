function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compilePath(pattern) {
  const keys = [];
  const segments = pattern.split('/').filter(Boolean);
  const source = segments.map((segment) => {
    if (segment.startsWith(':')) {
      keys.push(segment.slice(1));
      return '([^/]+)';
    }
    if (segment === '*') {
      keys.push('wildcard');
      return '(.*)';
    }
    return escapeRegExp(segment);
  }).join('/');
  return {
    regex: new RegExp(`^/${source}/?$`),
    keys,
  };
}

export class Router {
  #routes = [];

  add(method, pattern, handler, options = {}) {
    const compiled = compilePath(pattern);
    this.#routes.push({
      method: method.toUpperCase(),
      pattern,
      handler,
      publicRoute: Boolean(options.publicRoute),
      cacheControl: options.cacheControl,
      ...compiled,
    });
    return this;
  }

  get(pattern, handler, options) {
    return this.add('GET', pattern, handler, options);
  }

  post(pattern, handler, options) {
    return this.add('POST', pattern, handler, options);
  }

  put(pattern, handler, options) {
    return this.add('PUT', pattern, handler, options);
  }

  patch(pattern, handler, options) {
    return this.add('PATCH', pattern, handler, options);
  }

  delete(pattern, handler, options) {
    return this.add('DELETE', pattern, handler, options);
  }

  match(request) {
    const pathname = new URL(request.url).pathname;
    const method = request.method.toUpperCase();
    for (const route of this.#routes) {
      if (route.method !== method) {
        continue;
      }
      const match = route.regex.exec(pathname);
      if (!match) {
        continue;
      }
      const params = Object.fromEntries(route.keys.map((key, index) => [
        key,
        decodeURIComponent(match[index + 1]),
      ]));
      return { ...route, params };
    }
    return null;
  }

  routes() {
    return this.#routes.map(({ method, pattern, publicRoute }) => ({ method, pattern, publicRoute }));
  }
}
