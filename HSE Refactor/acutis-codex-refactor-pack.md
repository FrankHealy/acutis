# Acutis lifecycle refactor pack for Codex

Read `AGENTS.md` first.
Then append and apply the rules from `AGENTS-addition-codex-refactor.md`.

## Read files in this order

1. `AGENTS.md`
2. `AGENTS-addition-codex-refactor.md`
3. `acutis-refactor-questions.md`
4. `current-er-model.md`
5. `AF Printed Page 1.html` through `AF Printed Page 15.html`
6. `20260315143000_RefactorResidentLifecycle.cs` (treat as draft target only)

## Tone and posture

You are working on a live evolving codebase, not a clean prototype.
Be conservative, explicit, and surgical.
Do not invent parallel patterns when an existing project pattern already exists.
Do not redesign unrelated areas.

## Intent of the refactor

Align the data model to the real lifecycle:

`Resident -> ResidentCase -> ResidentProgrammeEpisode -> EpisodeEvent -> FormSubmission`

### Meaning of each entity

- `Resident` = stable identity / master data only
- `ResidentCase` = referral, intake, pre-admission, and assessment wrapper
- `ResidentProgrammeEpisode` = admitted stay / placement / programme episode
- `EpisodeEvent` = event timeline inside an episode
- `FormSubmission` = main carrier of HSE assessment complexity

## Design constraints

- Existing APIs and screens exist in front of this model
- The forms generator should absorb most HSE assessment change naturally
- Do not create hundreds of columns from paper forms
- Localisation is mandatory
- RN tablet rendering is a first-class downstream consumer of the form schema JSON

## What should move out of `Resident`

Move time-varying or context-specific fields out of `Resident`, especially:

- admission / expected completion dates
- room / placement fields
- programme-specific fields
- assessment-style flags and scales
- anything that can change between episodes

Keep `Resident` as person/master data plus restricted identity reconciliation fields.

## What should remain schema-driven

Keep the following largely in form schema / submission data unless there is a very strong reason not to:

- HSE assessment sections
- repetitive assessment answers
- narrative/open text fields
- ambiguous or loosely structured fields
- clinically descriptive content

## Localisation expectations

Do not hard-code English if a key or lookup can be used.
Prefer:

- `TitleKey`
- `DescriptionKey`
- `LabelKey`
- `PlaceholderKey`
- `HelpTextKey`
- `OptionSetKey`

## RN compatibility expectations

The form JSON is a shared contract between Web and RN.
Do not add schema constructs that are web-only in practice.
Prefer bounded field/component types and stable field keys.

## Migration expectations

Treat `20260315143000_RefactorResidentLifecycle.cs` as a reviewable draft, not as unquestioned truth.
If it conflicts with the live model, regenerate correctly.

Do not report completion unless all of the following succeed:

- `dotnet build`
- `dotnet ef migrations list`
- `dotnet ef database update`

## Deliverables expected from Codex

1. entity changes
2. DbContext / configuration updates
3. migration that EF can discover and apply
4. minimal API / screen compatibility fixes required by the model change
5. updates to `acutis-refactor-questions.md` for anything ambiguous instead of guessing
