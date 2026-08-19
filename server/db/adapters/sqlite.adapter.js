export class SqliteAdapter {
  #filename;
  #database;

  constructor(filename = ':memory:') {
    this.#filename = filename;
  }

  async #open() {
    if (this.#database) {
      return this.#database;
    }
    const [{ mkdir }, { dirname }, { DatabaseSync }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
      import('node:sqlite'),
    ]);
    if (this.#filename !== ':memory:') {
      await mkdir(dirname(this.#filename), { recursive: true });
    }
    this.#database = new DatabaseSync(this.#filename);
    return this.#database;
  }

  async query(sql, params = []) {
    const database = await this.#open();
    return database.prepare(sql).all(...params);
  }

  async execute(sql, params = []) {
    const database = await this.#open();
    const result = database.prepare(sql).run(...params);
    return {
      changes: Number(result.changes ?? 0),
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  async transaction(callback) {
    await this.execute('BEGIN');
    try {
      await callback(this);
      await this.execute('COMMIT');
    } catch (error) {
      await this.execute('ROLLBACK');
      throw error;
    }
  }

  async close() {
    if (this.#database) {
      this.#database.close();
      this.#database = null;
    }
  }
}
