# Deployment Notes

## 2026-03-08

### Web lint entrypoint

`acutis.centre/acutis.centre.web/package.json` now runs ESLint via:

`node .\node_modules\eslint\bin\eslint.js`

There is also a local helper:

`acutis.centre/acutis.centre.web/eslint.cmd`

Reason:
In the Codex sandbox, the global `npm`/`npx` shim attempted to resolve paths under `C:\Users\frank`, which was not accessible and caused `EPERM` failures before ESLint started.

Production impact:
This should not affect the deployed web application because it only changes developer lint tooling, not runtime application code or build output.

Deployment check:
If CI or production build agents rely on `npm run lint`, verify that invoking ESLint directly with local `node_modules` works in that environment. If the agent's global `npm` is healthy, this change is still safe.

### API authorization bypass

Development config currently disables API authorization in:

`acutis.centre/acutis.centre.api/src/Acutis.Api/appsettings.Development.json`

Production impact:
This is scoped to the Development environment only. Do not copy the `Authorization.Disabled: true` setting into production configuration.
