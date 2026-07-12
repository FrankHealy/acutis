param(
    [switch]$NoNewWindow
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $repoRoot "acutis.centre\acutis.centre.api"
$webDir = Join-Path $repoRoot "acutis.centre\acutis.centre.web"
$apiProjectPath = Join-Path $apiDir "src\Acutis.Api\Acutis.Api.csproj"
$apiExeDir = Join-Path $apiDir "src\Acutis.Api\bin\Debug\net8.0"
$apiExePath = Join-Path $apiExeDir "Acutis.Api.exe"
$codeSigningSubject = "CN=Acutis Local Dev Code Signing"

if (-not (Test-Path $apiDir)) {
    throw "API directory not found: $apiDir"
}

if (-not (Test-Path $webDir)) {
    throw "Web directory not found: $webDir"
}

$webCmd = "npm run dev"

function Ensure-LocalCodeSigningCertificate {
    $cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert |
        Where-Object { $_.Subject -eq $codeSigningSubject } |
        Sort-Object NotAfter -Descending |
        Select-Object -First 1

    if (-not $cert) {
        $cert = New-SelfSignedCertificate `
            -Type CodeSigningCert `
            -Subject $codeSigningSubject `
            -CertStoreLocation Cert:\CurrentUser\My `
            -KeyUsage DigitalSignature `
            -KeyExportPolicy Exportable `
            -NotAfter (Get-Date).AddYears(5)
    }

    foreach ($storeName in @("Root", "TrustedPublisher")) {
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, "CurrentUser")
        $store.Open("ReadWrite")
        try {
            if (-not ($store.Certificates | Where-Object { $_.Thumbprint -eq $cert.Thumbprint })) {
                $store.Add($cert)
            }
        }
        finally {
            $store.Close()
        }
    }

    return $cert
}

function Sign-ApiDebugOutput {
    param(
        [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate
    )

    Get-ChildItem $apiExeDir -Include "Acutis*.dll", "Acutis*.exe" -File -Recurse |
        ForEach-Object {
            $signature = Get-AuthenticodeSignature $_.FullName
            if ($signature.Status -ne "Valid") {
                Set-AuthenticodeSignature -FilePath $_.FullName -Certificate $Certificate | Out-Null
            }
        }
}

Write-Host "Building API ..."
dotnet build $apiProjectPath

Write-Host "Signing local API debug output for Windows Smart App Control ..."
$codeSigningCert = Ensure-LocalCodeSigningCertificate
Sign-ApiDebugOutput -Certificate $codeSigningCert

if (-not (Test-Path $apiExePath)) {
    throw "API executable was not produced: $apiExePath"
}

$apiCmd = "`$env:ASPNETCORE_URLS='http://localhost:5009'; `$env:ASPNETCORE_ENVIRONMENT='Development'; & '$apiExePath'"

Write-Host "Starting API from $apiDir ..."
if ($NoNewWindow) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiExeDir
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd -WorkingDirectory $apiExeDir -WindowStyle Normal
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
Write-Host "- API: signed built executable (http://localhost:5009)"
Write-Host "- UI : npm run dev (acutis.centre/acutis.centre.web)"
Write-Host ""
Write-Host "Default URLs:"
Write-Host "- API: http://localhost:5009"
Write-Host "- UI : http://localhost:3000"
