# Local Deviations

This document consolidates local environment-specific changes, workarounds, and helper behavior that differ from a clean production-oriented setup.

It is based on the current repository state as of 2026-03-12.

## 1. Web lint entrypoint workaround

Affected files:
- `acutis.web/package.json`
- `acutis.web/eslint.cmd`

Current behavior:
- `npm run lint` in `acutis.web` invokes ESLint directly through the local package file:
  - `node .\node_modules\eslint\bin\eslint.js`
- `acutis.web/eslint.cmd` is a helper wrapper that calls ESLint through:
  - `C:\nvm4w\nodejs\node.exe`

Why this exists:
- In the Codex sandbox, the global `npm`/`npx` shim resolved paths under `C:\Users\frank` and failed with `EPERM` before ESLint started.

Impact:
- This changes developer tooling behavior only.
- It should not affect production runtime behavior or web build output.

Operational note:
- If CI or another machine uses a different Node installation layout, `acutis.web/eslint.cmd` may not be portable because it hardcodes `C:\nvm4w\nodejs\node.exe`.
- The `package.json` lint script is the more portable entrypoint.

## 2. API development authorization bypass

Affected file:
- `acutis.api/Acutis.Api/appsettings.Development.json`

Current behavior:
- Development configuration contains:
  - `"Authorization": { "Disabled": true }`

Why this exists:
- Local development currently bypasses API authorization requirements.

Impact:
- This is scoped to the `Development` environment only.
- It must not be copied into production configuration.

## 3. API sandbox runtime workaround

Affected documentation:
- `README.md`

Current behavior:
- The recommended local API startup path for the Codex sandbox is to run the built executable directly instead of relying on `dotnet run`.
- The documented command sets:
  - `ASPNETCORE_URLS=http://localhost:5009`
  - `ASPNETCORE_ENVIRONMENT=Development`
- It then launches:
  - `acutis.api/Acutis.Api/bin/Debug/net8.0/Acutis.Api.exe`

Why this exists:
- `dotnet run` in the sandbox was observed to be unreliable because of:
  - NuGet vulnerability checks reaching `api.nuget.org`
  - Roslyn shared compilation IPC / named-pipe failures
  - background processes being terminated when the command exits

Impact:
- This is a local execution workaround, not an application code change.
- It affects how the API is started during local sandboxed work.

## 4. Startup script drift

Affected file:
- `start-dev.ps1`

Current behavior:
- The script still starts:
  - API via `dotnet run --project .\Acutis.Api\Acutis.Api.csproj`
  - Web via `npm run dev`

Why this matters:
- This script does not reflect the API sandbox workaround documented in `README.md`.
- It also does not use the dedicated `acutis.web/eslint.cmd` helper, though that helper is for linting rather than dev startup.

Impact:
- `start-dev.ps1` may work on a normal local machine.
- It is not a reliable representation of the sandbox-safe startup path currently documented for Codex work.

## Source documents

The details above were consolidated from:
- `README.md`
- `DEPLOYMENT_NOTES.md`
- `acutis.web/package.json`
- `acutis.web/eslint.cmd`
- `acutis.api/Acutis.Api/appsettings.Development.json`
- `start-dev.ps1`
