[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5009,

    [ValidateRange(1, 65535)]
    [int]$WebPort = 3000,

    [ValidateRange(1, 600)]
    [int]$WaitSeconds = 120
)

$ErrorActionPreference = "Stop"

$centreRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiProject = Join-Path $centreRoot "acutis.centre.api\src\Acutis.Api\Acutis.Api.csproj"
$apiDirectory = Split-Path -Parent $apiProject
$webDirectory = Join-Path $centreRoot "acutis.centre.web"

function Get-DockerCli {
    $docker = Get-Command "docker.exe" -ErrorAction SilentlyContinue
    if ($docker) {
        return $docker.Source
    }

    $dockerCli = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin\docker.exe"
    if (Test-Path -LiteralPath $dockerCli) {
        return $dockerCli
    }

    return $null
}

function Test-DockerRunning {
    $dockerCli = Get-DockerCli
    if (-not $dockerCli) {
        return $false
    }

    & $dockerCli info *> $null
    return $LASTEXITCODE -eq 0
}

function Start-DockerIfNeeded {
    if (Test-DockerRunning) {
        Write-Host "Docker is already running."
        return
    }

    $dockerDesktop = @(
        (Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe")
        (Join-Path $env:LOCALAPPDATA "Docker\Docker Desktop.exe")
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

    if (-not $dockerDesktop) {
        throw "Docker is not running and Docker Desktop could not be found."
    }

    Write-Host "Starting Docker Desktop..."
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden

    $deadline = (Get-Date).AddSeconds($WaitSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerRunning) {
            Write-Host "Docker is ready."
            return
        }

        Start-Sleep -Seconds 2
    }

    throw "Docker did not become ready within $WaitSeconds seconds."
}

function Clear-Port {
    param(
        [int]$Port,
        [string]$ServiceName
    )

    $processIds = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    if (-not $processIds) {
        Write-Host "$ServiceName port $Port is clear."
        return
    }

    foreach ($processId in $processIds) {
        if ($processId -and $processId -ne $PID) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping $($process.ProcessName) (PID $processId) on port $Port..."
                Stop-Process -Id $processId -Force
            }
        }
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [string]$ServiceName
    )

    $deadline = (Get-Date).AddSeconds($WaitSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
            Write-Host "$ServiceName is ready at http://localhost:$Port."
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "$ServiceName did not start on port $Port within $WaitSeconds seconds."
}

if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "API project not found: $apiProject"
}

if (-not (Test-Path -LiteralPath (Join-Path $webDirectory "package.json"))) {
    throw "Web project not found: $webDirectory"
}

Start-DockerIfNeeded

Write-Host "Clearing API and web ports..."
Clear-Port -Port $ApiPort -ServiceName "API"
Clear-Port -Port $WebPort -ServiceName "Web"
Start-Sleep -Milliseconds 500

$apiCommand = "`$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --project '$apiProject' --urls 'http://localhost:$ApiPort'"
$webCommand = "npm run dev -- --port $WebPort"

Write-Host "Starting centre API..."
Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $apiCommand `
    -WorkingDirectory $apiDirectory

Wait-ForPort -Port $ApiPort -ServiceName "API"

Write-Host "Starting centre web..."
Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $webCommand `
    -WorkingDirectory $webDirectory

Wait-ForPort -Port $WebPort -ServiceName "Web"

Write-Host ""
Write-Host "Acutis Centre restarted successfully:"
Write-Host "- API: http://localhost:$ApiPort"
Write-Host "- Web: http://localhost:$WebPort"
