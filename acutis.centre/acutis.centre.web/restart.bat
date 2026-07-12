@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Restarts the Acutis API and the Next.js website: stops whatever is
rem listening on their ports, then starts the API first and the website
rem second, each in its own window.

for %%I in ("%~dp0") do set "WEB_DIR=%%~fI"
for %%I in ("%~dp0..") do set "ROOT=%%~fI"
set "API_DIR=%ROOT%\acutis.centre.api"
set "API_EXE=%API_DIR%\src\Acutis.Api\bin\Debug\net8.0\Acutis.Api.exe"
set "API_PORT=5009"
set "WEB_PORT=3000"

echo Stopping existing processes...
call :kill_port %API_PORT% "API"
call :kill_port %WEB_PORT% "Website"

echo.
echo Starting API...
if exist "%API_EXE%" (
    start "Acutis API" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:ASPNETCORE_URLS='http://localhost:%API_PORT%'; $env:ASPNETCORE_ENVIRONMENT='Development'; & '%API_EXE%'"
) else (
    start "Acutis API" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:ASPNETCORE_URLS='http://localhost:%API_PORT%'; $env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --project '%API_DIR%\src\Acutis.Api\Acutis.Api.csproj' --urls 'http://localhost:%API_PORT%'"
)

call :wait_port %API_PORT% 90 "API"

echo.
echo Starting website...
start "Acutis Website" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%WEB_DIR%'; npm run dev"

call :wait_port %WEB_PORT% 60 "Website"

echo.
echo Restart complete.
echo API:     http://localhost:%API_PORT%
echo Website: http://localhost:%WEB_PORT%
exit /b 0

:kill_port
set "KILL_PORT=%~1"
set "KILL_NAME=%~2"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$conns = Get-NetTCPConnection -LocalPort %KILL_PORT% -State Listen -ErrorAction SilentlyContinue; if ($conns) { $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction Stop; Write-Host ('Stopped %KILL_NAME% (PID ' + $_ + ') on port %KILL_PORT%.') } catch {} } } else { Write-Host '%KILL_NAME% was not running on port %KILL_PORT%.' }"
exit /b 0

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
