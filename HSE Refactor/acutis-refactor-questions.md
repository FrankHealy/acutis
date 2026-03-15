# Acutis lifecycle refactor questions to verify

Answer or confirm these before finalising destructive cleanup.

## 1. Naming

- Keep the name `ResidentProgrammeEpisode`, or rename it to `Episode` and update APIs/screens now?
- Keep the name `ResidentCase`, or prefer `IntakeCase` / `ReferralCase`?

## 2. Centre internal operational identifier

Please confirm the exact format:

- `BRU-YYYY-WW-SEQ`
- `BRU-YYYYWww-SEQ`
- `BRU-YY-WW-SEQ`

Please confirm:

- sequence resets per centre per week?
- code is generated on admission / episode creation, not at case creation?
- code is unique within the whole database or only within centre + year + week?

## 3. Resident identity fields

Please confirm which of these remain on `Resident` as canonical master data:

- `FirstName`
- `Surname`
- `DateOfBirth`
- `Nationality`
- `PhotoUrl`
- `Psn` (restricted identity reconciliation only)

Please confirm whether additional HSE demographic fields should also be promoted to canonical resident data now, for example:

- sex / gender identity
- sexual orientation
- ethnicity
- country of birth
- interpreter / language needs

## 4. Episode placement

Please confirm where room/unit placement should live initially:

- directly on `ResidentProgrammeEpisode`
- in a separate `EpisodePlacement` history table

Recommended for now: keep current placement on episode, add history later if needed.

## 5. Assessment profile table vs pure forms

Do you want a small relational `ResidentAssessmentProfile` for a few clearly operational flags/scales,
or should everything assessment-related move into forms except obvious episode data?

Fields currently in this grey area include:

- dietary needs
n- snoring
- criminal history
- probation
- argumentative scale
- learning difficulty scale
- literacy scale
- addiction category flags

## 6. HSE ambiguity cleanup

Please mark which HSE sections should remain near-faithful to source form,
and which should be digitally cleaned up.

Candidates for cleanup:

- repetitive open-text sections
- duplicated demographic questions
- repeated consent wording
- ambiguous yes/no plus narrative combinations

## 7. Consent modelling

Please confirm whether consent should be:

- a dedicated relational structure (`ResidentCaseConsent`)
- plus optional document/file reference
- plus event entries for sign / withdraw actions

Recommended: yes.

## 8. Case lifecycle states

Please confirm the first-pass status/state set for `ResidentCase`.
Suggested values:

- referred
- screening_in_progress
- assessment_in_progress
- assessment_complete
- awaiting_decision
- admitted
- declined
- closed_no_contact

## 9. Migration destructiveness

Please confirm whether the migration should:

- backfill and immediately drop overloaded columns from `Resident`
- or backfill and leave them temporarily for one compatibility pass

Recommended if APIs/screens still depend on them: leave temporarily for one pass, then remove.

## 10. API compatibility

Please identify any existing screens or APIs that definitely read from the following current resident fields,
so compatibility shims can be added deliberately:

- `AdmissionDate`
- `ExpectedCompletionDate`
- `RoomNumber`
- `WeekNumber`
- `PrimaryAddiction`
- `IsDrug`
- `IsGambeler`
- `DietaryNeedsCode`
- `HasCriminalHistory`
- `IsOnProbation`

## 11. Localisation contract

Please confirm the schema contract should prefer localisation keys instead of inline labels for:

- form titles
- section titles
- field labels
- placeholders
- help text
- option labels where lookup-driven

Recommended: yes.

## 12. RN form rendering limits

Please confirm the RN tablet renderer should assume:

- bounded component registry
- single-column / tablet-friendly layout bias
- stable field keys
- no arbitrary web-only layout schema

Recommended: yes.
