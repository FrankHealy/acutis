# AGENTS.md

## Purpose
Global rules for the Acutis workspace.

Applies to:
- acutis.api
- acutis.web
- acutis.tab

Local AGENTS.md files may be stricter, never weaker.

---

## Golden Rules

### Simplicity
- Prefer the simplest working solution
- No clever abstractions unless clearly justified
- Keep changes small and local

### Reuse
- Reuse existing patterns, DTOs, services, components
- No duplicate mechanisms (auth, state, API, audit, sync, etc.)

### Testability
- Code must be easy to reason about and verify
- No hidden behaviour or magic defaults

### Audit (Non-negotiable)
- Server is authoritative
- No client-side audit truth
- Do not weaken audit paths

### Localisation
- Use keys, not inline English where feasible
- Shared semantics across web + tablet

### Theme Awareness
- No theme builder yet — still mandatory
- No hardcoded colours
- Use semantic tokens only:
  surface, text, primary, success, warning, danger, border

---

## Core Boundaries

- Resident = identity only
- ResidentCase = intake
- Episode = operational stay
- EpisodeEvent = timeline
- Incident = separate from planned events

Do not collapse or blur these.

---

## Global Prohibitions

- No duplicate mechanisms
- No stringly-typed core state
- No unnecessary polling
- No hidden persistence
- No divergent platform logic

---

## File Touch Discipline (MANDATORY)

Every time a file is modified:

- Re-check against:
  - simplicity
  - reuse
  - testability
  - audit
  - localisation
  - theme awareness
  - no string state
  - no duplicate mechanisms

- Fix small issues in that file immediately
- Do NOT expand into unrelated files
- Do NOT turn into refactor

If broader change needed → STOP and explain

### Rule
- Leave file better aligned than found
- Never introduce new violations

---

## Stop Conditions

STOP and explain if changing:
- auth / permissions
- audit
- contracts
- state architecture
- sync/offline
- localisation model
- theme semantics
- core domain boundaries

---

## Done Means

- Scope respected
- No duplicate mechanisms
- No string state
- Audit intact
- Localisation considered
- Theme awareness maintained
- Code simple + testable

## Form Definition Reality

Forms are centre/unit specific and may vary.

The system does not enforce perfect structure.

Rules:
- Form must be renderable
- Form must be storable
- Unknown or imperfect fields are allowed
- Capture data is allowed to be messy

Strict enforcement applies ONLY to:
- bounded fields
- schema mappings
- anything that affects core domain state

Everything else:
- tolerate
- store
- do not over-normalise

## Bounded Field Rule

If a field declares itself as bounded:

- it must be valid
- it must map correctly
- it must not be ambiguous

If not:
→ treat as capture only
→ do not attempt to interpret

## HSE Form Discipline (Critical)

The HSE form is a capture artifact, not canonical domain truth.

Rules:
- Do NOT treat form fields as authoritative domain structure.
- Do NOT promote form fields into bounded schema unless explicitly required.
- Do NOT assume repeated or named fields imply domain importance.
- Do NOT create new domain fields purely because they exist on the form.

Allowed:
- Store in FormSubmission (JSON/unbounded)
- Capture ambiguity
- Preserve assessor input

Promotion rule:
A form field may only be promoted into bounded domain schema if:
- it is semantically stable
- it is operationally important
- it is required for reporting, workflow, or safety
- it can be defined independently of assessor interpretation

If unsure:
→ KEEP IT IN FORM SUBMISSION
→ DO NOT PROMOTE