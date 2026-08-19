# Deno Deploy + Turso 部署

Deno Deploy 入口是 `server/adapters/deno.entry.js`，该入口调用同构的 `handleRequest`。`deno.json` 提供 `deno task start` 和 `deno task check`，不包含任何第三方运行时依赖。

生产环境默认使用 Turso；Deno Deploy 不应依赖本地 SQLite 文件。

## 1. 部署前准备

需要：

- Deno Deploy 项目；
- Deno Deploy API Token；
- Turso URL 和 Token；
- `ENCRYPTION_KEY`；
- 可选的 `AUTH_PASSWORD_HASH`。

Deno Deploy Project Environment Variables：

| 变量 | 说明 |
|---|---|
| `DB_DRIVER` | 设置为 `turso` |
| `TURSO_DATABASE_URL` | Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | Turso Token |
| `ENCRYPTION_KEY` | AES-GCM 主密钥 |
| `AUTH_PASSWORD_HASH` | 可选管理员密码哈希 |

## 2. Deno Deploy Dashboard 导入 Git

1. 打开 Deno Deploy 控制台，创建新项目。
2. 选择 **Deploy from GitHub**，授权并选择本仓库。
3. 入口文件填写：`server/adapters/deno.entry.js`。
4. Build/Check command 填写：`deno task check`。
5. 不需要 npm install；项目没有 npm 依赖。
6. 在项目 Settings → Environment Variables 中填写 Turso 和加密变量。
7. Deploy 后打开生成的域名。

如果 Git 集成无法识别 `deno.json`，直接使用 deployctl CLI 或 GitHub Actions。

## 3. CLI 部署

先安装/登录 Deno Deploy CLI（不写入本项目依赖），然后：

```bash
deno task check
npx deployctl@latest deploy \
  --project="$DENO_PROJECT" \
  --token="$DENO_DEPLOY_TOKEN" \
  server/adapters/deno.entry.js
```

不要把 Deploy Token 写进 `deno.json`。

## 4. Turso 迁移

在安全的 Node 22 环境执行：

```bash
DB_DRIVER=turso node scripts/db-migrate.js
```

Deno 入口启动时也会执行兼容性迁移检查；发布前显式迁移可以更早发现凭证或数据库问题。

## 5. GitHub Actions

文件：`.github/workflows/deploy-deno.yml`。

触发方式：

- 推送 `v*` tag；
- Actions 页面手动运行并填写 `ref`。

Actions Secrets：

| Secret | 用途 |
|---|---|
| `DENO_DEPLOY_TOKEN` | Deno Deploy API Token |
| `DENO_PROJECT` | Deno Deploy 项目名称 |
| `TURSO_DATABASE_URL` | migration 数据库 URL |
| `TURSO_AUTH_TOKEN` | migration 数据库 Token |

Deno 运行时变量仍需在 Deno Deploy 项目设置中配置。Workflow 会执行 Node 检查、Deno 检查、Turso migration 和 deployctl 发布。

## 6. 验证与回滚

```bash
curl -i https://<your-project>.deno.dev/api/health
```

确认 `driver` 为 `turso`。Deno Deploy 控制台可以查看部署版本和日志；出现回归时选择上一版本重新激活，不要回滚或删除数据库 migration。

## 7. 常见问题

- `DENO_PROJECT` 无效：检查项目名，不是显示名称或 URL。
- 环境变量为空：Deno Deploy 的环境变量和本地 Shell 不共享，需要在项目 Settings 单独配置。
- `deno task check` 失败：先确认入口路径和 Deno 版本，再检查同构代码是否误用 Node 专属 API。
