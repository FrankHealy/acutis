# Start the new Keycloak via docker compose and wait for it to be ready
cd (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
docker compose up -d

Write-Host "Waiting for Keycloak to become healthy on http://localhost:8080..."
for ($i = 0; $i -lt 60; $i++) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri http://localhost:8080/ -TimeoutSec 3 -ErrorAction Stop
    if ($r.StatusCode -eq 200 -or $r.StatusCode -eq 302) {
      Write-Host "Keycloak is reachable."
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

Write-Host "Keycloak started. Admin console: http://localhost:8080/admin/ (admin/admin)"
