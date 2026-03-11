# AGENTS.md

## Environment assumptions
The local development environment is valid unless proven otherwise.

Verification commands:
- `dotnet build`
- `dotnet ef migrations list`
- `dotnet ef database update`

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

Avoid architectural summaries.

---

## Process locks
If build fails due to locked files:

Report it as:

"A running process is locking build outputs."

Do not describe this as an SDK or MSBuild failure.

---

## Project structure
Main directories:

- `Acutis.Api` – controllers, services, auth
- `Acutis.Domain` – entities
- `Acutis.Infrastructure` – EF, persistence, migrations

Modify only files required for the task.
Do not refactor unrelated areas.