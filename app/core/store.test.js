import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from './store.js';

test('store publishes patches and returns immutable snapshots', () => {
  const store = createStore({ count: 0 });
  const events = [];
  const unsubscribe = store.subscribe((event) => events.push(event));
  store.state.count = 1;
  store.patch({ label: 'ready' });
  const snapshot = store.snapshot();
  unsubscribe();
  store.state.count = 2;
  assert.equal(snapshot.count, 1);
  assert.equal(snapshot.label, 'ready');
  assert.equal(events.length, 2);
});
