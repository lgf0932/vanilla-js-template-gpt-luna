import test from 'node:test';
import assert from 'node:assert/strict';
import { Router } from './router.js';

test('router matches method and decodes path parameters', () => {
  const router = new Router();
  router.get('/api/notes/:id', () => {}, { publicRoute: true });
  const route = router.match(new Request('https://nova.test/api/notes/%E4%B8%80'));
  assert.equal(route.params.id, '一');
  assert.equal(route.publicRoute, true);
  assert.equal(router.match(new Request('https://nova.test/api/notes/1', { method: 'POST' })), null);
});
