export class LruCache {
  #entries = new Map();
  #maxEntries;

  constructor(maxEntries = 100) {
    this.#maxEntries = Math.max(1, maxEntries);
  }

  get(key) {
    const entry = this.#entries.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt !== 0 && entry.expiresAt <= Date.now()) {
      this.#entries.delete(key);
      return undefined;
    }
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlMs = 0) {
    this.#entries.delete(key);
    this.#entries.set(key, {
      value,
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
    });
    while (this.#entries.size > this.#maxEntries) {
      this.#entries.delete(this.#entries.keys().next().value);
    }
    return value;
  }

  delete(key) {
    return this.#entries.delete(key);
  }

  clear() {
    this.#entries.clear();
  }

  get size() {
    return this.#entries.size;
  }
}

export async function cachedQuery(cache, key, loader, ttlMs) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  return cache.set(key, await loader(), ttlMs);
}
