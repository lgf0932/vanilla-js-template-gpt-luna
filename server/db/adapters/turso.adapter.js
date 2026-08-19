function encodeArg(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (typeof value === 'number' && Number.isInteger(value)) return { type: 'integer', value: String(value) };
  if (typeof value === 'number') return { type: 'float', value };
  if (typeof value === 'bigint') return { type: 'integer', value: String(value) };
  return { type: 'text', value: String(value) };
}

function decodeValue(value) {
  if (!value || value.type === 'null') return null;
  if (value.type === 'integer') {
    const number = Number(value.value);
    return Number.isSafeInteger(number) ? number : BigInt(value.value);
  }
  return value.value;
}

function normalizeUrl(url) {
  const value = String(url).trim();
  if (value.startsWith('libsql://')) return `https://${value.slice('libsql://'.length)}`;
  if (value.startsWith('https://') || value.startsWith('http://')) return value;
  return `https://${value}`;
}

export class TursoAdapter {
  #url;
  #token;

  constructor(url, token) {
    if (!url || !token) throw new Error('使用 Turso 时必须配置 TURSO_DATABASE_URL 与 TURSO_AUTH_TOKEN');
    this.#url = normalizeUrl(url).replace(/\/$/, '').replace(/\/v2\/pipeline$/, '');
    this.#token = token;
  }

  async #execute(sql, params = []) {
    const response = await fetch(`${this.#url}/v2/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.#token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: params.map(encodeArg) } }, { type: 'close' }] }),
    });
    if (!response.ok) throw new Error(`Turso 请求失败: ${response.status}`);
    const payload = await response.json();
    const result = payload.results?.[0];
    if (result?.type === 'error') throw new Error(result.error?.message || 'Turso 查询失败');
    return result?.response?.result ?? {};
  }

  async query(sql, params = []) {
    const result = await this.#execute(sql, params);
    const columns = result.cols?.map((column) => column.name) ?? [];
    return (result.rows ?? []).map((row) => Object.fromEntries(row.map((value, index) => [columns[index], decodeValue(value)])));
  }

  async execute(sql, params = []) {
    const result = await this.#execute(sql, params);
    return { changes: Number(result.affected_row_count ?? 0), lastInsertRowid: result.last_insert_rowid };
  }

  async transaction(callback) { return callback(this); }
  async close() {}
}
