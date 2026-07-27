#!/usr/bin/env bash
# =============================================================================
# Dinkes/Portal — build & package for production
# Builds the React SPA, copies it into backend/public, and produces a lean,
# ready-to-upload zip (code + built SPA), excluding secrets, deps, and uploads.
#
# Usage:  ./package.sh
# Output: dist-prod/portal-prod-<timestamp>.zip
#
# On the SERVER after uploading & extracting:
#   1) cp backend/.env.production.example backend/.env   # then edit DB_*, APP_URL, etc.
#   2) ./deploy.sh --backend                             # composer install, migrate, cache
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAMP="$(date +%Y%m%d-%H%M)"
OUT="$ROOT/dist-prod/portal-prod-$STAMP.zip"

echo "==> [1/3] Building React SPA (production)…"
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  if [ -f package-lock.json ]; then npm ci; else npm install; fi
fi
npm run build

echo "==> [2/3] Copying SPA into backend/public…"
rm -rf "$ROOT/backend/public/assets"
cp -r "$ROOT/frontend/dist/." "$ROOT/backend/public/"

echo "==> [3/3] Creating deployment zip…"
cd "$ROOT"
mkdir -p "$ROOT/dist-prod"
python3 - "$ROOT" "$OUT" <<'PY'
import os, sys, zipfile, fnmatch
root, out = sys.argv[1], sys.argv[2]
INCLUDE       = ['backend', 'deploy.sh', 'DEPLOYMENT.md']
EXCLUDE_DIRS  = {'node_modules', 'vendor', '.git'}
EXCLUDE_GLOBS = [
    'backend/.env',                 # secret — configure on the server from .env.production.example
    'backend/database/*.sqlite',    # dev database
    'backend/public/gambar/*',      # uploaded/demo images (large) — start fresh on prod
    'backend/public/file/*',        # uploaded/demo documents (large) — start fresh on prod
    'backend/storage/logs/*.log',   # runtime logs
]
def excluded(rel):
    if any(part in EXCLUDE_DIRS for part in rel.split('/')):
        return True
    return any(fnmatch.fnmatch(rel, g) for g in EXCLUDE_GLOBS)

count = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for base in INCLUDE:
        p = os.path.join(root, base)
        if os.path.isfile(p):
            z.write(p, base); count += 1; continue
        for dp, dns, fns in os.walk(p):
            dns[:] = [d for d in dns if d not in EXCLUDE_DIRS]
            for f in fns:
                rel = os.path.relpath(os.path.join(dp, f), root)
                if not excluded(rel):
                    z.write(os.path.join(dp, f), rel); count += 1
    # keep writable upload dirs present (contents excluded above)
    for keep in ('backend/public/gambar/.gitkeep', 'backend/public/gambar/thumb/.gitkeep', 'backend/public/file/.gitkeep'):
        z.writestr(keep, '')
print(f"    {count} files")
PY

echo "==> Done."
ls -lh "$OUT" | awk '{print "    "$9"  ("$5")"}'
