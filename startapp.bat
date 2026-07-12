@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=C:\Acutis"
set "API_DIR=%ROOT%\acutis.centre\acutis.centre.api"
set "WEB_DIR=%ROOT%\acutis.centre\acutis.centre.web"
set "API_EXE=%API_DIR%\src\Acutis.Api\bin\Debug\net8.0\Acutis.Api.exe"
set "API_PORT=5009"
set "WEB_PORT=3000"
set "KEYCLOAK_URL=http://localhost:8080/"
set "SQL_SERVER="
set "SQL_CONNECTION="

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="/s" (
    if "%~2"=="" (
        goto missing_sql_arg
    )
    set "SQL_SERVER=%~2"
    shift
    shift
    goto parse_args
)
echo Unknown argument: %~1
echo Usage: startapp.bat [/s SQLSERVER]
exit /b 1

:missing_sql_arg
echo Missing SQL Server after /s.
echo Usage: startapp.bat [/s SQLSERVER]
exit /b 1

:args_done
if not defined SQL_SERVER (
    for /f "tokens=1,* delims=|" %%A in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$dev = Join-Path '%ROOT%' 'acutis.centre\acutis.centre.api\src\Acutis.Api\appsettings.Development.json'; $base = Join-Path '%ROOT%' 'acutis.centre\acutis.centre.api\src\Acutis.Api\appsettings.json'; $items = @($dev, $base) | Where-Object { Test-Path $_ } | ForEach-Object { $json = Get-Content $_ -Raw | ConvertFrom-Json; $cs = [string]$json.ConnectionStrings.DefaultConnection; $server = ''; if ($cs -match '(?i)(Server|Data Source)\s*=\s*([^;]+)') { $server = $matches[2] }; [pscustomobject]@{ Server = $server; Connection = $cs } }; $local = $items | Where-Object { $_.Server -match ('^(localhost|127\.0\.0\.1|\.|' + [regex]::Escape($env:COMPUTERNAME) + ')(\\|,|$)') } | Select-Object -First 1; $pick = if ($local) { $local } else { $items | Select-Object -First 1 }; if ($pick) { Write-Output ($pick.Server + '|' + $pick.Connection) }"') do (
        set "SQL_SERVER=%%A"
        set "SQL_CONNECTION=%%B"
    )
)

if not defined SQL_SERVER (
    echo Could not find SQL Server from appsettings. Pass it with /s, for example:
    echo startapp.bat /s localhost
    exit /b 1
)

echo Using SQL Server: %SQL_SERVER%
if not defined SQL_CONNECTION (
    set "SQL_CONNECTION=Server=%SQL_SERVER%;Database=Acutis_CuanMhuire_IE_Dev;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True;"
)

call :ensure_docker
if errorlevel 1 exit /b 1

call :ensure_keycloak
if errorlevel 1 exit /b 1

call :ensure_sql
if errorlevel 1 exit /b 1

call :ensure_api
if errorlevel 1 exit /b 1

call :ensure_web
if errorlevel 1 exit /b 1

echo.
echo App startup complete.
echo Keycloak: %KEYCLOAK_URL%
echo API:      http://localhost:%API_PORT%
echo Website:  http://localhost:%WEB_PORT%
exit /b 0

:ensure_docker
echo.
echo Checking Docker...
docker info >nul 2>nul
if not errorlevel 1 (
    echo Docker is running.
    exit /b 0
)

echo Docker is not running. Trying to start Docker Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$paths = @((Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'), (Join-Path ${env:ProgramFiles(x86)} 'Docker\Docker\Docker Desktop.exe')); $exe = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1; if (-not $exe) { exit 2 }; Start-Process -FilePath $exe"
if errorlevel 2 (
    echo Docker Desktop was not found. Start Docker Desktop manually, then run startapp.bat again.
    exit /b 1
)

for /l %%I in (1,1,60) do (
    docker info >nul 2>nul
    if not errorlevel 1 (
        echo Docker is running.
        exit /b 0
    )
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2"
)

echo Timed out waiting for Docker Desktop.
exit /b 1

:ensure_keycloak
echo.
echo Checking Keycloak...
docker inspect -f "{{.State.Running}}" keycloak >nul 2>nul
if errorlevel 1 (
    echo Starting Keycloak containers...
    pushd "%ROOT%" >nul
    docker compose up -d keycloak-db keycloak
    set "DOCKER_EXIT=!ERRORLEVEL!"
    popd >nul
    if not "!DOCKER_EXIT!"=="0" (
        echo Failed to start Keycloak with Docker Compose.
        exit /b 1
    )
) else (
    for /f %%R in ('docker inspect -f "{{.State.Running}}" keycloak 2^>nul') do set "KEYCLOAK_RUNNING=%%R"
    if /I not "!KEYCLOAK_RUNNING!"=="true" (
        echo Starting Keycloak containers...
        pushd "%ROOT%" >nul
        docker compose up -d keycloak-db keycloak
        set "DOCKER_EXIT=!ERRORLEVEL!"
        popd >nul
        if not "!DOCKER_EXIT!"=="0" (
            echo Failed to start Keycloak with Docker Compose.
            exit /b 1
        )
    ) else (
        echo Keycloak container is already running.
    )
)

call :wait_http "%KEYCLOAK_URL%" 90 "Keycloak"
exit /b %ERRORLEVEL%

:ensure_sql
echo.
echo Checking SQL Server with /s %SQL_SERVER%...
call :check_sql
if not errorlevel 1 (
    echo SQL Server is reachable.
    exit /b 0
)

call :is_local_sql
if errorlevel 1 (
    echo SQL Server is not reachable and does not look local, so this script cannot start it: %SQL_SERVER%
    exit /b 1
)

echo SQL Server is local and not reachable. Trying to start SQL Server service...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$server = '%SQL_SERVER%'; $instance = 'MSSQLSERVER'; if ($server -match '\\([^,]+)') { $instance = 'MSSQL$' + $matches[1] }; $services = @($instance, 'MSSQLSERVER', 'MSSQL$SQLEXPRESS') | Select-Object -Unique; foreach ($name in $services) { $svc = Get-Service -Name $name -ErrorAction SilentlyContinue; if ($svc -and $svc.Status -ne 'Running') { Start-Service -Name $name -ErrorAction SilentlyContinue } }"

for /l %%I in (1,1,30) do (
    call :check_sql
    if not errorlevel 1 (
        echo SQL Server is reachable.
        exit /b 0
    )
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2"
)

echo SQL Server did not become reachable.
exit /b 1

:ensure_api
echo.
echo Checking API on port %API_PORT%...
call :check_port %API_PORT%
if not errorlevel 1 (
    echo API is already listening on port %API_PORT%.
    exit /b 0
)

echo Starting API...
if exist "%API_EXE%" (
    start "Acutis API" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:ASPNETCORE_URLS='http://localhost:%API_PORT%'; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ConnectionStrings__DefaultConnection='%SQL_CONNECTION%'; & '%API_EXE%'"
) else (
    start "Acutis API" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:ASPNETCORE_URLS='http://localhost:%API_PORT%'; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ConnectionStrings__DefaultConnection='%SQL_CONNECTION%'; dotnet run --project '%API_DIR%\src\Acutis.Api\Acutis.Api.csproj' --urls 'http://localhost:%API_PORT%'"
)

call :wait_port %API_PORT% 90 "API"
exit /b %ERRORLEVEL%

:ensure_web
echo.
echo Checking website on port %WEB_PORT%...
call :check_port %WEB_PORT%
if not errorlevel 1 (
    echo Website is already listening on port %WEB_PORT%.
    start "" "http://localhost:%WEB_PORT%"
    exit /b 0
)

echo Starting website...
start "Acutis Website" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%WEB_DIR%'; npm run dev"

call :wait_http "http://localhost:%WEB_PORT%" 120 "website"
if errorlevel 1 exit /b 1
start "" "http://localhost:%WEB_PORT%"
exit /b 0

:check_sql
where sqlcmd >nul 2>nul
if errorlevel 1 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Add-Type -AssemblyName System.Data; $c = New-Object System.Data.SqlClient.SqlConnection('Server=%SQL_SERVER%;Integrated Security=True;TrustServerCertificate=True;Connection Timeout=3'); $c.Open(); $c.Close(); exit 0 } catch { exit 1 }"
    exit /b %ERRORLEVEL%
)
sqlcmd -S "%SQL_SERVER%" -E -Q "SELECT 1" -b -l 3 >nul 2>nul
exit /b %ERRORLEVEL%

:is_local_sql
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = '%SQL_SERVER%'; $hostName = $env:COMPUTERNAME; if ($s -match '^(localhost|127\.0\.0\.1|\.)(\\|,|$)' -or $s -match ('^' + [regex]::Escape($hostName) + '(\\|,|$)')) { exit 0 } else { exit 1 }"
exit /b %ERRORLEVEL%

:check_port
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = %~1; try { $client = [Net.Sockets.TcpClient]::new(); $task = $client.ConnectAsync('127.0.0.1', $port); if (-not $task.Wait(1000)) { exit 1 }; $client.Close(); exit 0 } catch { exit 1 }"
exit /b %ERRORLEVEL%

:wait_port
set "WAIT_PORT=%~1"
set "WAIT_SECONDS=%~2"
set "WAIT_NAME=%~3"
set /a WAIT_LOOPS=%WAIT_SECONDS% / 2
for /l %%I in (1,1,%WAIT_LOOPS%) do (
    call :check_port %WAIT_PORT%
    if not errorlevel 1 (
        echo %WAIT_NAME% is ready.
        exit /b 0
    )
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2"
)
echo Timed out waiting for %WAIT_NAME%.
exit /b 1

:wait_http
set "WAIT_URL=%~1"
set "WAIT_SECONDS=%~2"
set "WAIT_NAME=%~3"
set /a WAIT_LOOPS=%WAIT_SECONDS% / 2
for /l %%I in (1,1,%WAIT_LOOPS%) do (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%WAIT_URL%' -TimeoutSec 3; if ($r.StatusCode -ge 200 -and $r.StatusCode -le 499) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
    if not errorlevel 1 (
        echo %WAIT_NAME% is ready.
        exit /b 0
    )
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2"
)
echo Timed out waiting for %WAIT_NAME%.
exit /b 1
