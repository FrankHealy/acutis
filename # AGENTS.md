# AGENTS.md

## Purpose
Global rules for the Acutis system.

This file is the single source of truth.
All work must comply.

---

## Golden Rules

- Prefer simplicity over cleverness
- Reuse existing patterns — do not duplicate mechanisms
- Code must be testable and explicit
- No stringly-typed core state
- No unnecessary polling

---

## Audit (Non-negotiable)

- Server is authoritative
- No client-side audit truth
- Do not bypass audit paths

---

## Localisation

- Only localise text shown to users
- Do not localise machine metadata

---

## Theme

- No hardcoded colours
- Use semantic tokens only:
  surface, text, primary, success, warning, danger, border

---

## Core Domain Boundaries

- Resident = identity only
- ResidentCase = intake
- ResidentProgrammeEpisode = operational stay
- EpisodeEvent = timeline
- Incident ≠ Event

Do not collapse or blur these.

---

## Form Reality (Critical)

Forms are centre/unit specific and may vary.

We do not enforce perfect structure.

Rules:
- Forms must be renderable
- Forms must be storable
- Imperfect or messy fields are allowed
- Capture data can remain unstructured

---

## Bounded Field Rule

If a field declares itself as bounded:

- it must be valid
- it must map correctly
- it must not be ambiguous

If not:
→ treat as capture only
→ do not promote or interpret

Default:
→ all fields are capture unless explicitly bounded

---

## File Touch Discipline (MANDATORY)

Every time a file is modified:

- Re-check:
  - simplicity
  - reuse
  - testability
  - audit
  - localisation
  - theme
  - no string state

- Fix small issues in that file only
- Do NOT expand into unrelated files
- Do NOT refactor broadly

If broader change is required:
→ STOP and explain

Rule:
- Leave the file better than you found it
- Never introduce new violations

---

## Stop Conditions

STOP and explain if changing:

- auth / permissions
- audit logic
- API contracts
- state architecture
- offline/sync model
- domain boundaries
- localisation model
- theme semantics

---

## Done Means

- Scope respected
- No duplicate mechanisms
- No stringly-typed state
- Audit intact
- Localisation respected
- Theme-aware UI
- Code is simple and testable