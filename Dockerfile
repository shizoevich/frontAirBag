FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* попадает в приложение на этапе сборки, а не читается при
# запуске. Раньше значение подхватывалось из .env.local, который приезжает в
# образ вместе с исходниками — то есть из файла той машины, где идёт сборка.
# Однажды это уже привело к тому, что собранный локально образ унёс на прод
# http://localhost:8000: сайт открывался, но всё, что грузится из браузера,
# отваливалось.
#
# Теперь адрес обязателен и передаётся явно. Проверять результат сборки
# бесполезно: Turbopack не всегда оставляет значение литералом в бандле, так
# что поиск по файлам давал ложно-отрицательный результат. Единственное
# надёжное решение — не дать собрать образ без явно указанного адреса.
ARG NEXT_PUBLIC_API_BASE_URL

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=2048
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .env.production.local приоритетнее .env.local, поэтому аргумент сборки
# перекрывает файл, чей бы он ни был.
RUN set -eu; \
    if [ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ]; then \
      echo '' >&2; \
      echo 'СБОРКА ОСТАНОВЛЕНА: не задан NEXT_PUBLIC_API_BASE_URL.' >&2; \
      echo 'Он вшивается в приложение на этапе сборки, поэтому без него образ' >&2; \
      echo 'взял бы адрес из .env.local машины сборщика.' >&2; \
      echo '' >&2; \
      echo '  docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.airbagad.com/api/v2 .' >&2; \
      echo '  docker compose build frontend   # адрес подставит docker-compose.yml' >&2; \
      exit 1; \
    fi; \
    printf 'NEXT_PUBLIC_API_BASE_URL=%s\n' "$NEXT_PUBLIC_API_BASE_URL" > .env.production.local; \
    echo "сборка с API: $NEXT_PUBLIC_API_BASE_URL"; \
    npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["node", "--max-old-space-size=2048", "./node_modules/next/dist/bin/next", "start", "-p", "3000"]
