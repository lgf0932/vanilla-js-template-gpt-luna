class EventBus extends EventTarget {
  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on(type, listener) {
    this.addEventListener(type, listener);
    return () => this.removeEventListener(type, listener);
  }
}

export const eventBus = new EventBus();
