# RN Delivery Guardrails

## Purpose
Build a scoped React Native client for operational use without fragmenting platform rules already established in web and API.

Scope for RN:
- Roll Call
- Therapy Sessions
- Timeline
- Admissions

Out of scope for first pass:
- Form Builder
- Config/Admin
- Drag and Drop
- Injection body map
- Broad desktop workflows

## Non-Negotiables

### 1. Audit Is Shared
- Audit rules are platform-wide, not app-specific.
- RN must never generate authoritative audit timestamps.
- RN must never generate authoritative audit actor identity.
- All audit timestamps, actor IDs, actor roles, request metadata, and audit persistence remain server-generated.
- Audit payloads must pass through the same central scrubber as web/API flows.
- RN must not introduce a parallel audit store or local audit schema.

Required outcome:
- RN actions hit audited API endpoints or equivalent audited server flows.
- No client-side bypass of audit creation.
- No PII/PPS leakage in audit payloads.

### 2. Localisation Is Shared
- RN must use the same localisation keys as web.
- No RN-only phrase strings for shared workflows.
- Backend text resources remain the source of truth.
- Arabic support must use the same keys and translation rows as web.
- New strings added for RN must be added as stable keys, not inline literals.

Required outcome:
- Same key means same meaning on web and RN.
- No duplicated translation dictionaries drifting by platform.

### 3. Theme Is Shared
- RN may render differently, but it must use the same semantic theme model.
- Theme names and tokens must stay aligned with web.
- Do not create separate mobile-only theme naming unless explicitly approved.
- Natural remains the default theme unless changed centrally.

Required outcome:
- Shared semantic tokens such as:
  - surface
  - text
  - text-muted
  - primary
  - success
  - warning
  - danger
  - border
- Platform-specific components map to shared tokens.

## API Rules

### 4. Minimise Data to Tablet
- RN endpoints must default to minimum necessary payloads.
- List, map, roll call, and timeline APIs should return operational view models, not full resident records.
- Full detail requires explicit drill-in.

Do not send by default:
- PPS
- full DOB unless essential
- full address
- next of kin details
- GP details
- unnecessary free-text notes
- broad clinical history

Preferred default identifiers:
- residentId or residentCaseId
- ReferralReference
- display name or initials only where needed
- unit, room, bed, attendance, workflow status

### 5. Offline-Ready Does Not Mean Client-Authoritative
- If offline comes later, client event time may be stored as business metadata only.
- Server remains authoritative for audit timestamp and acting user at sync/apply time.
- Do not design offline in a way that weakens audit guarantees.

## Architectural Rules

### 6. Shared Contracts, Native UI
- Reuse contracts, not web components.

Shared:
- API contracts
- workflow rules
- validation logic where practical
- localisation keys
- theme tokens

Native rewrite:
- screen components
- navigation
- camera and photo flows
- floorplan and map presentation
- touch interactions

### 7. Keep Therapy Independent
- Therapy must remain operationally independent from Admissions and Screening.
- Shared entities are acceptable.
- UI coupling is not.

### 8. Maps First Pass
- No drag and drop.
- Floorplans and maps are touch-driven.
- Roundels link to residents or beds.
- Actions are explicit:
  - tap
  - inspect
  - assign
  - move
  - vacate
  - confirm

## Delivery Order

### 9. Recommended Sequence
1. Infrastructure
   - Keycloak auth
   - encrypted SQLite
   - API client
   - localisation loader
   - theme token foundation
2. One list screen
   - ideally Roll Call
3. Therapy Sessions
4. Timeline
5. Admissions
6. Maps and floorplans

## Quality Gates

### 10. RN Work Is Not Done Unless
- audit path is server-generated and scrubbed
- localisation keys are shared and resolved correctly
- theme tokens align with web semantics
- API payloads are minimised for tablet use
- no new platform-specific source of truth is introduced

## Red Flags
- RN storing its own authoritative audit trail
- RN introducing inline English strings for shared workflows
- RN inventing a separate theme vocabulary
- tablet endpoints returning full resident payloads by default
- shared workflow names differing between web and RN

## Decision Rule
If speed and platform consistency conflict:
- protect audit
- protect localisation
- protect theme
- then simplify the feature
