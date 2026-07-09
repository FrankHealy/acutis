# Server Update Runbook - 2026-07-09

Use this when working on the Ubuntu server after the latest Acutis changes are pushed.

## Goal

Deploy the latest application changes, make ambulatory use its own database and Keycloak realm, run the new migrations, and smoke test the main user journeys.

## 0. Ubuntu Server Notes

This runbook is for the Ubuntu server, not the local Windows development machine.

Do not use `start-dev.ps1` on the server. The Windows Smart App Control signing fix is only for local Windows development and is not needed on Ubuntu.

Before starting, confirm the server has the expected tooling:

```bash
uname -a
git --version
docker --version
docker compose version
```

If you need to run EF migrations manually outside Docker, also confirm:

```bash
dotnet --version
dotnet ef --version
```

If `dotnet ef` is missing:

```bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:$HOME/.dotnet/tools"
```

## 1. Get The Latest Code

```bash
cd /path/to/acutis
git status
git fetch origin main
git pull origin main
```

If there are local server-only changes, stop and inspect them before pulling.

## 2. Confirm Environment Values

Update the server environment file used by Docker or the API host. For the current Docker setup this is normally `deploy/.env`, copied from `deploy/.env.example`.

Required API values:

```bash
ConnectionStrings__DefaultConnection="Server=sqlserver,1433;Database=Acutis;..."
ConnectionStrings__AmbulatoryConnection="Server=sqlserver,1433;Database=AcutisAmbulatory;..."

Jwt__Authority="https://YOUR_KEYCLOAK_HOST/realms/AcutisRealm"
Jwt__Issuer="https://YOUR_KEYCLOAK_HOST/realms/AcutisRealm"
Jwt__AmbulatoryAuthority="https://YOUR_KEYCLOAK_HOST/realms/AcutisAmbulatoryRealm"
Jwt__AmbulatoryIssuer="https://YOUR_KEYCLOAK_HOST/realms/AcutisAmbulatoryRealm"
Jwt__Audience="api-client"
```

Required web values:

```bash
AUTH_KEYCLOAK_ID="web-client"
AUTH_KEYCLOAK_SECRET="MAIN_WEB_CLIENT_SECRET"
AUTH_KEYCLOAK_ISSUER="https://YOUR_KEYCLOAK_HOST/realms/AcutisRealm"

AUTH_AMBULATORY_KEYCLOAK_ID="ambulatory-web-client"
AUTH_AMBULATORY_KEYCLOAK_SECRET="AMBULATORY_WEB_CLIENT_SECRET"
AUTH_AMBULATORY_KEYCLOAK_ISSUER="https://YOUR_KEYCLOAK_HOST/realms/AcutisAmbulatoryRealm"
```

Then confirm Docker Compose will see those values:

```bash
cd /path/to/acutis
grep -E 'Ambulatory|AUTH_AMBULATORY|Jwt__Authority|AUTH_KEYCLOAK_ISSUER|ConnectionStrings__' deploy/.env
```

## 3. Keycloak Setup

In Keycloak:

1. Create a separate realm for ambulatory, for example `AcutisAmbulatoryRealm`.
2. Create the web client `ambulatory-web-client`.
3. Configure the same valid redirect origins as the main web client.
4. Add the users who should access `/units/community` and `/units/practitioner`.
5. Confirm the token audience matches `api-client`, or set `Jwt__AmbulatoryAudience` if the ambulatory realm uses a different API audience.

The main Acutis realm remains for the residential/configuration side.

## 4. Database Migration

The API now has two EF contexts:

- `AcutisDbContext` for the main Acutis database.
- `AcutisAmbulatoryDbContext` for the ambulatory database.

If startup migrations are enabled:

```bash
Database__ApplyMigrationsOnStartup=true
```

Then restart the API and it will apply both contexts.

If running migrations manually:

```bash
cd /path/to/acutis/acutis.api
dotnet ef database update --context AcutisDbContext --project Acutis.Infrastructure --startup-project Acutis.Api
dotnet ef database update --context AcutisAmbulatoryDbContext --project Acutis.Infrastructure --startup-project Acutis.Api
```

On Ubuntu Docker deployments, prefer startup migrations unless you are deliberately running the API project directly on the host. Set:

```bash
Database__ApplyMigrationsOnStartup=true
```

Then start the API container and watch its logs. Once migrations have completed successfully, you can set it back to `false` if that is your normal production preference.

## 5. Restart Services

Docker example:

```bash
cd /path/to/acutis
docker compose --env-file deploy/.env down
docker compose --env-file deploy/.env up -d --build
docker compose --env-file deploy/.env logs -f api
```

Watch for:

- Successful connection to the main database.
- Successful connection to the ambulatory database.
- No JWT authority/issuer configuration errors.
- No EF migration failures.

Useful Ubuntu checks:

```bash
docker compose --env-file deploy/.env ps
docker compose --env-file deploy/.env logs --tail=200 api
docker compose --env-file deploy/.env logs --tail=200 web
```

## 6. Smoke Tests

Check these flows:

1. Main landing page loads.
2. Residential/configuration login uses the main Acutis realm.
3. `/units/community` redirects to the ambulatory realm login.
4. `/units/practitioner` redirects to the ambulatory realm login.
5. Create or open an ambulatory service user and confirm it saves.
6. Confirm the data lands in the ambulatory database, not the main database.
7. Open the forms list and confirm form name/version/description/active dates display correctly.
8. Open the map designer and confirm polygon/room/corridor controls still work.

## 7. Rollback Notes

If login fails only for ambulatory:

- Check `AUTH_AMBULATORY_KEYCLOAK_ISSUER`.
- Check `Jwt__AmbulatoryIssuer`.
- Check the `ambulatory-web-client` redirect URI.
- Check client secret alignment between Keycloak and server env.

If ambulatory saves fail:

- Check `ConnectionStrings__AmbulatoryConnection`.
- Confirm the ambulatory database exists and migrations ran.
- Check API logs for EF connection or migration errors.
