#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

archive=${1:?Usage: deploy-products-release.sh RELEASE_ARCHIVE COMMIT_SHA}
commit=${2:?Usage: deploy-products-release.sh RELEASE_ARCHIVE COMMIT_SHA}
root=/opt/acutis
releases=$root/products/releases
release=$releases/$commit
current=$root/products/current
previous=

rollback() {
  if [[ -n $previous && -d $previous ]]; then
    ln -sfn "$previous" "$root/products/.current-rollback"
    mv -Tf "$root/products/.current-rollback" "$current"
    systemctl restart acutis-practitioner-api.service acutis-community-api.service
  fi
}

connection_value() {
  local file=$1 key=$2 line value
  line=$(grep -m1 "^${key}=" "$file")
  [[ -n $line ]] || return 1
  value=${line#*=}
  if [[ $value == \"*\" ]]; then value=${value:1:-1}; fi
  printf '%s' "$value"
}

[[ $commit =~ ^[0-9a-f]{40}$ ]] || { echo "Invalid commit SHA" >&2; exit 1; }
[[ -f $archive ]] || { echo "Product release archive not found" >&2; exit 1; }
[[ -s $root/config/practitioner-api.env && -s $root/config/community-api.env ]] || {
  echo "Product environment files are missing" >&2
  exit 1
}

# Keep authentication state independent of application releases, and capture a
# restorable database dump before every product cutover.
backup=$root/backups/pre-products-$commit-$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 0700 "$backup"
docker exec keycloak-db pg_dump -U keycloak -d keycloak -Fc > "$backup/keycloak.dump"
docker exec -i keycloak-db pg_restore -l < "$backup/keycloak.dump" > "$backup/restore-list.txt"
test -s "$backup/keycloak.dump"
test -s "$backup/restore-list.txt"
sha256sum "$backup"/* > "$backup/SHA256SUMS"

if [[ -L $current ]]; then previous=$(readlink -f "$current"); fi

install -d -m 0755 "$releases"
if [[ ! -d $release ]]; then
  staging=$(mktemp -d "$releases/.staging-$commit-XXXXXX")
  trap 'rm -rf "${staging:-}"' EXIT
  tar -xzf "$archive" -C "$staging"
  test -f "$staging/practitioner-api/Acutis.Practitioner.Api.dll"
  test -f "$staging/community-api/Acutis.Community.Api.dll"
  test -f "$staging/practitioner-web/index.html"
  test -f "$staging/community-web/index.html"
  test -f "$staging/practitioner-migrate"
  test -f "$staging/community-migrate"
  chmod 0755 "$staging/practitioner-migrate" "$staging/community-migrate"
  printf '%s\n' "$commit" > "$staging/COMMIT"
  mv "$staging" "$release"
  staging=
fi

practitioner_connection=$(connection_value "$root/config/practitioner-api.env" ConnectionStrings__Practitioner)
community_connection=$(connection_value "$root/config/community-api.env" ConnectionStrings__Community)
ConnectionStrings__Practitioner="$practitioner_connection" \
  "$release/practitioner-migrate" --connection "$practitioner_connection"
ConnectionStrings__Community="$community_connection" \
  "$release/community-migrate" --connection "$community_connection"

ln -sfn "$release" "$root/products/.current-new"
mv -Tf "$root/products/.current-new" "$current"
systemctl restart acutis-practitioner-api.service acutis-community-api.service

for endpoint in http://127.0.0.1:5010/health http://127.0.0.1:5020/health; do
  healthy=false
  for _ in {1..30}; do
    if curl --fail --silent --max-time 5 "$endpoint" >/dev/null; then healthy=true; break; fi
    sleep 2
  done
  if [[ $healthy != true ]]; then
    rollback
    echo "Product API health check failed for $endpoint; previous release restored" >&2
    exit 1
  fi
done

for product in practitioner community; do
  origin="https://$product.salientrecovery.com"
  page=$(mktemp)
  if ! curl --fail --silent --max-time 15 "$origin/" -o "$page"; then
    rm -f "$page"
    rollback
    echo "$product web health check failed; previous release restored" >&2
    exit 1
  fi
  asset=$(grep -oE '/assets/[^" ]+\.(js|css)' "$page" | head -1 || true)
  rm -f "$page"
  if [[ -z $asset ]] || ! curl --fail --silent --max-time 15 "$origin$asset" >/dev/null; then
    rollback
    echo "$product asset health check failed; previous release restored" >&2
    exit 1
  fi
  api_code=$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 10 "$origin/api/access" || true)
  if ! [[ $api_code =~ ^(200|401|403)$ ]]; then
    rollback
    echo "$product API proxy check failed with HTTP $api_code; previous release restored" >&2
    exit 1
  fi
  curl --fail --silent --max-time 15 \
    "https://acutis.salientrecovery.com/keycloak/realms/acutis-$product/.well-known/openid-configuration" >/dev/null
done

echo "Deployed product release $commit; previous=${previous:-none}"
