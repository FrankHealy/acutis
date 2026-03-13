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

$apiExeDir = Join-Path $apiDir "Acutis.Api\bin\Debug\net8.0"
$apiExePath = Join-Path $apiExeDir "Acutis.Api.exe"
$webCmd = "npm run dev"
$apiUsesBuiltExecutable = Test-Path $apiExePath

if ($apiUsesBuiltExecutable) {
    $apiCmd = "`$env:ASPNETCORE_URLS='http://localhost:5009'; `$env:ASPNETCORE_ENVIRONMENT='Development'; & '$apiExePath'"
} else {
    $apiCmd = "dotnet run --project .\Acutis.Api\Acutis.Api.csproj"
}

Write-Host "Starting API from $apiDir ..."
if ($NoNewWindow) {
    if ($apiUsesBuiltExecutable) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiExeDir
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiDir
    }
} else {
    if ($apiUsesBuiltExecutable) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiExeDir -WindowStyle Normal
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiDir -WindowStyle Normal
    }
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
if ($apiUsesBuiltExecutable) {
    Write-Host "- API: built executable (http://localhost:5009)"
} else {
    Write-Host "- API: dotnet run fallback (Acutis.Api)"
}
Write-Host "- UI : npm run dev (acutis.web)"
Write-Host ""
Write-Host "Default URLs:"
if ($apiUsesBuiltExecutable) {
    Write-Host "- API: http://localhost:5009"
} else {
    Write-Host "- API: https://localhost:5001 or http://localhost:5000 (per launch settings)"
}
Write-Host "- UI : http://localhost:3000"
