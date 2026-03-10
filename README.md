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
