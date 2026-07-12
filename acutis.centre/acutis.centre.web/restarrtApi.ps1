param(
    [ValidateRange(1, 65535)]
    [int]$Port = 5009,

    [int]$WaitSeconds = 90
)

$ErrorActionPreference = "Stop"

$webDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$centreRoot = Split-Path -Parent $webDir
$repoRoot = Split-Path -Parent $centreRoot
$apiDir = Join-Path $repoRoot "acutis.centre\acutis.centre.api\src\Acutis.Api"
$apiProject = Join-Path $apiDir "Acutis.Api.csproj"
$apiExeDir = Join-Path $apiDir "bin\Debug\net8.0"
$apiExePath = Join-Path $apiExeDir "Acutis.Api.exe"

if (-not (Test-Path $apiDir)) {
    throw "API directory not found: $apiDir"
}

function Stop-ApiPort {
    param([int]$ApiPort)

    $listeners = Get-NetTCPConnection -LocalPort $ApiPort -State Listen -ErrorAction SilentlyContinue
    if (-not $listeners) {
        Write-Host "No listener found on API port $ApiPort."
        return
    }

    $listeners |
        Select-Object -ExpandProperty OwningProcess -Unique |
        Where-Object { $_ -and $_ -gt 0 } |
        ForEach-Object {
            $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping process $($_) ($($process.ProcessName)) on API port $ApiPort..."
                Stop-Process -Id $_ -Force
            }
        }
}

function Stop-OrphanedApiProcesses {
    $apiProcesses = Get-CimInstance Win32_Process |
        Where-Object {
            $_.CommandLine -and (
                $_.CommandLine -like "*Acutis.Api.exe*" -or
                $_.CommandLine -like "*Acutis.Api.csproj*"
            )
        }

    foreach ($apiProcess in $apiProcesses) {
        if ($apiProcess.ProcessId -eq $PID) {
            continue
        }

        $process = Get-Process -Id $apiProcess.ProcessId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping orphaned Acutis.Api process $($apiProcess.ProcessId)..."
            Stop-Process -Id $apiProcess.ProcessId -Force
        }
    }
}

function Test-PortOpen {
    param([int]$ApiPort)

    try {
        $client = [Net.Sockets.TcpClient]::new()
        $task = $client.ConnectAsync("127.0.0.1", $ApiPort)
        if (-not $task.Wait(1000)) {
            $client.Dispose()
            return $false
        }

        $client.Dispose()
        return $true
    } catch {
        return $false
    }
}

Write-Host "Restarting Acutis.Api on http://localhost:$Port..."

Stop-ApiPort -ApiPort $Port
Stop-OrphanedApiProcesses
Start-Sleep -Milliseconds 500

if (Test-Path $apiExePath) {
    $command = "`$env:ASPNETCORE_URLS='http://localhost:$Port'; `$env:ASPNETCORE_ENVIRONMENT='Development'; & '$apiExePath'"
    $workingDirectory = $apiExeDir
    Write-Host "Starting built API executable..."
} else {
    if (-not (Test-Path $apiProject)) {
        throw "API project not found: $apiProject"
    }

    $command = "`$env:ASPNETCORE_URLS='http://localhost:$Port'; `$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --project '$apiProject' --urls 'http://localhost:$Port'"
    $workingDirectory = $apiDir
    Write-Host "Built API executable not found. Starting with dotnet run..."
}

Start-Process `
    -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $command `
    -WorkingDirectory $workingDirectory `
    -WindowStyle Normal

$deadline = (Get-Date).AddSeconds($WaitSeconds)
while ((Get-Date) -lt $deadline) {
    if (Test-PortOpen -ApiPort $Port) {
        Write-Host "Acutis.Api is ready at http://localhost:$Port."
        exit 0
    }

    Start-Sleep -Seconds 2
}

Write-Warning "Timed out waiting for Acutis.Api on port $Port."
exit 1
