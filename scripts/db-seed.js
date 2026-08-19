import { resolveAdapter } from '../server/db/resolver.js';
import { runMigrations } from '../server/db/migrate.js';
import { INSERT_DEMO_NOTE } from '../server/db/query/system.queries.js';

const environment = Object.fromEntries(['DB_DRIVER', 'SQLITE_PATH'].map((key) => [key, process.env[key] ?? '']));
const { adapter } = await resolveAdapter(environment);
try {
  await runMigrations(adapter);
  await adapter.execute(INSERT_DEMO_NOTE, ['欢迎使用 Nova', '这是你的第一条笔记。点击“新建笔记”开始记录。']);
  console.log('db:seed passed');
} finally {
  await adapter.close();
}
