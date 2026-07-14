# Practitioner email delivery

The non-secret Zoho SMTP settings are in `appsettings.json`. The app-specific
password must not be added to that file or committed to Git.

For local development, set it through .NET user secrets:

```powershell
dotnet user-secrets set "Email:Password" "<ZOHO-APP-SPECIFIC-PASSWORD>" --project .\src\Acutis.Practitioner.Api\Acutis.Practitioner.Api.csproj
```

For deployed environments, use the secret environment variable
`Email__Password`. Restart the Practitioner API after changing either source.

An authenticated administrator can inspect `/api/admin/email/health`. In
Development, any authenticated active Practitioner member can use
`POST /api/admin/email/test` with an explicit `destination`; outside
Development this is restricted to administrators. Neither endpoint returns
credentials, invitation tokens, or full provider responses.
