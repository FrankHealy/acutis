param(
    [switch]$NoNewWindow
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $repoRoot "acutis.api"
$webDir = Join-Path $repoRoot "acutis.web"

if (-not (Test-Path $apiDir)) {
    throw "API directory not found: $apiDir"
}

if (-not (Test-Path $webDir)) {
    throw "Web directory not found: $webDir"
}

$apiCmd = "dotnet run --project .\Acutis.Api\Acutis.Api.csproj"
$webCmd = "npm run dev"

Write-Host "Starting API from $apiDir ..."
if ($NoNewWindow) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiDir
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiDir -WindowStyle Normal
}

Start-Sleep -Seconds 3

Write-Host "Starting UI from $webDir ..."
if ($NoNewWindow) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCmd -WorkingDirectory $webDir
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCmd -WorkingDirectory $webDir -WindowStyle Normal
}

Write-Host ""
Write-Host "Started:"
Write-Host "- API: dotnet run (Acutis.Api)"
Write-Host "- UI : npm run dev (acutis.web)"
Write-Host ""
Write-Host "Default URLs:"
Write-Host "- API: https://localhost:5001 or http://localhost:5000 (per launch settings)"
Write-Host "- UI : http://localhost:3000"
