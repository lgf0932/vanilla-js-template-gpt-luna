# Cloudflare Workers + D1 部署

本项目在 Cloudflare 使用 `server/adapters/cloudflare.entry.js` 作为 Fetch 入口，静态资源由 `dist/` 提供，数据库使用 D1。D1 绑定名固定为 `DB`，配置位于 `wrangler.toml`。

## 1. 部署前准备

需要：

- Cloudflare 账号；
- 一个 Workers/D1 可用的账户；
- D1 数据库；
- `ENCRYPTION_KEY` Secret；
- 可选的预生成 `AUTH_PASSWORD_HASH`。

`database_id` 不是密码，但必须替换 `wrangler.toml` 中的占位值；API Token、加密主密钥和密码哈希不能写入仓库。

## 2. Cloudflare Dashboard 导入 Git 仓库

Cloudflare 控制台不同产品的菜单名称可能略有差异，推荐使用 Workers 的 Git 集成：

1. 打开 **Workers & Pages**。
2. 选择 **Create application**，再选择从 Git 仓库导入。
3. 授权并选择本仓库与目标分支。
4. 使用以下构建配置：
   - Framework preset：Other / None；
   - Build command：`node scripts/build.js`；
   - Static assets directory：`dist`；
   - Deploy command：`npx wrangler@latest deploy --config wrangler.toml`。
5. 在 Worker 的 Settings → Variables and Secrets 中添加：
   - `ENCRYPTION_KEY`，类型选择 Secret；
   - `AUTH_PASSWORD_HASH`，可选 Secret。
6. 确认 D1 绑定名称为 `DB`，并绑定到 `wrangler.toml` 中的数据库。
7. 首次发布前执行一次 D1 migration（见下文）。

如果 Dashboard Git 集成无法识别 `wrangler.toml`，使用 CLI 或 GitHub Actions 部署；不要在 Dashboard 中另建一套不同的入口。

## 3. CLI 部署

安装不写入项目依赖，使用临时 CLI：

```bash
npx wrangler@latest login
npx wrangler@latest d1 create nova
```

将返回的数据库 ID 写入 `wrangler.toml` 的 `database_id`。然后执行：

```bash
node scripts/build.js
npx wrangler@latest d1 migrations apply nova --remote --config wrangler.toml
npx wrangler@latest deploy --config wrangler.toml
```

设置 Secret：

```bash
printf '%s' "$ENCRYPTION_KEY" | npx wrangler@latest secret put ENCRYPTION_KEY --config wrangler.toml
printf '%s' "$AUTH_PASSWORD_HASH" | npx wrangler@latest secret put AUTH_PASSWORD_HASH --config wrangler.toml
```

上面的变量值应由本地安全环境或 CI Secret 提供，命令和输出都不要提交到仓库。

## 4. 数据库迁移

迁移文件位于 `server/db/migrations/`，并已通过 `wrangler.toml` 的 `migrations_dir` 注册：

```bash
npx wrangler@latest d1 migrations list nova --remote --config wrangler.toml
npx wrangler@latest d1 migrations apply nova --remote --config wrangler.toml
```

每个已经发布的迁移只增不改。应用启动时也会执行兼容性迁移检查，但生产发布前仍建议显式执行 CLI migration。

## 5. GitHub Actions

文件：`.github/workflows/deploy-cloudflare.yml`。

触发方式：

- 推送 `v*` tag，例如 `v1.0.0`；
- Actions 页面手动运行，并填写要部署的 `ref`。

仓库 Settings → Secrets and variables → Actions 中添加：

| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Wrangler API Token，至少具备 Workers 发布和 D1 migration 权限 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |

Workflow 会依次执行源码检查、Node 22 构建、D1 migration 和 Wrangler deploy。

## 6. 验证

部署完成后访问：

```text
https://<your-worker-domain>/api/health
```

应返回 JSON，并确认 `driver` 为 `d1`。然后打开前端，首次访问设置管理密码，创建一条笔记并刷新验证。

## 7. 自定义域名与回滚

在 Worker → Settings → Domains & Routes 中绑定自定义域名。发布失败时：

1. 查看 Workers 的 Deployments 日志；
2. 确认 D1 migration 已完成；
3. 在 Deployments 中选择上一版本回滚；
4. 不要删除 D1 数据库或执行破坏性 migration。

## 8. 常见问题

- `D1 database not found`：检查 `database_id` 和 Account ID。
- `ENCRYPTION_KEY 未配置`：在 Worker Secret 中配置，不要写入 `wrangler.toml`。
- 静态资源 404：确认先运行 `node scripts/build.js`，并且 `dist/` 是 Assets 目录。
