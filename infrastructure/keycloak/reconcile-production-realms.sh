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
  else
    "$KCADM" update "clients/$id" -r "$realm" \
      -s enabled=true -s "publicClient=$public" \
      -s standardFlowEnabled=true -s directAccessGrantsEnabled=false \
      -s "redirectUris=$redirects_json" -s "webOrigins=$origins_json" >/dev/null
  fi
  printf '%s' "$id"
}

ensure_api_audience() {
  local realm=$1 source_client=$2 audience=$3
  local source_id mapper_name mappers
  source_id=$(client_id "$realm" "$source_client")
  mapper_name="$audience-audience"
  mappers=$("$KCADM" get "clients/$source_id/protocol-mappers/models" -r "$realm")
  if ! grep -q "\"name\"[[:space:]]*:[[:space:]]*\"$mapper_name\"" <<< "$mappers"; then
    "$KCADM" create "clients/$source_id/protocol-mappers/models" -r "$realm" \
      -s "name=$mapper_name" -s protocol=openid-connect \
      -s protocolMapper=oidc-audience-mapper -s consentRequired=false \
      -s "config.\"included.client.audience\"=$audience" \
      -s 'config."id.token.claim"=false' -s 'config."access.token.claim"=true' >/dev/null
  fi
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

ensure_default_broker_redirect() {
  local realm=$1 executions execution_id config_id body
  executions=$("$KCADM" get authentication/flows/browser/executions -r "$realm")
  execution_id=$(sed -n '
    /"id"[[:space:]]*:/ {
      s/^.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*$/\1/
      h
    }
    /"providerId"[[:space:]]*:[[:space:]]*"identity-provider-redirector"/ {
      g
      p
      q
    }
  ' <<< "$executions")
  if [[ -z "$execution_id" ]]; then
    echo "Identity Provider Redirector execution is missing in $realm" >&2
    exit 1
  fi
  config_id=$(sed -n '
    /"id"[[:space:]]*:[[:space:]]*"'"$execution_id"'"/,/}, {/ {
      s/^.*"authenticationConfig"[[:space:]]*:[[:space:]]*"\([^"]*\)".*$/\1/p
    }
  ' <<< "$executions" | head -1)
  body=$(mktemp)
  cat > "$body" <<JSON
{
  "alias": "$realm-central-login",
  "config": {
    "defaultProvider": "acutis-identity"
  }
}
JSON
  if [[ -z "$config_id" ]]; then
    "$KCADM" create "authentication/executions/$execution_id/config" -r "$realm" -f "$body" >/dev/null
  else
    "$KCADM" update "authentication/config/$config_id" -r "$realm" -f "$body" >/dev/null
  fi
  rm -f "$body"
}

ensure_product_realm() {
  local realm=$1 display=$2 api_client=$3 mobile_client=$4 mobile_scheme=$5 broker_client=$6 web_origin=$7
  ensure_realm "$realm" "$display"
  ensure_role "$realm" product_access
  ensure_role "$realm" tenant_member
  ensure_role "$realm" demo_user
  ensure_client "$realm" "$realm-web" true "[\"$web_origin/*\"]" "[\"$web_origin\"]" >/dev/null
  ensure_client "$realm" "$mobile_client" true "[\"$mobile_scheme://redirect\"]" '[]' >/dev/null
  ensure_client "$realm" "$api_client" false '[]' '[]' >/dev/null
  ensure_api_audience "$realm" "$realm-web" "$api_client"
  ensure_api_audience "$realm" "$mobile_client" "$api_client"
  ensure_broker "$realm" "$broker_client"
  # Product credentials remain centralized. Normal product sign-in must broker
  # directly to acutisrealm instead of showing an empty product-realm form.
  ensure_default_broker_redirect "$realm"
}

ensure_product_realm acutis-practitioner "Acutis Practitioner" \
  practitioner-api practitioner-mobile acutis-practitioner practitioner-identity-broker \
  https://practitioner.salientrecovery.com
ensure_product_realm acutis-community "Acutis Community" \
  community-api community-mobile acutis-community community-identity-broker \
  https://community.salientrecovery.com

# Outreach intentionally remains a client of the central realm and has no product realm.
ensure_client acutisrealm outreach-web false '[]' '[]' >/dev/null

echo "Production realm reconciliation completed."
