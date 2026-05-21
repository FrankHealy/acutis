# Teardown any running Keycloak container named 'keycloak' (best-effort)
$existing = docker ps --format "{{.Names}}" | Where-Object { $_ -match "keycloak" }
if ($existing) {
  Write-Host "Stopping and removing containers matching 'keycloak': $existing"
  foreach ($c in $existing) {
    docker stop $c | Write-Host
    docker rm $c | Write-Host
  }
} else {
  Write-Host "No running keycloak container found."
}

# Remove local volumes named keycloak-data if present (confirm before removing)
$vols = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match "keycloak" }
if ($vols) {
  Write-Host "Found volumes: $vols"
  foreach ($v in $vols) {
    Write-Host "Removing volume $v"
    docker volume rm $v | Write-Host
  }
}
