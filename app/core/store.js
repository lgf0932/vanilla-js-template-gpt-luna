export function createStore(initialState = {}) {
  const listeners = new Set();
  const state = { ...initialState };
  const proxy = new Proxy(state, {
    set(target, property, value) {
      const previous = target[property];
      target[property] = value;
      if (previous !== value) {
        listeners.forEach((listener) => listener({ property, value, previous, state: proxy }));
      }
      return true;
    },
    deleteProperty(target, property) {
      if (!(property in target)) return true;
      const previous = target[property];
      delete target[property];
      listeners.forEach((listener) => listener({ property, value: undefined, previous, state: proxy }));
      return true;
    },
  });
  return {
    state: proxy,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    patch(values) { Object.entries(values).forEach(([key, value]) => { proxy[key] = value; }); },
    snapshot() { return { ...proxy }; },
  };
}
