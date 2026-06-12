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

# AGENTS.md — acutis.tab React Native Tablet Application

## Project Purpose

`acutis.tab` is the React Native tablet application for Acutis.

It is designed for residential treatment centres and community services, supporting admissions, detox operations, roll call, group therapy, room allocation, scheduling, and continuity of care.

The application is intended for real-world deployment in treatment centres and must be built as a production-quality system from the beginning.

This is not a demo application.

The target environment includes:

* Shared tablets
* Poor or intermittent Wi-Fi
* Clinical and counselling staff
* Admissions workflows
* Group therapy sessions
* Offline operation
* GDPR-sensitive environments
* Future multi-centre deployment

---

# Technology Stack

Current platform:

* Expo 55
* React Native 0.83
* Expo Router
* TypeScript
* Keycloak authentication
* SQLite local storage
* Acutis .NET API backend

---

# Current State

The following already exists:

* Auth shell with Keycloak wiring.
* Dev auth bypass controlled through configuration.
* Landing/dashboard routes for Detox and Alcohol.
* Detox dashboard with metrics, timeline, and quick actions.
* Detox admissions queue.
* Scheduling board integration.

Current endpoint:

```text
/api/Screenings/scheduling-board?unitId=detox
```

* Detox room map renderer.
* Offline SQLite scaffolding.
* Roll call offline support.
* Sync queue scaffolding.

Current SQLite tables:

```text
sync_queue
roll_call
```

---

# Core Design Philosophy

Prefer:

* Simple
* Explicit
* Configurable
* Offline-first
* Defensive
* Boring

Avoid:

* Clever abstractions
* Hidden behaviour
* Magic configuration
* Hard-coded centre logic
* Premature optimisation

The goal is reliability, not novelty.

---

# Golden Rule

If changing any of the following requires editing React Native screens:

* Centre
* Unit
* Form
* Theme
* Language
* Room map
* Lookup list
* Workflow

then the design is probably wrong.

Configuration should drive behaviour.

---

# Production-First Rules

Everything must be built as if it will be deployed tomorrow.

No temporary shortcuts.

No demo-only architecture.

No assumptions that connectivity will always exist.

No assumptions that staff are technical.

---

# Configuration Is First-Class

Configuration is one of the most important architectural concerns in Acutis.

The application must be configuration-driven wherever possible.

Configuration should control:

* Sites
* Centres
* Units
* Admissions workflows
* Form definitions
* Validation rules
* Room maps
* Lookup data
* Themes
* Localisation
* Feature flags
* Synchronisation behaviour
* API settings
* Authentication settings

Do not hard-code operational behaviour.

---

# Configuration Requirements

Configuration must support:

* Versioning
* Offline caching
* Rollback
* Validation
* Refresh
* Synchronisation

The application must always know:

* Current configuration version
* Last refresh timestamp
* Sync status

Configuration refresh failure must not prevent operation when valid cached configuration exists.

Production configuration must never enable authentication bypass.

---

# Suggested Configuration Domains

```text
site.config.json

units.config.json

forms.config.json

maps.config.json

lookups.config.json

theme.config.json

i18n.config.json

features.config.json

sync.config.json
```

Physical implementation may vary.

Logical separation should remain.

---

# Offline First

The tablet application must operate correctly with unreliable connectivity.

Support offline operation for:

* Admissions
* Roll call
* Group therapy
* Room allocation where practical
* Lookup data
* Synchronisation queues

The user must never lose work because connectivity disappears.

---

# Admissions Persistence

Admissions must not exist solely in component state.

Admission progress must be stored locally.

Requirements:

* Save progress continuously.
* Support drafts.
* Recover after app restart.
* Recover after device restart.
* Queue completed admissions.
* Retry synchronisation safely.

---

# Synchronisation States

Use explicit states:

```text
Draft

Ready To Submit

Pending Sync

Synced

Sync Failed
```

Never imply data has been uploaded when it has not.

---

# SQLite Rules

SQLite already exists.

Current database:

```text
acutis.db
```

Current tables:

```text
sync_queue
roll_call
```

Expand carefully.

Suggested additions:

```text
admission_drafts

admission_sections

admission_signatures

admission_room_assignments

group_therapy_sessions

lookup_cache

configuration_cache
```

Do not break existing roll call functionality.

---

# SQLite Encryption

Current implementation attempts:

```sql
PRAGMA key
```

This does not guarantee encryption.

Do not claim encryption unless a verified SQLCipher-capable implementation is installed and confirmed.

---

# Authentication Rules

Keycloak is the source of truth.

Rules:

* No production auth bypass.
* No embedded secrets.
* Environment-based configuration.
* Defensive token handling.
* Clear logout behaviour.
* Support shared tablet workflows.

---

# Shared Tablet Rules

Assume tablets are shared.

Requirements:

* Clear user identity.
* Clear session ownership.
* Clear logout path.
* Prevent exposure of previous resident information.
* Prevent accidental access to another user's work.
* Protect draft ownership where applicable.

---

# Sensitive Data Rules

Store the minimum amount of sensitive data required.

Avoid unnecessary storage of:

* Audio
* Raw transcripts
* Excessive clinical narrative

Store structured information where possible.

---

# Speech-to-Text Rules

Speech-to-text is an input mechanism.

It is not a decision-making system.

Rules:

* User reviews output.
* Counsellor remains responsible.
* No automatic clinical decisions.
* Audio should not be retained.
* Final structured values are authoritative.

---

# Dynamic Form Engine

Admissions must be driven by configuration.

Do not hard-code admission forms into screens.

Support:

* Dynamic sections
* Dynamic fields
* Validation
* Required fields
* Review generation
* Future form revisions

Form changes should not require application rewrites.

---

# Review and Signature Screens

Signature screens are mandatory.

Support:

* Staff signature
* Service user signature
* Timestamp
* Name
* Role
* Review before submission

Prevent accidental submission.

---

# Room Maps

Room maps must be data-driven.

Do not hard-code Detox layouts.

Room maps should load from configuration.

Support:

* Rooms
* Beds
* Coordinates
* Labels
* Occupancy
* Selection state

The renderer should work for:

* Detox
* Alcohol
* Drugs
* Ladies
* Future units

without code duplication.

---

# Room Assignment

Room assignment is part of admissions.

Expected flow:

```text
Select Admission

Complete Sections

Assign Room

Review

Sign

Submit
```

Room assignment must not exist as a disconnected workflow.

---

# Lookup Data Strategy

Lookup data must not be hard-coded.

Examples:

* Nationalities
* Units
* Rooms
* Beds
* Admission statuses
* GT themes
* Staff roles
* Programme definitions
* Risk categories
* Validation values

Lookup data must support:

* Versioning
* Offline caching
* Refresh
* Recovery

---

# Reference Data Synchronisation

Reference data is separate from operational data.

Separate:

* Lookup sync
* Config sync
* Admissions sync
* Roll call sync
* Group therapy sync

A lookup refresh failure must not break operations.

---

# Nightly Synchronisation

Reference data should refresh automatically.

Preferred behaviour:

* Sync at startup.
* Refresh after overnight window.
* Refresh when network becomes available.

Suggested window:

```text
02:00–05:00 local time
```

Use cached data if refresh fails.

---

# Localisation (i18n)

Localisation must exist from the beginning.

Do not hard-code user-facing strings.

All visible text should use translation keys.

Requirements:

* Unicode support
* Irish support
* English support
* Future language support
* Variable text length support

Do not assume English-only layouts.

---

# Theming

Theming must be centralised.

Do not scatter colours and spacing throughout the application.

Theme controls:

* Colours
* Typography
* Spacing
* Status colours
* Branding
* Layout density

Future site branding should not require component rewrites.

---

# Group Therapy (GT) Is A Primary Workflow

Group Therapy is one of the most important screens in the system.

It is not a secondary feature.

The GT workflow must prioritise:

* Attendance
* Current speaker
* Previous speaker
* Continuity between sessions
* Themes discussed
* Flags
* Facilitator handover
* Shared tablet usability

GT must help staff answer:

* Who last spoke?
* What were they discussing?
* What themes are recurring?
* What requires follow-up?

---

# GT Design Rules

Optimise for tablets.

Requirements:

* Large touch targets
* Landscape support
* Fast operation
* Low cognitive load
* Minimal typing
* Safe visibility in group settings

Avoid:

* Tiny controls
* Deep navigation
* Complex gestures
* Overly dense screens

---

# Acutis Continuity Principle

The system exists to support programme continuity.

Every screen should reinforce continuity.

Examples:

* Previous attendance
* Previous room assignment
* Previous discussions
* Previous flags
* Previous admissions activity

The system should assist staff handover.

---

# API Rules

Use existing backend contracts wherever possible.

Do not invent production contracts.

All API calls should support:

* Authentication
* Timeout handling
* Error handling
* Retry handling
* Offline resilience

Keep mock data isolated.

---

# Error Handling

Never hide failures.

Requirements:

* User-visible errors where appropriate.
* Retry options.
* Logging.
* Safe fallback behaviour.

Avoid:

```typescript
catch {}
```

Silent failures are unacceptable.

---

# Testing Requirements

A real test strategy is required.

Minimum package.json:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

Tests should cover:

* Validation
* Form rendering
* SQLite repositories
* Sync state transitions
* Lookup refresh
* Configuration loading
* Room map parsing

---

# Character Encoding

Remove all mojibake.

Examples:

```text
â€º
â€¢
â€™
â€œ
â€�
Â
```

Use UTF-8 throughout.

---

# Code Style

Prefer:

* TypeScript strict mode
* Small components
* Explicit domain models
* Repository pattern
* Service layer
* Pure validation
* Strong typing

Avoid:

* Massive screens
* Business logic inside JSX
* Hidden side effects
* Magic constants
* Unit-specific hard-coding

---

# Suggested Structure

```text
app/
  detox/
  alcohol/
  drugs/
  ladies/

src/
  auth/
  api/
  db/
  sync/
  config/
  lookups/
  i18n/
  theme/
  admissions/
  groupTherapy/
  rollCall/
  maps/
  units/
  shared/
```

Refactor incrementally.

Do not reorganise solely for aesthetics.

---

# Immediate Priorities

1. Remove mojibake characters.
2. Add proper test script.
3. Add admissions SQLite persistence.
4. Implement dynamic admission form engine.
5. Add validation.
6. Add progress tracking.
7. Add review screen.
8. Add signature capture.
9. Wire room assignment.
10. Move Detox map to configuration.
11. Add admissions sync queue.
12. Add lookup synchronisation.
13. Add configuration synchronisation.
14. Harden authentication.
15. Improve GT workflow for tablet-first usage.

---

# Definition Of Done — Admissions MVP

Admissions MVP is complete when:

* Staff can open Detox admissions queue.
* Staff can start admission.
* Dynamic sections render correctly.
* Progress is saved locally.
* Drafts survive restart.
* Validation works.
* Room assignment works.
* Review works.
* Signatures work.
* Submission works.
* Offline submission queues correctly.
* Sync status is visible.
* No placeholder screens remain.
* No hard-coded Detox map remains.
* Lookup data is configurable.
* Localisation framework exists.
* Theme framework exists.
* Tests run successfully.

---

# Scope Discipline

Do not introduce speculative features.

Avoid:

* AI assistants
* Analytics engines
* Cross-agency workflows
* Advanced reporting
* Predictive features

unless explicitly requested.

The objective is a stable, deployable, offline-capable tablet application that supports admissions, operations, group therapy, and programme continuity in real treatment environments.
