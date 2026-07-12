param(
    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5009,

    [ValidateRange(1, 65535)]
    [int]$WebPort = 3000,

    [ValidateRange(1, 300)]
    [int]$WaitSeconds = 90
)

$ErrorActionPreference = "Stop"

$webDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $webDirectory
$apiProject = Join-Path $repoRoot "acutis.api\Acutis.Api\Acutis.Api.csproj"
$apiDirectory = Split-Path -Parent $apiProject
$practitionerApiProject = Join-Path $repoRoot "acutis.api\Acutis.Practitioner.Api\Acutis.Practitioner.Api.csproj"
$communityApiProject = Join-Path $repoRoot "acutis.api\Acutis.Community.Api\Acutis.Community.Api.csproj"
$practitionerWebDirectory = Join-Path $repoRoot "apps\practitioner-web"
$communityWebDirectory = Join-Path $repoRoot "apps\community-web"

if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "API project not found: $apiProject"
}

if (-not (Test-Path -LiteralPath $webDirectory)) {
    throw "Web directory not found: $webDirectory"
}

foreach ($requiredPath in @($practitionerApiProject, $communityApiProject, $practitionerWebDirectory, $communityWebDirectory)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required product project not found: $requiredPath"
    }
}

function Stop-PortListener {
    param(
        [int]$Port,
        [string]$Name
    )

    $processIds = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    if (-not $processIds) {
        Write-Host "$Name port $Port is already clear."
        return
    }

    foreach ($processId in $processIds) {
        if (-not $processId -or $processId -eq $PID) {
            continue
        }

        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping $($process.ProcessName) (PID $processId) on $Name port $Port..."
            Stop-Process -Id $processId -Force
        }
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [string]$Name,
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($listener) {
            Write-Host "$Name is ready at http://localhost:$Port."
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "$Name did not start on port $Port within $TimeoutSeconds seconds."
}

function Get-DockerCli {
    $dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerCommand) {
        return $dockerCommand.Source
    }

    $bundledCli = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin\docker.exe"
    if (Test-Path -LiteralPath $bundledCli) {
        return $bundledCli
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

function Ensure-DockerRunning {
    param([int]$TimeoutSeconds)

    if (Test-DockerRunning) {
        Write-Host "Docker is already running."
        return
    }

    $dockerDesktopPaths = @(
        (Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"),
        (Join-Path $env:LOCALAPPDATA "Docker\Docker Desktop.exe")
    )
    $dockerDesktop = $dockerDesktopPaths |
        Where-Object { Test-Path -LiteralPath $_ } |
        Select-Object -First 1

    if (-not $dockerDesktop) {
        throw "Docker is not running and Docker Desktop could not be found. Install Docker Desktop or start the Docker daemon manually."
    }

    if (-not (Get-DockerCli)) {
        throw "Docker Desktop was found, but the Docker CLI could not be found. Repair the Docker Desktop installation or add docker.exe to PATH."
    }

    Write-Host "Docker is not running. Starting Docker Desktop..."
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerRunning) {
            Write-Host "Docker is ready."
            return
        }

        Start-Sleep -Seconds 2
    }

    throw "Docker Desktop did not become ready within $TimeoutSeconds seconds."
}

Write-Host "Clearing Acutis API and web ports..."
Stop-PortListener -Port $ApiPort -Name "API"
Stop-PortListener -Port $WebPort -Name "Web"
Stop-PortListener -Port 5010 -Name "Practitioner API"
Stop-PortListener -Port 5020 -Name "Community API"
Stop-PortListener -Port 3010 -Name "Practitioner web"
Stop-PortListener -Port 3020 -Name "Community web"
Start-Sleep -Milliseconds 500

Ensure-DockerRunning -TimeoutSeconds $WaitSeconds

$apiCommand = @"
`$env:ASPNETCORE_URLS = 'http://localhost:$ApiPort'
`$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project '$apiProject' --urls 'http://localhost:$ApiPort'
"@

Write-Host "Starting API..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $apiCommand `
    -WorkingDirectory $apiDirectory `
    -WindowStyle Normal

Wait-ForPort -Port $ApiPort -Name "API" -TimeoutSeconds $WaitSeconds

$practitionerApiCommand = "dotnet run --project '$practitionerApiProject' --urls 'http://localhost:5010'"
$communityApiCommand = "dotnet run --project '$communityApiProject' --urls 'http://localhost:5020'"

Write-Host "Starting Practitioner API..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $practitionerApiCommand `
    -WorkingDirectory (Split-Path -Parent $practitionerApiProject) `
    -WindowStyle Normal

Write-Host "Starting Community API..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $communityApiCommand `
    -WorkingDirectory (Split-Path -Parent $communityApiProject) `
    -WindowStyle Normal

Wait-ForPort -Port 5010 -Name "Practitioner API" -TimeoutSeconds $WaitSeconds
Wait-ForPort -Port 5020 -Name "Community API" -TimeoutSeconds $WaitSeconds

Write-Host "Starting Practitioner web..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "npm run dev" `
    -WorkingDirectory $practitionerWebDirectory `
    -WindowStyle Normal

Write-Host "Starting Community web..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "npm run dev" `
    -WorkingDirectory $communityWebDirectory `
    -WindowStyle Normal

Wait-ForPort -Port 3010 -Name "Practitioner web" -TimeoutSeconds $WaitSeconds
Wait-ForPort -Port 3020 -Name "Community web" -TimeoutSeconds $WaitSeconds

$webCommand = @"
`$env:PORT = '$WebPort'
npm run dev -- --port $WebPort
"@

Write-Host "Starting web..."
Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $webCommand `
    -WorkingDirectory $webDirectory `
    -WindowStyle Normal

Wait-ForPort -Port $WebPort -Name "Web" -TimeoutSeconds $WaitSeconds

Write-Host ""
Write-Host "Acutis restarted successfully:"
Write-Host "- API: http://localhost:$ApiPort"
Write-Host "- Web: http://localhost:$WebPort"
Write-Host "- Practitioner: http://localhost:3010 (API http://localhost:5010)"
Write-Host "- Community: http://localhost:3020 (API http://localhost:5020)"
