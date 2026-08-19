export class D1Adapter {
  #database;

  constructor(database) {
    if (!database) {
      throw new Error('D1 数据库绑定不可用');
    }
    this.#database = database;
  }

  async query(sql, params = []) {
    const result = await this.#database.prepare(sql).bind(...params).all();
    return result.results ?? [];
  }

  async execute(sql, params = []) {
    const result = await this.#database.prepare(sql).bind(...params).run();
    return {
      changes: Number(result.meta?.changes ?? 0),
      lastInsertRowid: result.meta?.last_row_id,
    };
  }

  async transaction(callback) {
    // D1 单次请求不提供跨语句事务 API；service 层仍通过统一接口调用。
    return callback(this);
  }

  async close() {}
}
