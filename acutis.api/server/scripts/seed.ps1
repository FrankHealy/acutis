Param(
  [string]$Connection,
  [string]$Env = $env:DOTNET_ENVIRONMENT
)

$argsList = @('seed-db')
if ($Connection) { $argsList += @('--connection', $Connection) }
if ($Env) { $argsList += @('--env', $Env) }

dotnet run --project "Acutis.Tools" -- %argsList%

