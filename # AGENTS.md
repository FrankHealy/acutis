# AGENTS.md

## Environment assumptions
The local development environment is valid unless proven otherwise.

Run verification commands from `c:\Acutis\acutis.api` unless the task clearly targets a different project.

Verification commands:
- `dotnet build Acutis.slnx`
- `dotnet ef migrations list --project Acutis.Infrastructure --startup-project Acutis.Api`
- `dotnet ef database update --project Acutis.Infrastructure --startup-project Acutis.Api`

Do not claim environment or SDK failures unless one of these commands actually fails.

File locks from running processes are not environment failures.

---

## Migration rules
EF migrations are only complete when:

1. The migration appears in `dotnet ef migrations list`
2. `dotnet ef database update` applies it successfully

Manual migration files must contain proper EF metadata or be generated using:

`dotnet ef migrations add`

Do not describe migration work as complete until EF can discover and apply it.

---

## Reporting rules
When finishing a task report only:

- files changed
- commands run
- command results
- remaining incomplete work

Avoid architectural summaries unless the user explicitly asks for one.
If assumptions, risks, or blockers materially affect correctness, include them briefly.

---

## Process locks
If build fails due to locked files:

Report it as:

"A running process is locking build outputs."

Do not describe this as an SDK or MSBuild failure.

---

## Project structure
Main directories:

- `Acutis.Api` - controllers, services, auth
- `Acutis.Domain` - entities
- `Acutis.Infrastructure` - EF, persistence, migrations

Modify only files required for the task.
Do not refactor unrelated areas.
Please consider localization at every screen visit.

---

## Lifecycle refactor rules

This refactor is not a greenfield redesign.
Assume there are already APIs, screens, and workflows in front of the current entities.
Work conservatively and surgically.

Target lifecycle model:

- `Resident` = stable person / master data only
- `ResidentCase` = pre-admission referral / intake / assessment container
- `ResidentProgrammeEpisode` = admitted stay / placement / programme episode
- `EpisodeEvent` = timeline of meaningful events within an episode
- `FormSubmission` = default home for HSE assessment answers unless a field clearly belongs in resident or episode master data

Rules:

- Do not keep adding assessment or admission fields to `Resident`
- Prefer staged refactors:
  1. add new structure
  2. backfill data
  3. update calling code
  4. drop obsolete columns last
- Assume sample / seed data only, but still make migrations clean and reversible where reasonable
- Preserve existing APIs and screens as much as possible
- Do not redesign unrelated modules

### HSE form handling rules

The HSE assessment material contains repetition, ambiguity, and excessive open text.
Do not flatten it into hundreds of relational columns.

Default approach:

- keep complex assessment capture in `FormDefinition` / `FormSubmission`
- extract only clearly canonical fields into relational entities
- preserve open text where clinically necessary
- use option sets / lookups where semantics are stable
- if a field is ambiguous, repetitive, or unclear, add it to `c:\Acutis\docs\acutis-refactor-questions.md` instead of guessing

### Localisation rules

Localisation is mandatory.

For all new schema and screen-affecting work:

- prefer `TitleKey`, `DescriptionKey`, `LabelKey`, `PlaceholderKey`, `HelpTextKey`
- prefer option set / lookup keys over inline English labels
- do not hard-code user-facing English where key-based text is feasible
- assume both Web and RN tablet clients will consume the same schema contract

### React Native form contract rules

The forms engine JSON will be exported and reused by the React Native tablet app.
Therefore the form schema must remain platform-neutral.

Rules:

- use bounded component types
- use stable field keys
- use localisation keys
- use option set / lookup keys instead of inline labels where possible
- avoid arbitrary web-only layout semantics in schema
- do not introduce schema constructs that Web can render but RN cannot reasonably render

### Migration rules for this refactor

Treat any supplied manual migration as a draft target, not guaranteed truth.

Your job is to:

1. align entities and DbContext with the intended lifecycle model
2. generate or repair the EF migration properly
3. ensure EF discovers the migration
4. ensure database update succeeds
5. only then report migration work as complete

For this task, migration work is only complete when:

- `dotnet build Acutis.slnx` passes
- `dotnet ef migrations list --project Acutis.Infrastructure --startup-project Acutis.Api` shows the migration
- `dotnet ef database update --project Acutis.Infrastructure --startup-project Acutis.Api` succeeds

If assumptions are needed, document them.
If ambiguity remains around destructive drops, stop and update `c:\Acutis\docs\acutis-refactor-questions.md`.
Create that file if it does not already exist.
## Addendum
Resident is identity only.
Operational lifecycle data must come from ResidentProgrammeEpisode.
ResidentCase represents intake/referral context.
Compatibility DTOs may be composed from multiple tables during migration.
Do not introduce new lifecycle fields onto Resident.
## Architectural Guardrails
The Acutis architecture is intentional and must not be redesigned during routine implementation passes.

The agent must treat the following structures as stable architectural boundaries:

Resident → identity only
ResidentCase → intake/referral container
ResidentProgrammeEpisode → operational stay aggregate
EpisodeEvent → episode-scoped timeline

Rules:

• Do not move lifecycle data back onto Resident
• Do not rename domain entities or public contracts
• Do not reorganise service layers or folders
• Do not introduce alternative architectural patterns
• Do not refactor unrelated files while implementing a task
• Limit changes strictly to the scope of the request

If a change appears to require architectural modification, stop and explain the issue instead of implementing it.