param(
    [switch]$ClearCache,
    [switch]$NoAndroid,
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$adbPath = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
$emulatorRunning = $false

if (Test-Path $adbPath) {
    $adbDevices = & $adbPath devices | Out-String
    $emulatorRunning = $adbDevices -match "emulator-\d+\s+device"
}

if (-not $NoAndroid -and -not $emulatorRunning) {
    Write-Host "No running Android emulator detected. Start 'Acutis_Tablet' first, then rerun this command." -ForegroundColor Yellow
}

$expoArgs = @("expo", "start", "--port", $Port)

if (-not $NoAndroid) {
    $expoArgs += "--android"
}

if ($ClearCache) {
    $expoArgs += "--clear"
}

Write-Host "Starting Acutis Tablet dev server from $projectRoot" -ForegroundColor Cyan
Write-Host "Command: npx $($expoArgs -join ' ')" -ForegroundColor DarkGray
Write-Host "Tip: use --clear only when the app is genuinely stuck." -ForegroundColor DarkYellow

npx @expoArgs
