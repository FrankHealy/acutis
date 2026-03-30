# RN Bootstrap Guide (Acutis)

## 0. Root Assumption

React Native is bootstrapped directly in:

C:\Acutis\acutis.tab

DO NOT:
- create a separate repo (e.g. acutis.mobile)
- create a /mobile folder
- bootstrap at C:\Acutis root
- move RN outside acutis.tab

---

## 1. Purpose

Establish a minimal, production-aligned React Native foundation that:

- respects platform rules (audit, localisation, theme)
- supports shared-tablet workflows
- is offline-capable (queue-based)
- uses encrypted local storage

---

## 2. Non-Negotiables

- Audit is server-side only
- RN must not generate authoritative audit timestamps or actor identity
- RN may capture local timestamps as non-authoritative business metadata only
- Local timestamps must never be treated as audit truth

- Localisation keys are shared with web
- Theme tokens are shared with web

- SQLite MUST be encrypted (SQLCipher)
- Device is not a trusted source of truth

- RN must not introduce parallel models or logic

---

## 3. Local Timestamp Rule

Allowed:
- capturedAtLocal
- occurredAtClient
- deviceRecordedAt

Reserved for server only:
- createdAt
- auditCreatedAt
- auditedAt

---

## 4. Setup

Run from:

C:\Acutis\acutis.tab

If Expo is not initialised:

npx create-expo-app@latest . --template

Then install:

npx expo install expo-router expo-sqlite expo-secure-store expo-localization react-native-safe-area-context react-native-screens react-native-gesture-handler

---

## 5. SQLite (Encrypted)

Mandatory:

- SQLCipher enabled via Expo config plugin
- DB key stored in SecureStore
- No plaintext PII

---

## 6. Structure

app/     1 navigation only  
src/     1 application logic  
assets/  1 static resources  

---

## 7. Required Before Features

Do NOT build features until:

- Expo app runs
- routing works
- SQLite opens (encrypted)
- SecureStore works
- DB init works
- sync queue table exists

---

## 8. Sync Model

- queue-based
- atomic
- idempotent
- server authoritative

---

## 9. Shared Tablet Discipline

Assume:
- multiple users
- interruptions

Must support:
- fast login/logout
- resumable workflows
- no long linear flows

---

## 10. First Feature

Roll Call (end-to-end)

- start session
- show roster
- mark attendance
- save incrementally
- show sync state

---

## 11. Do Not

- build form builder
- overbuild offline
- duplicate API logic
- create new audit system

---
Y
## 12. Delivery Gate

RN is not ready until:

- audit is server authoritative
- local timestamps clearly non-authoritative
- localisation keys used
- theme tokens used
- payloads minimised
- no new source of truth introduced
Keycloak (React Native / acutis.tab)

React Native in acutis.tab must use Keycloak as the identity provider, but it must do so as a native/public OIDC client, not by reusing browser-oriented assumptions from web.

Keycloak’s OIDC docs describe the Authorization Code flow as the standard flow that returns an authorization code, which is then exchanged for access and refresh tokens. Keycloak’s JavaScript adapter docs also state that public clients are created by turning client authentication off, and Keycloak’s docs continue to emphasise standards-based OIDC endpoints rather than proprietary mobile flows.

RN authentication rules
acutis.tab must have its own Keycloak client
The RN client must be a public client
Use Authorization Code Flow with PKCE
Use the system browser / app redirect URI
Do not use embedded webviews for login
Do not assume web/browser SSO behaviour maps directly to RN
Access and refresh tokens must be stored only in secure storage
Logout must be explicit and reliable

Keycloak’s securing-apps guidance and adapter docs support Authorization Code flow as the default/recommended direction, while the docs also warn that redirect URI and origin configuration must be specific to avoid vulnerabilities. Keycloak’s current downloads page also shows the JavaScript adapter as a separate standalone release and the Node.js adapter as deprecated, which reinforces the “standards-first, adapter-light” approach for new client work.

Realm/client setup

Create a dedicated client for the tablet app, for example:

Client ID: tab-client
Client type: OpenID Connect
Client authentication: Off
Standard flow: Enabled
Direct access grants: Disabled unless explicitly approved
Implicit flow: Disabled
Service accounts: Disabled

Redirect URIs must be restricted to the RN app’s actual redirect pattern, and not left broad. Web origins should also be tightly scoped where applicable. Keycloak explicitly says redirect URIs and web origins should be configured as specifically as possible.

Token handling rules
Short-lived access token
Refresh token stored in secure storage only
Never store tokens in plaintext local DB
Never treat token presence as proof that the current human holding the tablet is the acting user
Session expiry / re-entry must fit shared-tablet discipline
API expectations

acutis.api remains the token-validating resource server.

Required outcome:

RN obtains bearer tokens from Keycloak
RN calls acutis.api with those bearer tokens
acutis.api remains authoritative for token validation, permissions, and audited action application
RN must not bypass API permission checks just because the user is authenticated
Do not
do not reuse a web-only client for RN
do not use implicit flow
do not build login around embedded webview assumptions
do not place client secrets in RN
do not let auth/session design weaken shared-tablet safety
Delivery gate

RN auth is not ready until:

Keycloak public client exists for acutis.tab
Authorization Code + PKCE flow works end-to-end
redirect URI works reliably on device
tokens are stored only in secure storage
