Param(
  [string]$Connection,
  [string]$Sex = 'Male',
  [int]$MinAge = 0,
  [int]$MaxAge = 200,
  [string]$Output = 'photos',
  [string]$Env = $env:DOTNET_ENVIRONMENT
)

$argsList = @('download-photos', '--sex', $Sex, '--min-age', $MinAge, '--max-age', $MaxAge, '--output', $Output)
if ($Connection) { $argsList += @('--connection', $Connection) }
if ($Env) { $argsList += @('--env', $Env) }

dotnet run --project "Acutis.Tools" -- %argsList%

