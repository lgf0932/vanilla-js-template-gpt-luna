# 本地部署

本项目提供三种本地运行方式：直接双击 `index.html`、Node HTTP + SQLite，以及 Docker Compose。选择哪一种取决于是否需要后端和持久化数据库。

## 1. 方式选择

| 方式 | 需要 | 数据位置 | 适用场景 |
|---|---|---|---|
| 双击 `index.html` | 浏览器 | 浏览器 `localStorage`；个人资料仅保留在当前页面内存 | 快速预览、离线记录 |
| `just dev` / `just dev -- --port 8788` | Node >= 22 | `data/dev.sqlite` | 完整本地开发、API 和 SQLite |
| Docker Compose | Docker Engine + Compose v2 | Docker named volume 或 Turso | 接近生产的本地部署 |

HTTP 模式和文件协议模式使用同一套前端；文件协议模式不会启动后端，也不会访问远程数据库。

## 2. 直接双击运行

1. 在文件管理器中打开仓库根目录。
2. 双击 `index.html`。
3. 首次进入时设置本地工作台密码。
4. 后续数据通过浏览器本地存储保留。

文件协议模式具备：

- hash 路由，不依赖服务器 History API；
- 本地密码哈希、笔记、概览和显示设置；
- 不将个人资料明文写入 `localStorage`；
- 不支持跨浏览器、跨设备同步。

如果浏览器限制了 `file://` 本地存储，请改用下面的 Node HTTP 模式。

## 3. Node HTTP + SQLite

### 环境要求

- Node.js >= 22（使用内置 `node:sqlite`）；
- `just` 可选，也可以直接运行 Node 命令。

### 启动

```bash
node scripts/db-migrate.js
node scripts/dev-server.js
```

或：

```bash
just dev
# Just 传递参数时使用 -- 分隔
just dev -- --port 8788
```

开发服务器绑定 `0.0.0.0`，默认端口为 `8787`。服务器监听前会自动创建 `data/dev.sqlite` 并执行迁移；该路径相对于启动命令的当前工作目录，且 `data/` 已被 `.gitignore` 忽略，所以不会出现在 Git 变更列表中。可以用 `--port` 或 `PORT` 覆盖端口：

```bash
node scripts/dev-server.js --port 8788
PORT=8788 node scripts/dev-server.js
```

访问：

```text
http://127.0.0.1:8787
```

Freebuff 或其他托管环境注入 `PORT` 时，服务器会自动使用该端口。

### 可选演示数据

```bash
node scripts/db-seed.js
# 或
just db-seed
```

### 本地环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `8787` | HTTP 监听端口 |
| `DB_DRIVER` | `sqlite` | 本地默认使用 SQLite |
| `SQLITE_PATH` | `./data/dev.sqlite` | SQLite 文件路径 |
| `ENCRYPTION_KEY` | 空 | 保存个人资料等敏感字段时必须设置 |
| `AUTH_PASSWORD_HASH` | 空 | 可选，预设 PBKDF2 密码哈希 |

不要把真实 `.env`、数据库文件或主密钥提交到 Git。检查数据库文件：

```bash
ls -lh data/dev.sqlite
```

如需自定义位置，设置 `SQLITE_PATH`（相对路径同样相对于当前工作目录）：

```bash
SQLITE_PATH=./data/local.sqlite just dev -- --port 3333
```


## 4. 本地校验

```bash
node scripts/deps-check.js
node scripts/lint.js
node scripts/i18n-check.js
node --test
node scripts/build.js
node scripts/bundle-budget-check.js
```

## 5. 本地产物

生产静态文件位于 `dist/`：

```bash
node scripts/build.js
```

`dist/` 可以作为静态文件目录上传到任意静态托管；如果需要完整 API，请使用 Node、Docker 或 Compose 部署。

GitHub Actions 的 `package-local-artifact.yml` 会在 `v*` tag 或手动触发时生成可下载的 `tar.gz` 本地产物。

## 6. 常见问题

### 页面空白

确认浏览器允许加载本地 ES Module；Firefox/Chromium 均应使用最新版本。若仍失败，运行 `node scripts/dev-server.js` 后访问 HTTP 地址。

### 数据丢失

双击模式的数据属于当前浏览器的本地数据。需要可备份的 SQLite 文件时使用 Node 模式，并备份 `data/dev.sqlite`。

### 端口被占用

```bash
node scripts/dev-server.js --port 8788
# 或
PORT=8788 node scripts/dev-server.js
```
