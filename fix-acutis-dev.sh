#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/acutis/acutis"
WEB_ENV="$APP_ROOT/acutis.web/.env.local"
APP_IP="167.233.16.141"
API_URL="http://localhost:5010"
KC_URL="http://$APP_IP:8080"
REALM="acutisrealm"

echo "== Backup env =="
cp "$WEB_ENV" "$WEB_ENV.backup.$(date +%F-%H%M%S)"

echo "== Rewrite web env =="
cat > "$WEB_ENV" <<EOF
AUTH_KEYCLOAK_ID=web-client
AUTH_KEYCLOAK_SECRET=DFqF6P3hiKf6ieX14gni8QPRdCz9Wgcp
AUTH_KEYCLOAK_ISSUER=$KC_URL/realms/$REALM
NEXTAUTH_URL=http://$APP_IP:3000
NEXTAUTH_SECRET=acutis-dev-secret-key-change-in-production-12345
NEXT_PUBLIC_DISABLE_AUTH=false
NEXT_PUBLIC_API_BASE_URL=/api-proxy
INTERNAL_API_BASE_URL=$API_URL
EOF

echo "== Stop old Next/npm/node dev processes =="
pkill -f "next dev" || true
pkill -f "npm run dev" || true

echo "== Check Keycloak container =="
docker ps | grep -E "keycloak|keycloak-db" || true

echo "== Check Keycloak discovery =="
curl -fsS "$KC_URL/realms/$REALM/.well-known/openid-configuration" >/dev/null \
  && echo "Keycloak realm OK" \
  || echo "Keycloak realm FAILED"

echo "== Check API =="
curl -i "$API_URL/api/configuration/centres?includeInactive=false" | head -20

echo "== Search for localhost:8080 references =="
grep -R "localhost:8080" "$APP_ROOT" -n \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git || true

echo "== Current env =="
cat "$WEB_ENV"

echo "== Start Next =="
cd "$APP_ROOT"
npm run dev