# AGENTS.md

## Purpose
Web = UI over canonical API

No independent truth.

---

## Golden Rules

- Simple UI
- Reuse everything possible
- Testable flows
- Respect audit
- Localisation required
- Theme-aware only

---

## Rules

### Contracts
- Do not reinterpret API
- No duplicate models

### State
- No new global state patterns
- No stringly-typed state

### UI Truth
- No fake success states
- Must reflect real data

### Polling
- Avoid unless required

### Localisation
- Use keys
- No hardcoded shared text

### Theme
- No hardcoded colours
- Use tokens only

---

## File Touch Discipline

When modifying a file:

- Re-check:
  - simplicity
  - reuse
  - testability
  - audit correctness
  - localisation
  - theme awareness
  - no string state

- Fix small issues locally
- Do not expand scope

If bigger change needed → STOP

---

## Stop Conditions

- auth/session
- permissions
- state architecture
- contract meaning
- localisation system
- theme system
- domain boundaries

---

## Done Means

- Compiles
- UI matches real data
- No duplicate mechanisms
- No string state
- No unnecessary polling
- Localisation applied
- Theme-aware UI