import test from 'node:test';
import assert from 'node:assert/strict';
import { envValue } from './resolver.js';

test('empty environment values use configured defaults', () => {
  assert.equal(envValue({ SQLITE_PATH: '' }, 'SQLITE_PATH', './data/dev.sqlite'), './data/dev.sqlite');
  assert.equal(envValue({ DB_DRIVER: '' }, 'DB_DRIVER', 'sqlite'), 'sqlite');
  assert.equal(envValue({ SQLITE_PATH: ':memory:' }, 'SQLITE_PATH', './data/dev.sqlite'), ':memory:');
});
