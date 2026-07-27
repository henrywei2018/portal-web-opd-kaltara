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
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"
PUBLIC="$BACKEND/public"

DO_FRONTEND=1
DO_BACKEND=1
case "${1:-}" in
  --frontend) DO_BACKEND=0 ;;
  --backend)  DO_FRONTEND=0 ;;
esac

build_frontend() {
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
  echo "==> Installing backend dependencies (production)..."
  cd "$BACKEND"
  composer install --no-dev --optimize-autoloader --no-interaction

  echo "==> Running migrations..."
  php artisan migrate --force

  echo "==> Caching config, routes, views..."
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache

  echo "==> Fixing storage permissions..."
  chmod -R ug+rw storage bootstrap/cache 2>/dev/null || true
}

[ "$DO_FRONTEND" = 1 ] && build_frontend
[ "$DO_BACKEND" = 1 ] && refresh_backend

echo ""
echo "✅ Done. Open your site — verify the homepage, /admin login, images (/gambar/*), and the contact form."
