[CmdletBinding()]
param(
    [ValidateRange(1, 600)]
    [int]$WaitSeconds = 120
)

$isAdministrator = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdministrator) {
    Write-Host "Administrator access is required to stop existing Acutis process trees. Requesting elevation..."
    $arguments = @(
        "-NoProfile"
        "-NoExit"
        "-ExecutionPolicy", "Bypass"
        "-File", "`"$PSCommandPath`""
        "-WaitSeconds", $WaitSeconds
    )
    $elevated = Start-Process -FilePath "powershell.exe" -Verb RunAs -ArgumentList $arguments -Wait -PassThru
    exit $elevated.ExitCode
}

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$liveKitTokenPath = Join-Path (Split-Path -Parent $repoRoot) "Livekit test TOKEN.txt"
$logDirectory = Join-Path $repoRoot ".dev-logs"
$restartLogPath = Join-Path $logDirectory "restartall.log"
$centreConnectionString = if ([string]::IsNullOrWhiteSpace($env:ACUTIS_CENTRE_CONNECTION_STRING)) {
    "Server=(localdb)\MSSQLLocalDB;Database=Acutis_CuanMhuire_IE_Dev;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True;Connect Timeout=15;"
}
else {
    $env:ACUTIS_CENTRE_CONNECTION_STRING
}

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
Set-Content -LiteralPath $restartLogPath -Value "$(Get-Date -Format o) Starting combined Acutis restart."

function Stop-OtherRestartSupervisors {
    $currentProcessId = $PID
    $others = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessId -ne $currentProcessId -and
        $_.Name -in @('powershell.exe', 'pwsh.exe') -and
        $_.CommandLine -match '(?i)restartall\.ps1'
    }
    foreach ($process in $others) {
        Write-Host "Stopping previous restart supervisor (PID $($process.ProcessId))..."
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
    if ($others) {
        Start-Sleep -Seconds 2
    }
}

trap {
    if ($_.Exception -is [System.Management.Automation.PipelineStoppedException]) {
        break
    }

    $failure = "Restart failed: $($_.Exception.Message)"
    Write-Host ""
    Write-Host $failure -ForegroundColor Red
    Add-Content -LiteralPath $restartLogPath -Value "$(Get-Date -Format o) $failure"
    Write-Host "The output window has been left open so the error can be read."
    Write-Host "Failure log: $restartLogPath"
    Read-Host "Press Enter when you have read the error"
    break
}

$services = @(
    [pscustomobject]@{
        Name = "Centre API"
        Port = 5009
        Directory = Join-Path $repoRoot "acutis.centre\acutis.centre.api\src\Acutis.Api"
        Command = "`$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:Logging__LogLevel__Microsoft_EntityFrameworkCore_Database_Command='Warning'; `$env:ConnectionStrings__DefaultConnection='$centreConnectionString'; `$env:Database__ApplyMigrationsOnStartup='true'; `$env:Database__StartupRetryCount='12'; `$env:Database__StartupRetryDelaySeconds='5'; dotnet run --project 'Acutis.Api.csproj' --urls 'http://localhost:5009'"
    }
    [pscustomobject]@{
        Name = "Practitioner API"
        Port = 5010
        Directory = Join-Path $repoRoot "acutis.practitioner\acutis.practitioner.api\src\Acutis.Practitioner.Api"
        Command = "`$liveKit=@{}; Get-Content -LiteralPath '$liveKitTokenPath' | ForEach-Object { `$i=`$_.IndexOf(':'); if (`$i -lt 0) { `$i=`$_.IndexOf('=') }; if (`$i -ge 0) { `$liveKit[`$_.Substring(0,`$i).Trim()]=`$_.Substring(`$i+1).Trim() } }; `$env:LiveKit__ApiKey=`$liveKit['API Key']; `$env:LiveKit__ApiSecret=`$liveKit['API Secret']; `$env:LiveKit__Url='wss://vc.salientrecovery.com'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:Logging__LogLevel__Microsoft_EntityFrameworkCore_Database_Command='Warning'; dotnet run --project 'Acutis.Practitioner.Api.csproj' --urls 'http://localhost:5010'"
    }
    [pscustomobject]@{
        Name = "Community API"
        Port = 5020
        Directory = Join-Path $repoRoot "acutis.community\acutis.community.api\src\Acutis.Community.Api"
        Command = "`$liveKit=@{}; Get-Content -LiteralPath '$liveKitTokenPath' | ForEach-Object { `$i=`$_.IndexOf(':'); if (`$i -lt 0) { `$i=`$_.IndexOf('=') }; if (`$i -ge 0) { `$liveKit[`$_.Substring(0,`$i).Trim()]=`$_.Substring(`$i+1).Trim() } }; `$env:LiveKit__ApiKey=`$liveKit['API Key']; `$env:LiveKit__ApiSecret=`$liveKit['API Secret']; `$env:LiveKit__Url='wss://vc.salientrecovery.com'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:Logging__LogLevel__Microsoft_EntityFrameworkCore_Database_Command='Warning'; dotnet run --project 'Acutis.Community.Api.csproj' --urls 'http://localhost:5020'"
    }
    [pscustomobject]@{
        Name = "Outreach API"
        Port = 5030
        Directory = Join-Path $repoRoot "acutis.outreach\acutis.outreach.api\src\Acutis.Outreach.Api"
        Command = "`$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:Logging__LogLevel__Microsoft_EntityFrameworkCore_Database_Command='Warning'; dotnet run --project 'Acutis.Outreach.Api.csproj' --urls 'http://localhost:5030'"
    }
    [pscustomobject]@{
        Name = "Centre web"
        Port = 3000
        Directory = Join-Path $repoRoot "acutis.centre\acutis.centre.web"
        Command = "npm run dev -- --port 3000"
    }
    [pscustomobject]@{
        Name = "Practitioner web"
        Port = 3010
        Directory = Join-Path $repoRoot "acutis.practitioner\acutis.practitioner.web"
        Command = "npm run dev"
    }
    [pscustomobject]@{
        Name = "Community web"
        Port = 3020
        Directory = Join-Path $repoRoot "acutis.community\acutis.community.web"
        Command = "npm run dev"
    }
    [pscustomobject]@{
        Name = "Outreach web"
        Port = 3030
        Directory = Join-Path $repoRoot "acutis.outreach\acutis.outreach.web"
        Command = "npm run dev"
    }
)

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

    # Docker Desktop reports its unavailable Linux named pipe on stderr while it
    # is still starting. With the script-wide Stop preference PowerShell turns
    # that expected probe failure into a terminating NativeCommandError.
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $dockerCli info *> $null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
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

function Initialize-CentreSql {
    param([string]$ConnectionString)

    Add-Type -AssemblyName System.Data
    $builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new($ConnectionString)
    $server = $builder.get_DataSource()
    if ([string]::IsNullOrWhiteSpace($server)) {
        throw "Centre SQL connection string does not contain a server."
    }

    if ($server -match '^\(localdb\)\\(?<instance>[^,;]+)$') {
        $instance = $Matches.instance
        $localDb = Get-Command "SqlLocalDB.exe" -ErrorAction SilentlyContinue
        if (-not $localDb) {
            throw "Centre is configured for LocalDB but SqlLocalDB.exe is not installed."
        }
        & $localDb.Source start $instance *> $null
        if ($LASTEXITCODE -ne 0) {
            throw "Unable to start SQL LocalDB instance '$instance'."
        }
    }

    $probeBuilder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new($ConnectionString)
    # Windows PowerShell 5.1 otherwise routes property assignment through the
    # builder's IDictionary adapter and treats "InitialCatalog" as an invalid
    # literal connection-string keyword. Invoke the CLR setters explicitly.
    $probeBuilder.set_InitialCatalog("master")
    $probeBuilder.set_ConnectTimeout(5)
    $deadline = (Get-Date).AddSeconds(30)
    do {
        $connection = [System.Data.SqlClient.SqlConnection]::new($probeBuilder.get_ConnectionString())
        try {
            $connection.Open()
            Write-Host "Centre SQL is ready on $server."
            return
        }
        catch {
            if ((Get-Date) -ge $deadline) {
                throw "Centre SQL is not reachable on '$server': $($_.Exception.Message)"
            }
        }
        finally {
            $connection.Dispose()
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)
}

function Stop-ProcessTree {
    param(
        [int]$ProcessId,
        [string]$Context
    )

    if (-not (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)) {
        return
    }

    # A previously stopped parent can take child processes from the original
    # CIM/port snapshot with it. PowerShell 5.1 turns taskkill's harmless
    # "process not found" stderr into an error under the script-wide Stop
    # preference, so probe the actual process after the attempt instead.
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "SilentlyContinue"
        & taskkill.exe /PID $ProcessId /T /F *> $null
    }
    catch {
        # The authoritative check below distinguishes already-gone from a real
        # access/termination failure.
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    $deadline = (Get-Date).AddSeconds(10)
    while ((Get-Date) -lt $deadline) {
        if (-not (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)) {
            return
        }
        Start-Sleep -Milliseconds 250
    }

    if (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue) {
        throw "Unable to terminate PID $ProcessId ($Context) after waiting 10 seconds even with administrator access."
    }
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
                Write-Host "Stopping $($process.ProcessName) process tree (PID $processId) on $ServiceName port $Port..."
                Stop-ProcessTree -ProcessId $processId -Context "$ServiceName port $Port"
            }
        }
    }

    $deadline = (Get-Date).AddSeconds(10)
    do {
        $remaining = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if (-not $remaining) {
            Write-Host "$ServiceName port $Port is clear."
            return
        }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)

    $remainingIds = $remaining | Select-Object -ExpandProperty OwningProcess -Unique
    throw "$ServiceName port $Port is still occupied by PID(s): $($remainingIds -join ', ')."
}

function Clear-AllAcutisDevelopmentProcesses {
    Write-Host "Stopping all Acutis API and Next.js development process trees..."

    $escapedRoot = [Regex]::Escape($repoRoot)
    $candidates = Get-CimInstance Win32_Process | Where-Object {
        if ($_.ProcessId -eq $PID) {
            return $false
        }

        $name = $_.Name
        $command = $_.CommandLine
        if ($name -match '^Acutis\..*Api\.exe$') {
            return $true
        }
        if ([string]::IsNullOrWhiteSpace($command) -or $command -notmatch $escapedRoot) {
            return $false
        }

        return (
            ($name -eq 'dotnet.exe' -and $command -match '(?i)Acutis\..*Api(?:\.csproj|\.dll)') -or
            ($name -eq 'node.exe' -and $command -match '(?i)[\\/](?:next|vite)[\\/]|(?:next|vite)(?:\.cmd)?\s+(?:dev|start|preview)') -or
            ($name -in @('cmd.exe', 'powershell.exe', 'pwsh.exe', 'npm.exe', 'npm.cmd') -and $command -match '(?i)npm\s+run\s+(?:dev|start)')
        )
    }

    foreach ($candidate in ($candidates | Sort-Object ProcessId -Descending)) {
        if (Get-Process -Id $candidate.ProcessId -ErrorAction SilentlyContinue) {
            Write-Host "Stopping $($candidate.Name) process tree (PID $($candidate.ProcessId))..."
            Stop-ProcessTree -ProcessId $candidate.ProcessId -Context "Acutis development process cleanup"
        }
    }

    Start-Sleep -Milliseconds 750
}

function Receive-ServiceOutput {
    param([hashtable]$ServiceJobs)

    $logLines = [Collections.Generic.List[string]]::new()
    foreach ($service in $services) {
        $job = $ServiceJobs[$service.Name]
        if (-not $job) {
            continue
        }

        foreach ($line in @(Receive-Job -Job $job -ErrorAction SilentlyContinue)) {
            if ($null -ne $line -and -not [string]::IsNullOrWhiteSpace($line.ToString())) {
                $formattedLine = "[$($service.Name)] $line"
                Write-Host $formattedLine
                $logLines.Add("$(Get-Date -Format o) $formattedLine")
            }
        }
    }
    if ($logLines.Count -gt 0) {
        Add-Content -LiteralPath $restartLogPath -Value $logLines
    }
}

function Assert-ServiceJobsRunning {
    param([hashtable]$ServiceJobs)

    foreach ($service in $services) {
        $job = $ServiceJobs[$service.Name]
        if ($job.State -in @("Failed", "Stopped", "Completed")) {
            Receive-ServiceOutput -ServiceJobs $ServiceJobs
            $reason = $job.ChildJobs[0].JobStateInfo.Reason
            $details = if ($reason) { $reason.Message } else { "The service process exited unexpectedly." }
            throw "$($service.Name) stopped before startup completed. $details"
        }
    }
}

function Wait-ForServices {
    param([hashtable]$ServiceJobs)

    $pending = @($services)
    $deadline = (Get-Date).AddSeconds($WaitSeconds)
    while ($pending.Count -gt 0 -and (Get-Date) -lt $deadline) {
        Receive-ServiceOutput -ServiceJobs $ServiceJobs
        Assert-ServiceJobsRunning -ServiceJobs $ServiceJobs

        $stillPending = @()
        foreach ($service in $pending) {
            if (Get-NetTCPConnection -LocalPort $service.Port -State Listen -ErrorAction SilentlyContinue) {
                Write-Host "$($service.Name) is ready at http://localhost:$($service.Port)."
            }
            else {
                $stillPending += $service
            }
        }
        $pending = $stillPending
        if ($pending.Count -gt 0) {
            Start-Sleep -Milliseconds 500
        }
    }

    if ($pending.Count -gt 0) {
        throw "Services did not start within $WaitSeconds seconds: $($pending.Name -join ', ')."
    }
}

foreach ($service in $services) {
    if (-not (Test-Path -LiteralPath $service.Directory)) {
        throw "$($service.Name) directory not found: $($service.Directory)"
    }
}

function Clear-NextDevelopmentCaches {
    foreach ($service in $services | Where-Object { $_.Name -like '* web' }) {
        $webRoot = [IO.Path]::GetFullPath($service.Directory).TrimEnd([IO.Path]::DirectorySeparatorChar)
        $cachePath = [IO.Path]::GetFullPath((Join-Path $webRoot '.next\dev'))
        $expectedPrefix = $webRoot + [IO.Path]::DirectorySeparatorChar
        if (-not $cachePath.StartsWith($expectedPrefix, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to clear a Next.js cache outside $webRoot."
        }
        if (Test-Path -LiteralPath $cachePath) {
            Write-Host "Clearing stale $($service.Name) development bundle..."
            Remove-Item -LiteralPath $cachePath -Recurse -Force
        }
        $viteCachePath = [IO.Path]::GetFullPath((Join-Path $webRoot 'node_modules\.vite'))
        if ($viteCachePath.StartsWith($expectedPrefix, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $viteCachePath)) {
            Write-Host "Clearing stale $($service.Name) Vite cache..."
            Remove-Item -LiteralPath $viteCachePath -Recurse -Force
        }
    }
}

function Initialize-ProductRealms {
    $scriptPath = Join-Path $repoRoot 'infrastructure\keycloak\apply-local-product-realms.ps1'
    if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Keycloak realm configuration script not found: $scriptPath" }
    for ($attempt = 1; $attempt -le 12; $attempt++) {
        try { & $scriptPath; return }
        catch {
            if ($attempt -eq 12) { throw "Unable to configure the local Keycloak product realms: $($_.Exception.Message)" }
            Write-Host "Waiting for Keycloak before applying SPA realm configuration ($attempt/12)..."
            Start-Sleep -Seconds 5
        }
    }
}

Stop-OtherRestartSupervisors
Start-DockerIfNeeded
Initialize-ProductRealms
Initialize-CentreSql -ConnectionString $centreConnectionString

Write-Host "Clearing all API and web ports..."
Clear-AllAcutisDevelopmentProcesses
foreach ($service in $services) {
    Clear-Port -Port $service.Port -ServiceName $service.Name
}
Clear-NextDevelopmentCaches
Start-Sleep -Milliseconds 500

$serviceJobs = @{}
foreach ($service in $services) {
    Write-Host "Starting $($service.Name) in the combined console..."
    $serviceJobs[$service.Name] = Start-Job `
        -Name ($service.Name -replace '[^A-Za-z0-9_-]', '-') `
        -ArgumentList $service.Directory, $service.Command `
        -ScriptBlock {
            param($workingDirectory, $command)
            Set-Location -LiteralPath $workingDirectory
            $ErrorActionPreference = "Continue"
            & ([scriptblock]::Create($command)) 2>&1
        }
}

try {
    Wait-ForServices -ServiceJobs $serviceJobs

    Write-Host ""
    Write-Host "All Acutis services restarted successfully:"
    Write-Host "- Centre:       http://localhost:3000 (API http://localhost:5009)"
    Write-Host "- Practitioner: http://localhost:3010 (API http://localhost:5010)"
    Write-Host "- Community:    http://localhost:3020 (API http://localhost:5020)"
    Write-Host "- Outreach:     http://localhost:3030 (API http://localhost:5030)"
    Write-Host ""
    Write-Host "Combined service output is shown below. Press Ctrl+C to stop all services."

    while ($true) {
        Receive-ServiceOutput -ServiceJobs $serviceJobs
        Assert-ServiceJobsRunning -ServiceJobs $serviceJobs
        Start-Sleep -Milliseconds 250
    }
}
finally {
    Write-Host "Stopping Acutis service jobs..."
    $serviceJobs.Values | Stop-Job -ErrorAction SilentlyContinue
    Receive-ServiceOutput -ServiceJobs $serviceJobs
    $serviceJobs.Values | Remove-Job -Force -ErrorAction SilentlyContinue
    Clear-AllAcutisDevelopmentProcesses
}
