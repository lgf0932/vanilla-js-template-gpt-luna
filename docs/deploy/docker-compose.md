# Docker Compose 部署

`docker-compose.yml` 支持两种数据库模式：

- `DB_DRIVER=sqlite`：容器内 SQLite + named volume，适合单机/VPS；
- `DB_DRIVER=turso`：Turso 作为远程数据库，适合重建和水平扩展。

## 1. 准备环境文件

复制非敏感模板：

```bash
cp docker-compose.env.example .env
```

编辑 `.env`，至少替换：

```dotenv
DB_DRIVER=sqlite
SQLITE_PATH=/app/data/app.sqlite
ENCRYPTION_KEY=replace-with-a-real-random-secret
NOVA_PORT=8787
NOVA_VOLUME=nova_data
NOVA_IMAGE=nova-modular-app:local
```

`ENCRYPTION_KEY` 必须由部署者生成并安全保存。不要提交 `.env`，也不要把真实 Token 写入 Compose 文件。

## 2. 本机构建并启动

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

访问：

```text
http://127.0.0.1:8787
```

查看日志：

```bash
docker compose logs --tail=100 -f nova
```

应用启动时会自动执行兼容性数据库迁移；SQLite 文件位于 named volume 的 `/app/data/app.sqlite`。

## 3. 停止与备份

停止服务但保留数据：

```bash
docker compose down
```

备份 SQLite volume：

```bash
docker run --rm \
  -v nova_data:/data \
  -v "$PWD:/backup" \
  alpine:latest \
  tar -czf /backup/nova-data-backup.tar.gz -C /data .
```

不要使用 `docker compose down -v`，除非明确要删除数据库卷。

## 4. Turso 模式

`.env` 改为：

```dotenv
DB_DRIVER=turso
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
ENCRYPTION_KEY=...
```

启动前可以使用 Node 22 显式执行迁移：

```bash
DB_DRIVER=turso \
TURSO_DATABASE_URL="$TURSO_DATABASE_URL" \
TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" \
node scripts/db-migrate.js
```

Compose 中的 SQLite volume 在 Turso 模式下不会承载业务数据，但可以保留配置的一致性。

## 5. GHCR 镜像模式

可以使用 `.github/workflows/publish-image-to-ghcr.yml` 或 `.github/workflows/publish-image-to-dockerhub.yml` 单独发布镜像，也可以直接使用 Compose workflow（它会先发布同一版本镜像，再更新远程主机）。远程主机 `.env` 中可以设置：

```dotenv
NOVA_IMAGE=ghcr.io/<owner>/<repository>:v1.0.0
```

在 Compose 文件所在目录执行：

```bash
docker compose pull
docker compose up -d --remove-orphans
docker compose ps
```

私有 GHCR 镜像需要在远程主机预先执行一次 `docker login ghcr.io`，使用只读 Packages 凭证。不要把该凭证写入 Compose 文件。

## 6. Docker Compose GitHub Actions

文件：`.github/workflows/deploy-docker-compose.yml`。

触发方式：

- 推送 `v*` tag；
- Actions 页面手动输入要发布并部署的 GHCR image tag。

需要配置以下 Actions Secrets：

| Secret | 说明 |
|---|---|
| `DEPLOY_HOST` | VPS/远程 Docker 主机域名或 IP |
| `DEPLOY_USER` | 远程部署用户 |
| `DEPLOY_PATH` | 远程 Compose 项目目录 |
| `DEPLOY_SSH_KEY` | 仅用于登录部署主机的 SSH 私钥 |
| `DEPLOY_KNOWN_HOSTS` | 远程主机的固定 known_hosts 内容 |

该 SSH 连接只用于部署目标主机，不用于 GitHub 仓库认证。Workflow 会先用内置 `GITHUB_TOKEN` 发布 GHCR 镜像，再上传 `docker-compose.yml`，设置 `NOVA_IMAGE`，执行 `docker compose pull` 和 `docker compose up -d`。远程主机的 `.env` 和数据卷不会被 workflow 覆盖。

## 7. 更新、回滚与验证

```bash
curl -i http://127.0.0.1:8787/api/health
docker compose ps
docker compose logs --tail=100 nova
```

回滚时将远程 `.env` 的 `NOVA_IMAGE` 改成上一版本 tag，再执行：

```bash
docker compose pull
docker compose up -d --remove-orphans
```

不要删除 named volume，也不要通过回滚镜像逆向数据库迁移。
