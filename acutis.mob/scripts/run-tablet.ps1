param(
  [string]$DeviceHint = "emulator"
)

function Get-AndroidDeviceSerial {
  $adb = Get-Command adb -ErrorAction SilentlyContinue
  if (-not $adb) {
    Write-Host "adb not found. Please open Android Studio Device Manager and ensure platform-tools are on PATH." -ForegroundColor Yellow
    return $null
  }

  $lines = & adb devices -l | Where-Object { $_ -and ($_ -notmatch 'List of devices') }
  $ready = $lines | Where-Object { $_ -match '\bdevice\b' }

  if (-not $ready -or $ready.Count -eq 0) {
    Write-Host "No running Android emulators detected. Start your tablet AVD in Android Studio, then re-run." -ForegroundColor Yellow
    return $null
  }

  # Prefer an emulator line and optional hint match
  $candidates = $ready | Where-Object { $_ -match '^emulator-' }
  if ($DeviceHint) { $candidates = $candidates | Where-Object { $_ -match $DeviceHint } }
  if (-not $candidates -or $candidates.Count -eq 0) { $candidates = $ready }

  $serial = (($candidates | Select-Object -First 1) -split '\s+')[0]
  return $serial
}

$serial = Get-AndroidDeviceSerial
if (-not $serial) { exit 1 }

Write-Host "Targeting Android device: $serial" -ForegroundColor Cyan

# Help the emulator reach Metro
try { & adb -s $serial reverse tcp:8081 tcp:8081 | Out-Null } catch {}

$env:EXPO_ANDROID_DEVICE_ID = $serial

# Clear cache and open on Android
npx expo start -c --android

