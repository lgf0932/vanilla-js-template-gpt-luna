# Docker 单容器部署

`Dockerfile` 基于 Node 22 Alpine，包含静态前端、同构后端、数据库迁移和健康检查。容器监听 `8787`，并以非 root 用户运行。

## 1. 构建镜像

```bash
docker build -t nova-modular-app:local .
```

Docker 构建不会安装 npm 依赖，项目的 `dependencies` 与 `devDependencies` 始终为空。

## 2. 使用本地 SQLite

创建一个只存在于本机的 `.env`，至少包含：

```dotenv
NODE_ENV=production
PORT=8787
DB_DRIVER=sqlite
SQLITE_PATH=/app/data/app.sqlite
ENCRYPTION_KEY=replace-with-a-random-secret
```

启动：

```bash
docker run -d \
  --name nova \
  --restart unless-stopped \
  --env-file .env \
  -p 8787:8787 \
  -v nova_data:/app/data \
  nova-modular-app:local
```

`nova_data` 是持久化卷。删除容器不会删除数据；不要随意使用 `docker volume rm nova_data`。

## 3. 使用 Turso

将环境变量改为：

```dotenv
NODE_ENV=production
PORT=8787
DB_DRIVER=turso
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
ENCRYPTION_KEY=...
```

Turso 模式不依赖容器本地数据库，但仍建议按环境管理配置，不要把 Token 放入镜像。

## 4. 健康检查与日志

```bash
curl -i http://127.0.0.1:8787/api/health
docker ps
docker logs -f nova
```

容器内置 healthcheck，会请求 `/api/health`。健康接口公开但不返回密钥。

## 5. 更新与回滚

```bash
docker stop nova
docker rm nova
docker build -t nova-modular-app:local .
# 使用原来的 --env-file、端口和 volume 参数重新 docker run
```

生产环境建议使用不可变 tag：

```bash
docker pull ghcr.io/<owner>/<repo>:v1.0.0
docker tag ghcr.io/<owner>/<repo>:v1.0.0 nova-modular-app:v1.0.0
```

出现问题时重新运行上一版本镜像；数据库 migration 只能通过新增迁移前进，不能依靠回滚镜像逆向修改表结构。

## 6. 镜像发布 GitHub Actions

### GHCR

文件：`.github/workflows/publish-image-to-ghcr.yml`。

触发方式：

- 推送 `v*` tag；
- Actions 页面手动输入镜像 tag。

Workflow 使用 GitHub Actions 内置 `GITHUB_TOKEN` 登录 GHCR，构建并推送：

```text
ghcr.io/<owner>/<repository>:<tag>
ghcr.io/<owner>/<repository>:latest
```

无需把 GitHub PAT 写入仓库。仓库 Settings → Actions → Workflow permissions 需要允许写入 Packages。

### Docker Hub

文件：`.github/workflows/publish-image-to-dockerhub.yml`。

触发方式同样是 `v*` tag push 或手动输入 tag。需要配置以下 Actions Secrets：

| Secret | 用途 |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub 用户名或组织名 |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token，不是 GitHub PAT |

镜像会发布为：

```text
docker.io/<DOCKERHUB_USERNAME>/<repository>:<tag>
docker.io/<DOCKERHUB_USERNAME>/<repository>:latest
```

Docker Hub workflow 与 GHCR workflow 相互独立；可以只启用其中一个，也可以同时发布到两个 registry。Compose 远程部署默认使用 GHCR，可通过 `NOVA_IMAGE` 改为 Docker Hub 镜像。

## 7. 反向代理

Docker 只负责 HTTP 服务。生产 HTTPS、域名和证书应由 Nginx、Caddy、Cloudflare Tunnel 或云负载均衡器处理，并将请求转发到容器的 `8787` 端口。
