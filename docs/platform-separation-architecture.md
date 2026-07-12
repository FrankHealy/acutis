# Acutis product separation architecture

## Product ownership

| Product | Web | Mobile | API | Database | Migration owner |
|---|---|---|---|---|---|
| Centre | `acutis.centre/acutis.centre.web` | `acutis.centre/acutis.centre.tab` | `acutis.centre/acutis.centre.api` | `AcutisCentre` (current Centre database during compatibility) | `acutis.centre/acutis.centre.db/Acutis.Infrastructure/Migrations` |
| Practitioner | `acutis.practitioner/acutis.practitioner.web` | `acutis.practitioner/acutis.practitioner.tab` | `acutis.practitioner/acutis.practitioner.api` | `AcutisPractitioner` | `Acutis.Practitioner.Api/Migrations` |
| Community | `acutis.community/acutis.community.web` | `acutis.community/acutis.community.tab` | `acutis.community/acutis.community.api` | `AcutisCommunity` | `Acutis.Community.Api/Migrations` |
| Outreach | `acutis.outreach/acutis.outreach.web` preview | `acutis.outreach/acutis.outreach.mob` preview | `acutis.outreach/acutis.outreach.api` placeholder | no implementation | none |

No product API references another product API or the legacy Centre persistence project. Cross-product contracts contain identity, product link, tenant context, membership and branding transport shapes only.

## Dependency direction

```text
product web/mobile -> technical TypeScript packages
product API -> Acutis.Platform.Contracts + Acutis.Forms.Schema
product API -> its own DbContext and migrations
Centre compatibility hosts -> existing Centre projects

technical packages -X-> product applications
product API -X-> another product API/persistence
shared contracts -X-> persistence entities
```

Automated architecture tests enforce the prohibited .NET and TypeScript dependency directions.

## Identity and authorization

`acutisrealm` owns human credentials and the explicit `AcutisPlatformDemo` eligibility role. Centre authenticates directly. Practitioner and Community product realms broker `acutisrealm` through an IdP displayed as **Acutis**. Each frontend type has a separate client. Product APIs validate product-realm tokens, then require product-database tenant membership and product roles. The platform-demo role does not bypass membership or API permission checks.

Local realm/client/IdP configuration is repeatable through `infrastructure/keycloak/apply-local-product-realms.ps1`. Generated client secrets and the generated fictional demo password remain in ignored local files only.

## Branding, localisation and RTL

The shared design-system, mobile UI, localization, and RTL packages coexist with richer Centre-specific web and tablet implementations. They were relocated unchanged and are not yet one unified theming engine. Current divergence, product-specific translation leakage, and a safe later convergence sequence are documented in `docs/architecture/shared-theming-localization-convergence.md`.

## Forms

`@acutis/forms-schema` and `Acutis.Forms.Schema` define transport-level canonical schemas without persistence entities. Validation, designer, web renderer and mobile renderer are separate technical packages. Practitioner and Community databases each own definitions, assignments and responses. Centre retains its existing forms persistence while its web code is incrementally adapted to the canonical package. Response tables are never shared.

## Compatibility inventory and retirement

The current Centre host remains authoritative for these temporary routes until parity telemetry confirms retirement safety:

- `/units/community/**`
- `/units/practitioner/**`
- `/practitioner/appointments/**`
- `/vc/join/**`
- `/api/ambulatory/community/**`
- `/api/ambulatory/practitioner/**`
- `/api/video-consultations/**`

The API proxy records only redacted legacy-route families. Query strings, deep links, authentication callbacks, invitation links and form links remain unchanged. No dual writes are introduced. Proposed earliest retirement review: **2027-01-31**, contingent on 60 consecutive days without unsupported legacy client traffic and verified product parity. Browser routes may then redirect; API routes require explicit client-version evidence and will not be blindly redirected.

## Rollback

1. Keep Centre compatibility services and the original ambulatory database backup available.
2. Point compatibility environment URLs back to the Centre host.
3. Stop the new product services without changing central identities.
4. Run `rollback-practitioner-migration.sql` or `rollback-community-migration.sql` only against the corresponding new product database if copied data must be removed.
5. Never delete source Practitioner or Community rows until backup, count verification, workflow verification and a separately approved cutover.
6. Keycloak product realms may be disabled while leaving `acutisrealm` identities untouched.

## Windows validation commands

```powershell
npm install
npm run typecheck:shared
npm run test:shared
npm run lint
npm run build:centre-web
npm run build:practitioner-web
npm run build:community-web
npm run build:outreach-web
npm --workspace acutis.tab run test
npm --workspace acutis.tab run build
npm --workspace @acutis/practitioner-mobile run build
npm --workspace @acutis/community-mobile run build
npm --workspace @acutis/outreach-mobile run build

dotnet build Acutis.slnx --configuration Release
dotnet test acutis.centre\acutis.centre.api\tests\Acutis.Api.Tests\Acutis.Api.Tests.csproj --configuration Release
dotnet ef migrations list --project acutis.practitioner\acutis.practitioner.api\src\Acutis.Practitioner.Api --startup-project acutis.practitioner\acutis.practitioner.api\src\Acutis.Practitioner.Api --context PractitionerDbContext
dotnet ef migrations list --project acutis.community\acutis.community.api\src\Acutis.Community.Api --startup-project acutis.community\acutis.community.api\src\Acutis.Community.Api --context CommunityDbContext
sqlcmd -S localhost -E -C -b -i acutis.practitioner\acutis.practitioner.db\scripts\migrate-practitioner-from-ambulatory.sql
sqlcmd -S localhost -E -C -b -i acutis.community\acutis.community.db\scripts\migrate-community-from-ambulatory.sql
```
