#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

archive=${1:?Usage: deploy-production-release.sh RELEASE_ARCHIVE COMMIT_SHA}
commit=${2:?Usage: deploy-production-release.sh RELEASE_ARCHIVE COMMIT_SHA}
root=/opt/acutis
releases=$root/releases
release=$releases/$commit
current=$releases/current
previous=

[[ $commit =~ ^[0-9a-f]{40}$ ]] || { echo "Invalid commit SHA" >&2; exit 1; }
[[ -f $archive ]] || { echo "Release archive not found" >&2; exit 1; }
[[ -s $root/config/api.env && -s $root/config/web.env ]] || {
  echo "Production environment files are missing" >&2
  exit 1
}

# Authentication state is independent of the application artifact. Capture it
# before every cutover and validate the dump while PostgreSQL remains online.
backup=$root/backups/pre-release-$commit-$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 0700 "$backup"
docker exec keycloak-db pg_dump -U keycloak -d keycloak -Fc > "$backup/keycloak.dump"
docker exec -i keycloak-db pg_restore -l < "$backup/keycloak.dump" > "$backup/restore-list.txt"
test -s "$backup/keycloak.dump"
test -s "$backup/restore-list.txt"
sha256sum "$backup"/* > "$backup/SHA256SUMS"

if [[ -L $current ]]; then
  previous=$(readlink -f "$current")
fi

install -d -m 0755 "$releases"
if [[ ! -d $release ]]; then
  staging=$(mktemp -d "$releases/.staging-$commit-XXXXXX")
  trap 'rm -rf "${staging:-}"' EXIT
  tar -xzf "$archive" -C "$staging"
  [[ -f $staging/api/Acutis.Api.dll ]] || { echo "API artifact missing" >&2; exit 1; }
  [[ -f $staging/web/acutis.centre/acutis.centre.web/server.js ]] || { echo "Web artifact missing" >&2; exit 1; }
  printf '%s\n' "$commit" > "$staging/COMMIT"
  mv "$staging" "$release"
  staging=
fi

ln -sfn "$release" "$releases/.current-new"
mv -Tf "$releases/.current-new" "$current"
systemctl restart acutis-api-release.service
for _ in {1..30}; do
  code=$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 5 http://127.0.0.1:5011/ || true)
  [[ $code =~ ^[1-4][0-9][0-9]$ ]] && break
  sleep 2
done
code=$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 10 http://127.0.0.1:5011/ || true)
[[ $code =~ ^[1-4][0-9][0-9]$ ]] || { echo "API health check failed" >&2; exit 1; }

systemctl restart acutis-web-release.service
for _ in {1..30}; do
  curl --fail --silent --max-time 5 http://127.0.0.1:3003/ >/dev/null && break
  sleep 2
done
if ! curl --fail --silent --max-time 10 http://127.0.0.1:3003/ >/dev/null; then
  if [[ -n $previous && -d $previous ]]; then
    ln -sfn "$previous" "$releases/.current-rollback"
    mv -Tf "$releases/.current-rollback" "$current"
    systemctl restart acutis-api-release.service acutis-web-release.service
  fi
  echo "Web health check failed; previous release restored" >&2
  exit 1
fi

curl --fail --silent --max-time 15 \
  https://acutis.salientrecovery.com/keycloak/realms/acutisrealm/.well-known/openid-configuration >/dev/null

echo "Deployed $commit; previous=${previous:-none}"
