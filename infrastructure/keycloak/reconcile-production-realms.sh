#!/usr/bin/env bash
set -euo pipefail

KCADM=/opt/keycloak/bin/kcadm.sh
SERVER_URL=${KEYCLOAK_INTERNAL_URL:-http://localhost:8080}
PUBLIC_URL=${KEYCLOAK_PUBLIC_URL:-https://acutis.salientrecovery.com/keycloak}

"$KCADM" config credentials \
  --server "$SERVER_URL" \
  --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" \
  --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" >/dev/null

exists() {
  "$KCADM" get "$1" ${2:+-r "$2"} >/dev/null 2>&1
}

ensure_realm() {
  local realm=$1 display=$2
  if ! exists "realms/$realm"; then
    "$KCADM" create realms \
      -s "realm=$realm" -s "displayName=$display" -s enabled=true \
      -s registrationAllowed=false -s loginWithEmailAllowed=true >/dev/null
  fi
}

ensure_role() {
  local realm=$1 role=$2
  if ! exists "roles/$role" "$realm"; then
    "$KCADM" create roles -r "$realm" -s "name=$role" >/dev/null
  fi
}

client_id() {
  "$KCADM" get clients -r "$1" -q "clientId=$2" --fields id \
    | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1
}

ensure_client() {
  local realm=$1 name=$2 public=$3 redirects_json=$4 origins_json=$5
  local id
  id=$(client_id "$realm" "$name")
  if [[ -z "$id" ]]; then
    "$KCADM" create clients -r "$realm" \
      -s "clientId=$name" -s enabled=true -s protocol=openid-connect \
      -s "publicClient=$public" -s standardFlowEnabled=true \
      -s directAccessGrantsEnabled=false \
      -s "redirectUris=$redirects_json" -s "webOrigins=$origins_json" >/dev/null
    id=$(client_id "$realm" "$name")
  fi
  printf '%s' "$id"
}

ensure_broker() {
  local product_realm=$1 broker_client=$2
  local callback="$PUBLIC_URL/realms/$product_realm/broker/acutis-identity/endpoint"
  local broker_id secret_file secret
  broker_id=$(ensure_client acutisrealm "$broker_client" false "[\"$callback\"]" '[]')
  secret_file=$(mktemp)
  "$KCADM" get "clients/$broker_id/client-secret" -r acutisrealm > "$secret_file"
  secret=$(sed -n 's/.*"value"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$secret_file" | head -1)
  rm -f "$secret_file"
  if [[ -z "$secret" ]]; then
    echo "Unable to obtain broker secret for $broker_client" >&2
    exit 1
  fi

  if ! exists identity-provider/instances/acutis-identity "$product_realm"; then
    local body
    body=$(mktemp)
    cat > "$body" <<JSON
{
  "alias": "acutis-identity",
  "displayName": "Acutis",
  "providerId": "oidc",
  "enabled": true,
  "trustEmail": true,
  "firstBrokerLoginFlowAlias": "first broker login",
  "config": {
    "authorizationUrl": "$PUBLIC_URL/realms/acutisrealm/protocol/openid-connect/auth",
    "tokenUrl": "$PUBLIC_URL/realms/acutisrealm/protocol/openid-connect/token",
    "userInfoUrl": "$PUBLIC_URL/realms/acutisrealm/protocol/openid-connect/userinfo",
    "issuer": "$PUBLIC_URL/realms/acutisrealm",
    "clientId": "$broker_client",
    "clientSecret": "$secret",
    "clientAuthMethod": "client_secret_post",
    "defaultScope": "openid profile email",
    "syncMode": "IMPORT"
  }
}
JSON
    "$KCADM" create identity-provider/instances -r "$product_realm" -f "$body" >/dev/null
    rm -f "$body"
  fi
}

ensure_product_realm() {
  local realm=$1 display=$2 api_client=$3 mobile_client=$4 mobile_scheme=$5 broker_client=$6
  ensure_realm "$realm" "$display"
  ensure_role "$realm" product_access
  ensure_role "$realm" tenant_member
  ensure_role "$realm" demo_user
  # Web origins remain empty until a reviewed production hostname exists.
  ensure_client "$realm" "$realm-web" true '[]' '[]' >/dev/null
  ensure_client "$realm" "$mobile_client" true "[\"$mobile_scheme://redirect\"]" '[]' >/dev/null
  ensure_client "$realm" "$api_client" false '[]' '[]' >/dev/null
  ensure_broker "$realm" "$broker_client"
}

ensure_product_realm acutis-practitioner "Acutis Practitioner" \
  practitioner-api practitioner-mobile acutis-practitioner practitioner-identity-broker
ensure_product_realm acutis-community "Acutis Community" \
  community-api community-mobile acutis-community community-identity-broker

# Outreach intentionally remains a client of the central realm and has no product realm.
ensure_client acutisrealm outreach-web false '[]' '[]' >/dev/null

echo "Production realm reconciliation completed."
