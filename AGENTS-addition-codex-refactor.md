---

## Lifecycle refactor rules

This refactor is **not** a greenfield redesign.
Assume there are already APIs, screens, and workflows in front of the current entities.
Work conservatively and surgically.

Target lifecycle model:

- `Resident` = stable person / master data only
- `ResidentCase` = pre-admission referral / intake / assessment container
- `ResidentProgrammeEpisode` = admitted stay / placement / programme episode
- `EpisodeEvent` = timeline of meaningful events within an episode
- `FormSubmission` = default home for HSE assessment answers unless a field clearly belongs in resident or episode master data

Rules:

- Do **not** keep adding assessment or admission fields to `Resident`
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
- if a field is ambiguous, repetitive, or unclear, add it to `acutis-refactor-questions.md` instead of guessing

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

Treat any supplied manual migration as a **draft target**, not guaranteed truth.

Your job is to:

1. align entities and DbContext with the intended lifecycle model
2. generate or repair the EF migration properly
3. ensure EF discovers the migration
4. ensure database update succeeds
5. only then report migration work as complete

For this task, migration work is only complete when:

- `dotnet build` passes
- `dotnet ef migrations list` shows the migration
- `dotnet ef database update` succeeds

If assumptions are needed, document them.
If ambiguity remains around destructive drops, stop and update `acutis-refactor-questions.md`.
