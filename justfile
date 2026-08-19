set shell := ["bash", "-euo", "pipefail", "-c"]

# 本地开发服务器（Node 适配器 + SQLite）
dev *args:
    node scripts/dev-server.js {{args}}

# 数据库迁移
db-migrate:
    node scripts/db-migrate.js

# 演示数据由服务启动时按需创建，保留命令面供部署脚本使用
db-reset:
    node scripts/db-reset.js

db-seed:
    node scripts/db-seed.js

# 质量检查
lint:
    node scripts/lint.js

test:
    node --test

i18n-check:
    node scripts/i18n-check.js

deps-check:
    node scripts/deps-check.js

# Zero-Build 生产文件操作
build:
    node scripts/build.js

build-budget:
    node scripts/bundle-budget-check.js

# 平台 CLI 仅临时调用，不写入 package.json
deploy-cloudflare:
    npx wrangler@latest deploy --config wrangler.toml

deploy-vercel:
    npx vercel@latest --prod

deploy-deno:
    npx deployctl@latest deploy --project="$DENO_PROJECT" server/adapters/deno.entry.js

deploy-docker:
    docker build -t nova-modular-app .

compose-up:
    docker compose up -d --build

compose-down:
    docker compose down

compose-logs:
    docker compose logs --tail=100 -f

deploy-docker-compose:
    docker compose up -d --build
