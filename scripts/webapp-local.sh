#!/usr/bin/env bash
# Настоящий мини-апп на локальном стенде через Tailscale Funnel.
#
# ТОЛЬКО ДЛЯ ЛОКАЛЬНЫХ ПРОВЕРОК: используется тестовый бот, боевой бот и его
# кнопка меню в BotFather не трогаются. После сессии — `./scripts/webapp-local.sh down`.
#
#   up      открыть Funnel на фронт (443) и бэкенд (10000; 8443 на этой машине занят), напечатать адреса и
#           переменные окружения для бэкенда, фронта и бота
#   status  что сейчас опубликовано
#   down    закрыть всё (tailscale funnel reset)
#
# Требуется: установленный tailscale, вход в tailnet, Funnel разрешён в админке.
set -euo pipefail

FRONT_PORT="${FRONT_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
TEST_BOT_USERNAME="${TEST_BOT_USERNAME:-<тестовый_бот>}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "нужен $1" >&2; exit 1; }; }

host() {
  tailscale status --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))'
}

case "${1:-}" in
  up)
    need tailscale
    tailscale funnel --bg --https=443  "localhost:${FRONT_PORT}"
    tailscale funnel --bg --https=10000 "localhost:${BACKEND_PORT}"
    H="$(host)"
    FRONT_URL="https://${H}"
    API_URL="https://${H}:10000"
    cat <<EOF

Фронт:   ${FRONT_URL}
Бэкенд:  ${API_URL}

1) Бэкенд (backend/.env или окружение) — подпись initData сойдётся только с токеном ТЕСТОВОГО бота:
     TELEGRAM_BOT_TOKEN=<токен тестового бота>
     DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,${H}
     CORS_ALLOWED_ORIGINS=${FRONT_URL}
     CSRF_TRUSTED_ORIGINS=${FRONT_URL},${API_URL}

2) Фронт — адрес API вшивается при старте:
     NEXT_PUBLIC_API_BASE_URL=${API_URL}/api/v2 npm run dev

3) Бот (bot/) — локально, с токеном тестового бота:
     TELEGRAM_BOT_TOKEN=<токен тестового бота> WEB_APP_URL=${FRONT_URL} API_URL=${API_URL}

4) BotFather → @${TEST_BOT_USERNAME} → /setmenubutton → ${FRONT_URL}

5) Playwright, настоящий мини-апп (tests/e2e/.env):
     SITE_URL=${FRONT_URL}
     API_URL=${API_URL}
     TELEGRAM_TEST_BOT_USERNAME=${TEST_BOT_USERNAME}
     TELEGRAM_PHONE=...            # вход в web.telegram.org, один раз: npm run test:e2e:setup
     npx playwright test tests/e2e/specs/10-real-webapp.spec.ts --project=chromium --headed

Закрыть: $0 down
EOF
    ;;
  status)
    need tailscale
    tailscale funnel status
    ;;
  down)
    need tailscale
    tailscale funnel reset
    echo "Funnel закрыт. Кнопку меню тестового бота можно вернуть на прежний адрес."
    ;;
  *)
    sed -n '2,14p' "$0"
    exit 1
    ;;
esac
