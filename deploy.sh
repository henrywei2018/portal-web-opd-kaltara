#!/usr/bin/env bash
# =============================================================================
# Dinkes Kaltara — build & deploy helper
# Run from the project root. Builds the React SPA, copies it into the Laravel
# public/ folder, installs backend deps, migrates, and caches config.
#
# Usage:
#   ./deploy.sh            # full build + backend refresh (first deploy / updates)
#   ./deploy.sh --frontend # rebuild & copy the SPA only
#   ./deploy.sh --backend  # backend deps + migrate + caches only
#
# Requires: node + npm (to build the SPA), php + composer (backend).
# On aaPanel you can also build the SPA on your PC and upload frontend/dist,
# then run: ./deploy.sh --backend
#
# The runtimes on $PATH may be too old (this server's default node is 20.18 and
# php is 8.1). The script picks a suitable one from aaPanel's /www/server tree
# instead of failing halfway. Override explicitly if needed:
#   NODE_BIN=/path/to/node PHP_BIN=/path/to/php ./deploy.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"
PUBLIC="$BACKEND/public"

# --- Toolchain selection -----------------------------------------------------
# Vite 8 / rolldown needs node ^20.19 || >=22.12 — on an older node npm silently
# SKIPS the platform binding (engines mismatch on an optional dep) and the build
# dies later with "Cannot find module @rolldown/binding-linux-x64-gnu".
# composer.lock's platform check needs PHP >= 8.4.1.
# Both pick the LOWEST version that qualifies: the closest match to what the
# project targets, and least likely to drift from the php-fpm serving the site.

NODE_MIN_DESC="^20.19 || >=22.12"
PHP_MIN="8.4.1"

node_ok() {
  [ -x "${1:-}" ] || return 1
  "$1" -e 'const [a,b]=process.versions.node.split(".").map(Number);
           process.exit(((a===20&&b>=19)||(a===22&&b>=12)||a>=23)?0:1)' 2>/dev/null
}

php_ok() {
  [ -x "${1:-}" ] || return 1
  "$1" -r 'exit(version_compare(PHP_VERSION, getenv("PHP_MIN"), ">=") ? 0 : 1);' 2>/dev/null
}

resolve_node() {
  if [ -n "${NODE_BIN:-}" ]; then
    node_ok "$NODE_BIN" || { echo "!! NODE_BIN=$NODE_BIN does not satisfy $NODE_MIN_DESC" >&2; return 1; }
  elif node_ok "$(command -v node || true)"; then
    NODE_BIN="$(command -v node)"
  else
    local cand
    for cand in $(printf '%s\n' /www/server/nodejs/v* | sort -V); do
      if node_ok "$cand/bin/node"; then NODE_BIN="$cand/bin/node"; break; fi
    done
  fi
  [ -n "${NODE_BIN:-}" ] || {
    echo "!! No node satisfying $NODE_MIN_DESC found (default: $(node -v 2>/dev/null || echo none))." >&2
    echo "   Install a newer node, or build the SPA elsewhere and run: ./deploy.sh --backend" >&2
    return 1
  }
  # npm resolves its own node via PATH, so put the chosen one first.
  PATH="$(dirname "$NODE_BIN"):$PATH"
  export PATH
  echo "==> node $("$NODE_BIN" -v) ($NODE_BIN)"
}

resolve_php() {
  export PHP_MIN
  if [ -n "${PHP_BIN:-}" ]; then
    php_ok "$PHP_BIN" || { echo "!! PHP_BIN=$PHP_BIN is older than $PHP_MIN" >&2; return 1; }
  elif php_ok "$(command -v php || true)"; then
    PHP_BIN="$(command -v php)"
  else
    local cand
    for cand in $(printf '%s\n' /www/server/php/* | sort -V); do
      if php_ok "$cand/bin/php"; then PHP_BIN="$cand/bin/php"; break; fi
    done
  fi
  [ -n "${PHP_BIN:-}" ] || {
    echo "!! No PHP >= $PHP_MIN found (default: $(php -r 'echo PHP_VERSION;' 2>/dev/null || echo none))." >&2
    return 1
  }
  echo "==> php $("$PHP_BIN" -r 'echo PHP_VERSION;') ($PHP_BIN)"
}

# composer is a phar — invoking it directly runs it under the DEFAULT php, which
# is what trips the platform check. Always drive it with the resolved binary.
composer_run() {
  local phar
  phar="$(command -v composer || true)"
  [ -n "$phar" ] || { echo "!! composer not found on PATH" >&2; return 1; }
  "$PHP_BIN" "$phar" "$@"
}

DO_FRONTEND=1
DO_BACKEND=1
case "${1:-}" in
  --frontend) DO_BACKEND=0 ;;
  --backend)  DO_FRONTEND=0 ;;
esac

# --- Per-site frontend env ---------------------------------------------------
# Vite bakes VITE_* into the bundle at BUILD time, so the SPA can never read
# backend/.env at runtime. Generate the override file instead: backend/.env stays
# the ONE place a site's keys are edited. .env.production.local is gitignored
# (*.local) and outranks the tracked .env.production, so `git pull` never touches
# a site's own values and never conflicts on them.
sync_frontend_env() {
  local src="$BACKEND/.env" out="$FRONTEND/.env.production.local"
  [ -f "$src" ] || { echo "!! $src tidak ada — lewati sync env frontend" >&2; return 0; }

  local site_key enabled
  site_key="$(sed -n 's/^RECAPTCHA_SITE_KEY=[[:space:]]*//p' "$src" | head -1 | tr -d '"'\''\r')"
  enabled="$(sed -n 's/^RECAPTCHA_ENABLED=[[:space:]]*//p' "$src" | head -1 | tr -d '"'\''\r')"
  [ -n "$enabled" ] || enabled=true
  # Tanpa site key, captcha tidak mungkin dirender — matikan agar form tetap jalan.
  [ -n "$site_key" ] || enabled=false

  {
    echo "# DIBUAT OTOMATIS oleh deploy.sh — jangan diedit; ubah backend/.env lalu deploy ulang."
    echo "# Sumber: RECAPTCHA_SITE_KEY dan RECAPTCHA_ENABLED di backend/.env"
    echo "VITE_RECAPTCHA_SITE_KEY=$site_key"
    echo "VITE_REQUIRE_RECAPTCHA=$enabled"
  } > "$out"
  echo "==> env frontend disinkronkan dari backend/.env (captcha aktif: $enabled)"
}

build_frontend() {
  resolve_node
  sync_frontend_env
  echo "==> Building React SPA..."
  cd "$FRONTEND"
  if [ -f package-lock.json ]; then npm ci; else npm install; fi
  npm run build

  echo "==> Copying dist/ into Laravel public/ (keeping gambar, storage, index.php)..."
  # Refresh hashed assets, then copy the rest of the build output.
  rm -rf "$PUBLIC/assets"
  cp -r "$FRONTEND/dist/." "$PUBLIC/"
  echo "    SPA copied to $PUBLIC"
}

refresh_backend() {
  resolve_php
  echo "==> Installing backend dependencies (production)..."
  cd "$BACKEND"
  composer_run install --no-dev --optimize-autoloader --no-interaction

  echo "==> Running migrations..."
  "$PHP_BIN" artisan migrate --force

  echo "==> Caching config, routes, views..."
  # Clear first: a stale cache built by another PHP version survives config:cache.
  "$PHP_BIN" artisan config:clear
  "$PHP_BIN" artisan route:clear
  "$PHP_BIN" artisan view:clear
  "$PHP_BIN" artisan config:cache
  "$PHP_BIN" artisan route:cache
  "$PHP_BIN" artisan view:cache

  echo "==> Fixing storage permissions..."
  chmod -R ug+rw storage bootstrap/cache 2>/dev/null || true
}

[ "$DO_FRONTEND" = 1 ] && build_frontend
[ "$DO_BACKEND" = 1 ] && refresh_backend

echo ""
echo "✅ Done. Open your site — verify the homepage, /admin login, images (/gambar/*), and the contact form."
