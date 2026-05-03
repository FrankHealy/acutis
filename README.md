# Acutis Workspace Notes

## API Runtime After Upgrade

Since the recent tooling upgrade, starting the API with `dotnet run` from the Codex sandbox has been unreliable.

Observed failure modes:
- NuGet vulnerability checks try to reach `api.nuget.org` and can fail in the sandbox.
- Roslyn shared compilation can fail on blocked IPC/named-pipe access.
- Background processes started inside the sandbox are often terminated when the command exits.

Reliable workaround:
- Run the already-built executable directly.
- Set the expected runtime environment explicitly.
- Launch it outside the sandbox if it needs to stay running.

Working command:

```powershell
$env:ASPNETCORE_URLS='http://localhost:5009'
$env:ASPNETCORE_ENVIRONMENT='Development'
Start-Process -FilePath 'C:\Acutis\acutis.api\Acutis.Api\bin\Debug\net8.0\Acutis.Api.exe' `
  -WorkingDirectory 'C:\Acutis\acutis.api\Acutis.Api\bin\Debug\net8.0'
```

Verification:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5009/swagger
```

Expected result:
- HTTP status `200`

Logs used during troubleshooting:
- `C:\Acutis\api-run.out.log`
- `C:\Acutis\api-run.err.log`

Related notes:
- See `DEPLOYMENT_NOTES.md` for other environment-specific issues already documented in this workspace.
- See `LOCAL_DEVIATIONS.md` and `LOCAL_DEVIATIONS.txt` for the consolidated record of local workarounds, helper scripts, and non-production-safe deviations.

## Docker Deployment Prep

This repo now includes conservative Docker support for:

- `acutis.api` (`Acutis.Api.csproj`)
- `acutis.web` (Next.js standalone output)

It does **not** add Docker support for `acutis.tab`, and it does **not** replace any existing VPS compose file automatically.

New deployment files live under [`deploy/`](c:/Acutis/deploy):

- [`api.Dockerfile`](c:/Acutis/deploy/api.Dockerfile)
- [`web.Dockerfile`](c:/Acutis/deploy/web.Dockerfile)
- [`.env.example`](c:/Acutis/deploy/.env.example)
- [`docker-compose.example.yml`](c:/Acutis/deploy/docker-compose.example.yml)

### Assumptions

- Docker build context is the repo root.
- SQL Server already exists on the VPS and is reachable on the shared Docker network.
- Keycloak already exists and remains part of the production architecture.
- The API gets its SQL connection string from `ConnectionStrings__DefaultConnection`.
- The API listens on `http://+:5000`.
- EF migrations are **not** auto-run by default in Docker.
- SQL Server is **not** exposed publicly by the compose example.

### Prepare The Environment File

Copy the example env file:

```powershell
Copy-Item deploy/.env.example deploy/.env
```

Then edit `deploy/.env` with real values:

- SQL Server hostname on the Docker network, for example `sqlserver` or `acutis-sql`
- SQL credentials / database name
- Keycloak issuer URL
- NextAuth secret
- Keycloak client credentials
- public web/API URLs used for browser access

### Build The Images Manually

Build the API image:

```powershell
docker build -f deploy/api.Dockerfile -t acutis-api:local .
```

Build the web image:

```powershell
docker build -f deploy/web.Dockerfile -t acutis-web:local .
```

### Validate The Compose File

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.example.yml config
```

### Start The API And Web

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.example.yml up -d --build
```

### View Logs

Follow all logs:

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.example.yml logs -f
```

Follow API logs only:

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.example.yml logs -f api
```

Follow web logs only:

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.example.yml logs -f web
```

### Smoke Testing

The current API does **not** expose a dedicated `/health` endpoint in this repo, and these Docker files do not invent one.

Use these smoke tests instead:

- API container reachability:

```powershell
curl http://localhost:5000/
```

- API Swagger (only when `ASPNETCORE_ENVIRONMENT=Development`):

```powershell
curl http://localhost:5000/swagger/index.html
```

- Web:

```powershell
curl http://localhost:3000/
```

Or open in a browser:

- `http://localhost:5000`
- `http://localhost:3000`

### Notes For The VPS

- Join the same Docker network already used by SQL Server and Keycloak.
- Do not expose SQL Server publicly.
- Keep Keycloak separate.
- Put reverse proxy / HTTPS in front later; the example keeps HTTP and direct host ports only for the initial stage.
