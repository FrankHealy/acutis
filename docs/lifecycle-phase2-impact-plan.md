# Lifecycle Refactor Phase 2 Impact Plan

This plan assumes Phase 1 remains additive:

- `ResidentCase` exists
- `ResidentProgrammeEpisode` has `ResidentCaseId`
- `ResidentProgrammeEpisode` has `CentreEpisodeCode`, `EntryYear`, `EntryWeek`, `EntrySequence`
- existing overloaded lifecycle fields still remain on `Resident` for compatibility

The purpose of Phase 2 is to move the API and frontend onto the new lifecycle model without breaking existing screens.

## Summary

Current impact is low because the migration is additive only.

Real cutover impact begins when these overloaded `Resident` fields stop being authoritative:

- `UnitId`
- `UnitCode`
- `WeekNumber`
- `RoomNumber`
- `AdmissionDate`
- `ExpectedCompletionDate`
- `PrimaryAddiction`
- `IsDrug`
- `IsGambeler`
- `IsPreviousResident`
- `DietaryNeedsCode`
- `IsSnorer`
- `HasCriminalHistory`
- `IsOnProbation`
- `ArgumentativeScale`
- `LearningDifficultyScale`
- `LiteracyScale`

## Phase 2 Goals

1. Keep existing screens and API contracts working.
2. Change API reads to source lifecycle/placement data from `ResidentProgrammeEpisode` and `ResidentCase`.
3. Keep HSE assessment complexity in `FormSubmission`.
4. Only remove old `Resident` columns after API and FE are no longer reading them.

## API Impacts

### 1. Residents read model

Primary files:

- [ResidentService.cs](/c:/Acutis/acutis.api/Acutis.Api/Services/Residents/ResidentService.cs)
- [ResidentContracts.cs](/c:/Acutis/acutis.api/Acutis.Api/Contracts/ResidentContracts.cs)
- [ResidentsController.cs](/c:/Acutis/acutis.api/Acutis.Api/Controllers/ResidentsController.cs)

Current behavior:

- resident list filtering uses `Resident.UnitCode`
- resident list DTO fields are mapped directly from overloaded `Resident` columns

Required Phase 2 change:

- query active `ResidentProgrammeEpisode` for placement and current episode context
- join `Resident` to latest open episode
- optionally join `ResidentCase` through `ResidentProgrammeEpisode.ResidentCaseId`
- keep the current DTO shape for now, but populate it from:
  - `Resident` for identity/master data
  - `ResidentProgrammeEpisode` for placement/timing/current week
  - `ResidentCase` for intake/case status if later exposed

Recommended compatibility mapping:

- `UnitGuid` <- `episode.UnitId`
- `UnitId` <- resolved unit code from `Unit`
- `WeekNumber` <- `episode.CurrentWeekNumber`
- `RoomNumber` <- temporary episode placement field once added there, otherwise compatibility fallback
- `AdmissionDate` <- episode start/admission field, not resident
- `ExpectedCompletion` <- episode field when introduced
- `PrimaryAddiction` and assessment/risk flags <- remain compatibility-backed until a clear replacement is chosen

Risk:

- if old resident fields are dropped before this mapping is rewritten, `/api/units/{id}/residents` breaks

### 2. Unit operations read model

Primary files:

- [UnitOperationsService.cs](/c:/Acutis/acutis.api/Acutis.Api/Services/Units/UnitOperationsService.cs)
- [UnitOperationsContracts.cs](/c:/Acutis/acutis.api/Acutis.Api/Contracts/UnitOperationsContracts.cs)
- [UnitOperationsController.cs](/c:/Acutis/acutis.api/Acutis.Api/Controllers/UnitOperationsController.cs)

Current behavior:

- room assignment and OT schedule are derived from `ResidentService.GetAllResidentsAsync`
- they depend on `RoomNumber`

Required Phase 2 change:

- no direct contract change needed if `ResidentService` continues to provide `RoomNumber`
- if placement moves off `Resident`, `ResidentService` must become the compatibility layer

Risk:

- room assignments break immediately if `RoomNumber` disappears from resident DTOs

### 3. Discharge / episode event flow

Primary files:

- [ResidentService.cs](/c:/Acutis/acutis.api/Acutis.Api/Services/Residents/ResidentService.cs#L73)
- [TherapySchedulingService.cs](/c:/Acutis/acutis.api/Acutis.Api/Services/TherapyScheduling/TherapySchedulingService.cs)

Current behavior:

- discharge already operates on `ResidentProgrammeEpisode`
- episode event creation already operates on `ResidentProgrammeEpisode`

Required Phase 2 change:

- low immediate impact
- likely enhancement only:
  - expose `CentreEpisodeCode`
  - optionally relate new events to case milestones later

Risk:

- low for current migration

### 4. Screening / dynamic forms

Primary files:

- [SubmissionService.cs](/c:/Acutis/acutis.api/Acutis.Api/Services/Screening/SubmissionService.cs)
- [FormSubmission.cs](/c:/Acutis/acutis.api/Acutis.Domain/Entities/FormSubmission.cs)

Current behavior:

- forms are stored in `FormSubmission` using `SubjectType` and `SubjectId`

Required Phase 2 change:

- introduce lifecycle-aware subject conventions such as:
  - `resident`
  - `resident_case`
  - `resident_programme_episode`
- keep contract platform-neutral and localization-key based
- do not explode HSE pages into relational columns

Recommended next API step:

- add a small convention/helper so the screening/form APIs can save HSE assessments against `ResidentCase`

Risk:

- low immediate runtime risk because no current migration change touches `FormSubmission`

## Frontend Impacts

### 1. Resident list and resident detail

Primary files:

- [useResidents.ts](/c:/Acutis/acutis.web/src/areas/shared/hooks/useResidents.ts)
- [ResidentsSection.tsx](/c:/Acutis/acutis.web/src/areas/shared/ResidentsSection.tsx)
- [residentService.ts](/c:/Acutis/acutis.web/src/services/residentService.ts)

Current behavior:

- FE expects a resident payload with:
  - `weekNumber`
  - `roomNumber`
  - `unitId`
  - `admissionDate`
  - `expectedCompletion`
  - `primaryAddiction`
  - various flags/scales
- FE maps those into the shared `Resident` client model

Required Phase 2 change:

- none if API contract stays compatible
- if you want the FE to become lifecycle-aware:
  - add episode metadata to the DTO
  - keep old fields for one pass
  - migrate FE model gradually

Recommended frontend additions:

- optional `episodeId`
- optional `centreEpisodeCode`
- optional `residentCaseId`
- optional `caseStatus`

Risk:

- FE resident list/detail breaks if API drops legacy resident fields too early

### 2. Room assignments

Primary files:

- [RoomAssignments.tsx](/c:/Acutis/acutis.web/src/areas/shared/RoomAssignments.tsx)
- [operationsService.ts](/c:/Acutis/acutis.web/src/services/operationsService.ts)

Current behavior:

- the screen separately loads residents and room assignments
- it derives initials from resident names and uses room assignment API for occupancy

Required Phase 2 change:

- likely none if room assignment API remains stable
- backend should continue exposing room occupancy through current endpoints while placement storage changes underneath

Risk:

- low if API compatibility is preserved

### 3. New admission / HSE intake / generated forms

Primary files:

- [UnitAdmissionForm.tsx](/c:/Acutis/acutis.web/src/areas/shared/admissions/UnitAdmissionForm.tsx)
- [NewAdmissionForm.tsx](/c:/Acutis/acutis.web/src/areas/alcohol/components/NewAdmissionForm.tsx)
- dynamic form renderer/service files already in the codebase

Current behavior:

- the codebase already leans on generated/dynamic forms for structured input

Required Phase 2 change:

- route intake/referral/HSE assessment capture toward `ResidentCase`
- preserve localization keys
- keep schema RN-safe
- avoid bespoke FE fields unless clearly operational and not form-driven

Risk:

- medium product risk if new intake flows are built ad hoc instead of through the existing form generator patterns

## Recommended Delivery Order

### Step 1. Add compatibility reads in API

- rewrite `ResidentService.GetAllResidentsAsync`
- join resident identity with current/open episode
- keep `ResidentListItemDto` unchanged initially

### Step 2. Make case-aware form submissions possible

- standardize `FormSubmission.SubjectType`
- use `ResidentCase` for HSE intake/assessment forms

### Step 3. Add optional lifecycle metadata to resident APIs

- add new DTO fields without removing old ones
- examples:
  - `episodeId`
  - `centreEpisodeCode`
  - `residentCaseId`
  - `caseStatus`

### Step 4. Update frontend to consume new lifecycle metadata

- resident list/detail can start showing case/episode context
- existing fields remain as compatibility fields during transition

### Step 5. Remove overloaded resident columns

- only after:
  - resident API no longer reads them
  - room assignment logic no longer depends on them directly
  - FE contracts have either migrated or been deliberately shimmed

## Explicit Compatibility Shims Needed Before Column Drops

- resident list API must synthesize current resident placement from `ResidentProgrammeEpisode`
- room assignment API must synthesize current room occupancy from episode placement
- admission/expected completion must come from episode-level dates
- case-driven HSE submissions must target `ResidentCase`, not `Resident`

## Open Design Decisions Still Blocking True Cutover

These match the existing refactor questions and should be answered before destructive cleanup:

- whether room placement lives directly on episode or in a separate placement history table
- whether operational assessment flags remain temporarily relational or move fully into forms
- exact `CentreEpisodeCode` uniqueness/format rules
- whether existing resident APIs should stay shape-compatible or version to a lifecycle-aware contract

## Recommendation

Treat the current migration as Phase 1 only.

Do not drop overloaded `Resident` lifecycle/assessment columns until:

1. `ResidentService` has been rewritten to source current state from episode/case
2. the resident frontend has either migrated or been compatibility-shimmed
3. form submissions for HSE assessment have a deliberate `ResidentCase` target strategy

## Current Compatibility Status

### Fields now sourced from episode/case when available

- `UnitGuid` from `ResidentProgrammeEpisode.UnitId`
- `UnitId` from resolved `Unit.Code` for the active episode unit
- `WeekNumber` from `ResidentProgrammeEpisode.CurrentWeekNumber`
- `AdmissionDate` from `ResidentProgrammeEpisode.StartDate`
- `RoomNumber` from `ResidentProgrammeEpisode.RoomNumber`
- `ExpectedCompletion` from `ResidentProgrammeEpisode.ExpectedCompletionDate`
- `PrimaryAddiction` from `ResidentProgrammeEpisode.PrimaryAddiction`
- operational programme context remains authoritative on `ResidentProgrammeEpisode` via `ProgrammeType` and `ParticipationMode`, even though the legacy resident DTO does not surface those fields yet
- `EpisodeId` from `ResidentProgrammeEpisode.Id`
- `ResidentCaseId` from `ResidentProgrammeEpisode.ResidentCaseId`
- `CentreEpisodeCode` from `ResidentProgrammeEpisode.CentreEpisodeCode`
- `EntryYear` from `ResidentProgrammeEpisode.EntryYear`
- `EntryWeek` from `ResidentProgrammeEpisode.EntryWeek`
- `EntrySequence` from `ResidentProgrammeEpisode.EntrySequence`
- `CaseStatus` from `ResidentCase.CaseStatus`

### Fields still legacy-only compatibility fields

- `IsDrug`
- `IsGambeler`
- `IsPreviousResident`
- `DietaryNeedsCode`
- `IsSnorer`
- `HasCriminalHistory`
- `IsOnProbation`
- `ArgumentativeScale`
- `LearningDifficultyScale`
- `LiteracyScale`

### Blockers for dropping old Resident columns

- no authoritative episode/case/form-backed replacement is implemented yet for the assessment/risk flags listed above
- `RoomNumber`, `ExpectedCompletionDate`, and `PrimaryAddiction` now have episode-backed sources, but existing legacy resident columns are still needed as fallback until all rows are backfilled and stable
- no compatibility contract currently exposes `ProgrammeType` / `ParticipationMode`, so the episode-level programme context is authoritative in storage but not yet consumable through the legacy resident list payload
- HSE assessment/risk data still needs an explicit decision on which fields stay temporary relational compatibility fields versus move to `ResidentCase` / `FormSubmission`
