Param(
  [string]$Connection,
  [int]$Count = 25,
  [string]$Sex = 'Male',
  [int]$MinAge = 20,
  [int]$MaxAge = 40,
  [string]$Env = $env:DOTNET_ENVIRONMENT
)

$argsList = @('seed-residents', '--count', $Count, '--sex', $Sex, '--min-age', $MinAge, '--max-age', $MaxAge)
if ($Connection) { $argsList += @('--connection', $Connection) }
if ($Env) { $argsList += @('--env', $Env) }

dotnet run --project "Acutis.Tools" -- %argsList%

