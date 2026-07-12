# AGENTS.md

## Purpose
API = source of truth (domain, audit, permissions, contracts)

---

## Golden Rules

- Simplicity over cleverness
- Reuse before adding
- Code must be testable
- Audit is server-authoritative
- Localisation uses keys
- Theme uses semantic tokens only

---

## Boundaries

- Resident ≠ Case ≠ Episode
- Do not collapse responsibilities
- Do not move lifecycle data to Resident

---

## Rules

### Audit
- Server-only truth
- Never trust client timestamps

### Contracts
- No duplicate DTOs
- No renaming core semantics

### State
- No stringly-typed state

### Persistence
- Explicit, boring, auditable

### Forms
- Use FormSubmission for complexity
- Stable keys required

### Localisation
- Keys over text
- Shared across platforms

### Theme
- No raw colours in contracts
- Only semantic tokens

---

## File Touch Discipline

When modifying a file:

- Re-check:
  - simplicity
  - reuse
  - testability
  - audit
  - localisation
  - theme
  - no string state

- Fix small issues locally
- Do not expand scope

If larger change needed → STOP

---

## Stop Conditions

- auth / permissions
- audit logic
- contracts
- persistence model
- domain boundaries
- localisation model
- theme semantics

---

## Done Means

- Build passes
- Boundaries preserved
- No duplicate mechanisms
- No string state
- Audit intact
- Localisation applied
- Theme-safe contracts