FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY package.json ./
COPY index.html ./
COPY app ./app
COPY public ./public
COPY shared ./shared
COPY server ./server
COPY scripts ./scripts

RUN mkdir -p /app/data \
  && chown -R node:node /app

USER node

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8787) + '/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "scripts/dev-server.js"]
