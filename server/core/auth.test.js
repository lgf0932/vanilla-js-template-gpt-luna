import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from './crypto.js';
import { issueToken, verifyToken } from './auth.js';

test('password hashes verify without storing the original password', async () => {
  const hash = await hashPassword('correct horse battery staple');
  assert.match(hash, /^pbkdf2\$/);
  assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
  assert.equal(hash.includes('correct horse'), false);
});

test('auth tokens honor expiry and session duration', async () => {
  const hash = await hashPassword('another secure password');
  const now = 1_700_000_000_000;
  const token = await issueToken(hash, '4h', now);
  assert.equal(await verifyToken(token, hash, now + 4 * 60 * 60 * 1000 - 1), true);
  assert.equal(await verifyToken(token, hash, now + 4 * 60 * 60 * 1000), false);
  const sessionToken = await issueToken(hash, 'session', now);
  assert.equal(await verifyToken(sessionToken, hash, now + 100 * 365 * 24 * 60 * 60 * 1000), true);
});
