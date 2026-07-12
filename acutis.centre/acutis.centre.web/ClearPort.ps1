param(
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 65535)]
    [int]$Port
)

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $listeners) {
    Write-Host "No listening process found on port $Port."
    exit 0
}

$processIds = $listeners |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -and $_ -gt 0 }

foreach ($processId in $processIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

    if (-not $process) {
        Write-Host "Process $processId is no longer running."
        continue
    }

    Write-Host "Stopping process $processId ($($process.ProcessName)) listening on port $Port..."
    Stop-Process -Id $processId -Force
}

Start-Sleep -Milliseconds 300

$remaining = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Warning "Port $Port is still in use."
    exit 1
}

Write-Host "Port $Port is clear."
