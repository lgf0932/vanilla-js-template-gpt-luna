# Vercel Edge + Turso 部署

本项目通过 `api/index.js` 暴露 Vercel 自动发现的 Edge Function，实际业务入口为 `server/adapters/vercel.entry.js`。`vercel.json` 配置 `dist/` 静态输出、API 路由和 SPA 回退。

Vercel 生产环境默认使用 Turso，不使用本地 SQLite 文件。

## 1. 部署前准备

需要：

- Vercel 账号和目标 Team/个人空间；
- Turso 数据库 URL 与 Token；
- `ENCRYPTION_KEY`；
- 可选的 `AUTH_PASSWORD_HASH`。

Vercel 项目环境变量名称：

| 变量 | 环境 | 说明 |
|---|---|---|
| `DB_DRIVER` | Production | 固定为 `turso` |
| `TURSO_DATABASE_URL` | Production | Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | Production | Turso Bearer Token |
| `ENCRYPTION_KEY` | Production | AES-GCM 主密钥，必须是 Secret |
| `AUTH_PASSWORD_HASH` | Production | 可选密码哈希 |

## 2. Vercel Dashboard 导入 Git 仓库

1. 打开 Vercel Dashboard，点击 **Add New → Project**。
2. 导入 GitHub 仓库并选择目标分支。
3. Project Settings 使用：
   - Framework Preset：Other；
   - Build Command：`node scripts/build.js`；
   - Output Directory：`dist`；
   - Install Command：保持默认即可，项目没有第三方依赖；
   - Node.js Version：22.x。
4. 在 Environment Variables 中为 Production 添加上表变量。
5. 点击 Deploy。
6. 在 Functions 列表确认 `/api/index` 使用 Edge Runtime。

不要把 Turso Token、Vercel Token 或 `ENCRYPTION_KEY` 放进 Git 仓库。

## 3. CLI 部署

如果尚未关联项目：

```bash
npx vercel@latest login
npx vercel@latest link
```

设置 Vercel 项目环境变量可以在 Dashboard 完成，也可以使用 Vercel CLI 的 `env` 命令。完成环境变量后：

```bash
node scripts/build.js
npx vercel@latest pull --yes --environment=production
npx vercel@latest build --prod
npx vercel@latest deploy --prebuilt --prod
```

## 4. Turso 迁移

在拥有 Turso 凭证的安全环境中执行：

```bash
DB_DRIVER=turso node scripts/db-migrate.js
```

迁移文件仍然来自 `server/db/migrations/`，应用不会使用 ORM。生产发布前必须先完成 migration，再让新版本接收流量。

## 5. GitHub Actions

文件：`.github/workflows/deploy-vercel.yml`。

触发方式：

- 推送 `v*` tag；
- Actions 页面手动运行并填写 `ref`。

需要配置以下 Actions Secrets：

| Secret | 用途 |
|---|---|
| `VERCEL_TOKEN` | Vercel CLI Token |
| `VERCEL_ORG_ID` | Vercel Team/Owner ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |
| `TURSO_DATABASE_URL` | 迁移数据库 URL |
| `TURSO_AUTH_TOKEN` | 迁移数据库 Token |

Workflow 会检查源码、执行 Turso migration、构建 Vercel 输出并发布预构建产物。应用运行时 Secret 仍需在 Vercel Project Settings 中配置；Actions Secret 不会自动替代 Vercel Runtime Environment Variable。

## 6. 验证

```bash
curl -i https://<your-project>.vercel.app/api/health
```

确认：

- API 返回 200；
- `driver` 为 `turso`；
- 根路径和深层 hash/SPA 路由可以加载；
- 登录后可以创建和刷新笔记。

## 7. 回滚与排错

在 Vercel Deployments 页面选择上一成功版本执行 Promote。常见问题：

- API 404：确认 `api/index.js` 和 `vercel.json` 已部署；
- 静态资源 404：确认 Build Command 生成 `dist/`；
- Turso 连接失败：检查 Production 环境变量和 URL 协议；
- Edge 运行时错误：不要在业务代码中引入 Node 专属 API，数据库通过现有 HTTP 适配器访问。
