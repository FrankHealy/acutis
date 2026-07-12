# Acutis product separation architecture

## Product ownership

| Product | Web | Mobile | API | Database | Migration owner |
|---|---|---|---|---|---|
| Centre | `acutis.web` | `acutis.tab` | `Acutis.Api` | `AcutisCentre` (current Centre database during compatibility) | `Acutis.Infrastructure/Migrations` |
| Practitioner | `apps/practitioner-web` | `apps/practitioner-mobile` | `Acutis.Practitioner.Api` | `AcutisPractitioner` | `Acutis.Practitioner.Api/Migrations` |
| Community | `apps/community-web` | `apps/community-mobile` | `Acutis.Community.Api` | `AcutisCommunity` | `Acutis.Community.Api/Migrations` |
| Outreach | `apps/outreach-web` preview | `apps/outreach-mobile` preview | `Acutis.Outreach.Api` placeholder | reserved `AcutisOutreach` | reserved in Outreach API |

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

`@acutis/branding` defines runtime tenant branding without product forks. `@acutis/design-system` and `@acutis/mobile-ui` consume semantic tokens. `@acutis/localization` and `@acutis/rtl` are platform-neutral and shared by web/mobile; product translation namespaces remain independently owned. Tenant terminology overlays are part of branding configuration. Direction is derived from locale and navigation icons use direction-aware helpers.

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

dotnet build acutis.api\Acutis.slnx --configuration Release
dotnet test acutis.api\Acutis.Api.Tests\Acutis.Api.Tests.csproj --configuration Release
dotnet ef migrations list --project acutis.api\Acutis.Practitioner.Api --startup-project acutis.api\Acutis.Practitioner.Api --context PractitionerDbContext
dotnet ef migrations list --project acutis.api\Acutis.Community.Api --startup-project acutis.api\Acutis.Community.Api --context CommunityDbContext
sqlcmd -S localhost -E -C -b -i infrastructure\sql\migrate-practitioner-from-ambulatory.sql
sqlcmd -S localhost -E -C -b -i infrastructure\sql\migrate-community-from-ambulatory.sql
```
