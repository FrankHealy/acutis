# AGENTS.md

## Purpose
Tablet = operational client (offline-capable, shared device)

Not a source of truth.

---

## Golden Rules

- Simple, short flows
- Reuse API + web semantics
- Testable behaviour
- Server-authoritative audit
- Shared localisation
- Theme-aware

---

## Rules

### Audit
- Server-only truth
- Local timestamps = non-authoritative only

### Auth
- Proper OIDC (no web assumptions)
- Secure storage only

### Offline
- Queue-based
- Explicit
- No hidden sync logic

### Data
- Minimise payloads
- Avoid unnecessary PII

### Localisation
- Same keys as web
- No RN-only text

### Theme
- No hardcoded colours
- Same semantic tokens as web

### State
- No stringly-typed state

---

## File Touch Discipline

When modifying a file:

- Re-check:
  - simplicity
  - reuse
  - testability
  - audit rules
  - localisation
  - theme awareness
  - no string state

- Fix small issues locally
- Do not expand scope

If broader change needed → STOP

---

## Stop Conditions

- auth/token handling
- offline/sync model
- audit handling
- contract meaning
- localisation system
- theme semantics
- domain boundaries

---

## Done Means

- Builds + runs
- Flow works on device
- No duplicate mechanisms
- No string state
- Audit preserved
- Local timestamps non-authoritative
- Localisation used
- Theme-aware UI