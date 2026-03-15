# Codex Change Brief

Use this brief when making schema, API, or UI changes in Acutis.

## What To Assume

- Database changes usually have API impact.
- Database changes may also have frontend impact, even when the form generator absorbs most of it.
- Localization must always be considered for any new user-facing label, value, hint, validation message, or status.
- Repetitive form structures should be handled through the existing form-generation/localization patterns rather than bespoke screen code where possible.
- If a field or concept is ambiguous, stop and ask for clarification instead of hard-coding an interpretation.

## Default Expectations For Changes

When changing a data model, Codex should review all of the following:

- EF entities, configurations, and migrations
- API contracts, controllers, services, validators, and tests
- frontend screens that read or write the changed data
- generated/dynamic form flows that may already cover the change
- localization resources, translation keys, and any lookup/option labels
- audit/history behavior if the changed area is audited

## Frontend Guidance

- Do not assume a new database field needs a bespoke screen change.
- First check whether the forms generator or dynamic renderer already covers it naturally.
- Only add manual UI changes when the field is outside the generated-form path or when UX clearly requires custom handling.
- If a field appears in lists, detail views, summaries, exports, filters, or badges, check those surfaces too.

## API Guidance

- Check whether the change affects:
  - request DTOs
  - response DTOs
  - validation rules
  - mapping logic
  - persistence logic
  - audit/event behavior
  - tests
- Prefer keeping API behavior explicit rather than relying on accidental EF serialization or implicit enum/string behavior.

## Localization Guidance

- Any new user-visible text needs localization review.
- Check:
  - field labels
  - placeholder/help text
  - validation messages
  - dropdown/lookup labels
  - status names
  - headings and section titles
- Reuse existing translation/key patterns where possible.
- If the source of truth should be lookup-driven rather than hard-coded text, say so explicitly.

## Ambiguity Rule

If any of the following is unclear, ask before implementing:

- whether a field is internal-only or user-visible
- whether it belongs in API responses
- whether it should appear on existing screens
- whether it should be form-generated or manually rendered
- whether it requires localization
- whether it is required, optional, derived, or historical
- whether it should be normalized into a lookup/reference table

## Questions To Ask Me

When requirements are unclear, ask these short questions one by one or in a small batch.

### Data Meaning

- What is the exact business meaning of this field/table?
- Is this authoritative data, derived data, or cached display data?
- Is this a lookup/reference concept that should live in its own table?

### API Surface

- Should this field be accepted on create, update, both, or neither?
- Should it be returned in list endpoints, detail endpoints, both, or neither?
- Does it affect validation or workflow rules?

### UI Surface

- Should this appear automatically via the form generator, or do you want explicit screen changes?
- If visible, on which screens: list, detail, edit, summary, filters, reports?
- Is it editable, read-only, or derived?

### Localization

- Is this text user-facing?
- Should labels/options be localized?
- Should this use existing translation keys or a new lookup-backed label source?

### Behavior

- Does this need auditing?
- Does it change existing business rules or only store extra data?
- Does it need backfill/migration logic for existing rows?

### Ambiguity Cleanup

- Which current fields are repetitive and should be consolidated?
- Which labels or field meanings are ambiguous today?
- Which screens should be treated as generated-form driven versus custom?

## Short Prompt To Give Codex

Use this when assigning a change:

> Implement this change end to end. Check the database model, EF configuration, migrations, APIs, tests, frontend screens, generated forms, and localization impact. Prefer existing form-generator and lookup/localization patterns over bespoke UI. If any field meaning, UI surface, or localization requirement is ambiguous, stop and ask concise clarification questions before hard-coding behavior.

## Fast Review Checklist

- Schema updated
- Migration safe for existing data
- API contracts updated
- Service logic updated
- Tests updated
- Frontend impact checked
- Form generator impact checked
- Localization impact checked
- Ambiguities called out
