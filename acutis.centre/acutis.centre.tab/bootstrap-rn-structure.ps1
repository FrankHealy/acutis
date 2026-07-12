$Root = [System.IO.Path]::GetFullPath($Root)

if ($Root -match '^[A-Za-z]:\\Windows\\System32\\?$') {
    throw "Refusing to run in C:\Windows\System32."
}

$hasGit = [System.IO.Directory]::Exists((Join-Path $Root ".git"))
$hasAgents = [System.IO.File]::Exists((Join-Path $Root "AGENTS.md"))

if (-not ($hasGit -or $hasAgents)) {
    throw "Refusing to run: target root does not look like repo root: $Root"
}
param(
    [string]$Root = $PSScriptRoot
)

if ([string]::IsNullOrWhiteSpace($Root)) {
    throw "Could not determine script root. Pass -Root explicitly."
}

$Root = [System.IO.Path]::GetFullPath($Root)

if ($Root -match '^[A-Za-z]:\\Windows\\System32\\?$') {
    throw "Refusing to run in C:\Windows\System32. Move the script into acutis.tab or pass -Root C:\acutis\acutis.tab"
}

Write-Host "Bootstrapping React Native structure in $Root"

function Ensure-Dir {
    param([string]$Path)

    if (-not [System.IO.Directory]::Exists($Path)) {
        [System.IO.Directory]::CreateDirectory($Path) | Out-Null
    }
}

function Ensure-File {
    param(
        [string]$Path,
        [string]$Content = ""
    )

    $dir = [System.IO.Path]::GetDirectoryName($Path)
    if ($dir) {
        Ensure-Dir $dir
    }

    if (-not [System.IO.File]::Exists($Path)) {
        [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
    }
}

$app = Join-Path $Root "app"

$dirs = @(
    "$app\(auth)",
    "$app\(tabs)",
    "$app\(tabs)\residents",
    "$app\(tabs)\admissions",
    "$app\(tabs)\admissions\[episodeId]",
    "$app\(tabs)\admissions\[episodeId]\sections",
    "$app\(tabs)\roll-call",
    "$app\(tabs)\roll-call\session",
    "$app\(tabs)\therapy",
    "$app\(tabs)\therapy\[sessionId]",
    "$app\(tabs)\incidents",
    "$app\(tabs)\observations",
    "$app\(tabs)\maps",
    "$app\(tabs)\sync",
    "$app\modal"
)

foreach ($dir in $dirs) {
    Ensure-Dir $dir
}

Ensure-File "$app\_layout.tsx" 'export default function Layout() { return null; }'
Ensure-File "$app\index.tsx" 'export default function Index() { return null; }'

Ensure-File "$app\(auth)\login.tsx"
Ensure-File "$app\(auth)\select-unit.tsx"

Ensure-File "$app\(tabs)\_layout.tsx"
Ensure-File "$app\(tabs)\dashboard.tsx"

Ensure-File "$app\(tabs)\residents\index.tsx"
Ensure-File "$app\(tabs)\residents\[residentId].tsx"

Ensure-File "$app\(tabs)\admissions\index.tsx"
Ensure-File "$app\(tabs)\admissions\[episodeId].tsx"
Ensure-File "$app\(tabs)\admissions\[episodeId]\sections\[sectionKey].tsx"
Ensure-File "$app\(tabs)\admissions\[episodeId]\signature.tsx"
Ensure-File "$app\(tabs)\admissions\[episodeId]\review.tsx"

Ensure-File "$app\(tabs)\roll-call\index.tsx"
Ensure-File "$app\(tabs)\roll-call\[unitId].tsx"
Ensure-File "$app\(tabs)\roll-call\session\[sessionId].tsx"

Ensure-File "$app\(tabs)\therapy\index.tsx"
Ensure-File "$app\(tabs)\therapy\today.tsx"
Ensure-File "$app\(tabs)\therapy\[sessionId].tsx"
Ensure-File "$app\(tabs)\therapy\[sessionId]\attendance.tsx"
Ensure-File "$app\(tabs)\therapy\[sessionId]\notes.tsx"

Ensure-File "$app\(tabs)\incidents\index.tsx"
Ensure-File "$app\(tabs)\incidents\create.tsx"
Ensure-File "$app\(tabs)\incidents\[incidentId].tsx"

Ensure-File "$app\(tabs)\observations\index.tsx"
Ensure-File "$app\(tabs)\observations\create.tsx"
Ensure-File "$app\(tabs)\observations\[submissionId].tsx"

Ensure-File "$app\(tabs)\maps\index.tsx"
Ensure-File "$app\(tabs)\maps\[unitId].tsx"

Ensure-File "$app\(tabs)\sync\index.tsx"

Ensure-File "$app\modal\resident-search.tsx"
Ensure-File "$app\modal\capture-signature.tsx"
Ensure-File "$app\modal\mark-attendance.tsx"
Ensure-File "$app\modal\move-resident.tsx"

$src = Join-Path $Root "src"

$srcDirs = @(
    "features\admissions",
    "features\rollCall",
    "features\therapySessions",
    "features\residents",
    "features\incidents",
    "features\observations",
    "features\maps",
    "features\auth",
    "features\sync",

    "components\admissions",
    "components\roll-call",
    "components\therapy",
    "components\residents",
    "components\maps",
    "components\signatures",
    "components\sync",
    "components\ui",

    "db\migrations",
    "db\repositories",

    "services\api",
    "services\storage",
    "services\signatures",
    "services\network",
    "services\telemetry",

    "domain\admissions",
    "domain\attendance",
    "domain\therapy",
    "domain\residents",
    "domain\incidents",
    "domain\common",

    "state\session",
    "state\connectivity",
    "state\permissions",
    "state\app-bootstrap",

    "hooks",
    "utils",
    "constants",
    "theme",
    "types",

    "i18n\en"
)

foreach ($d in $srcDirs) {
    Ensure-Dir (Join-Path $src $d)
}

Ensure-File "$src\db\connection.ts" "// Encrypted SQLite connection seam"
Ensure-File "$src\db\schema.ts" "// Define tables"
Ensure-File "$src\services\api\client.ts" "// API client"
Ensure-File "$src\services\storage\secure-store.ts" "// Secure token storage"
Ensure-File "$src\theme\tokens.ts" "// Shared theme tokens"
Ensure-File "$src\i18n\index.ts" "// i18n loader"
Ensure-File "$src\i18n\en\common.ts" "export default {};"

Ensure-Dir "$Root\assets"
Ensure-Dir "$Root\assets\icons"
Ensure-Dir "$Root\assets\maps"
Ensure-Dir "$Root\assets\fonts"

Ensure-File "$Root\app.json" "{}"

Write-Host "RN structure created inside $Root"