import { rm } from 'node:fs/promises';

const filename = process.env.SQLITE_PATH || './data/dev.sqlite';
if (filename !== ':memory:') {
  await rm(filename, { force: true });
}
console.log('db:reset passed — local SQLite file removed');
