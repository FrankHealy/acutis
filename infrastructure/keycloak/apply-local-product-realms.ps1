param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUser = $(if ($env:KEYCLOAK_ADMIN) { $env:KEYCLOAK_ADMIN } else { "admin" }),
    [string]$AdminPassword = $(if ($env:KEYCLOAK_ADMIN_PASSWORD) { $env:KEYCLOAK_ADMIN_PASSWORD } else { "admin" }),
    [string]$DemoPassword = $env:ACUTIS_DEMO_PASSWORD
)
$ErrorActionPreference = "Stop"
$token = (Invoke-RestMethod -Method Post -Uri "$BaseUrl/realms/master/protocol/openid-connect/token" -ContentType "application/x-www-form-urlencoded" -Body @{client_id="admin-cli";username=$AdminUser;password=$AdminPassword;grant_type="password"}).access_token
$headers = @{Authorization="Bearer $token";"Content-Type"="application/json"}
function Get-One($uri) { try { Invoke-RestMethod -Uri $uri -Headers $headers } catch { if ($_.Exception.Response.StatusCode.value__ -eq 404) { return $null }; throw } }
function New-LocalSecret { $bytes=New-Object byte[] 32; $rng=[Security.Cryptography.RandomNumberGenerator]::Create(); try{$rng.GetBytes($bytes)}finally{$rng.Dispose()}; return ([BitConverter]::ToString($bytes)-replace '-','') }
function Ensure-Realm($realm,$displayName) { if (-not (Get-One "$BaseUrl/admin/realms/$realm")) { Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms" -Headers $headers -Body (@{realm=$realm;displayName=$displayName;enabled=$true;registrationAllowed=$false;loginWithEmailAllowed=$true}|ConvertTo-Json) | Out-Null } }
function Ensure-Role($realm,$name) { if (-not (Get-One "$BaseUrl/admin/realms/$realm/roles/$name")) { Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/$realm/roles" -Headers $headers -Body (@{name=$name}|ConvertTo-Json) | Out-Null } }
function Ensure-Client($realm,$clientId,$public,$redirects) {
    $found=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$realm/clients?clientId=$clientId" -Headers $headers)|Select-Object -First 1
    if (-not $found) { Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/$realm/clients" -Headers $headers -Body (@{clientId=$clientId;enabled=$true;protocol="openid-connect";publicClient=$public;standardFlowEnabled=$true;directAccessGrantsEnabled=$false;redirectUris=$redirects;webOrigins=@("+")}|ConvertTo-Json) | Out-Null; $found=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$realm/clients?clientId=$clientId" -Headers $headers)|Select-Object -First 1 }
    elseif ($found.publicClient -ne $public) { $found|Add-Member NoteProperty publicClient $public -Force; $found|Add-Member NoteProperty redirectUris $redirects -Force; Invoke-RestMethod -Method Put -Uri "$BaseUrl/admin/realms/$realm/clients/$($found.id)" -Headers $headers -Body ($found|ConvertTo-Json -Depth 20) | Out-Null; $found=Get-One "$BaseUrl/admin/realms/$realm/clients/$($found.id)" }
    return $found
}
function Ensure-ApiAudience($realm,$clientId,$audience) {
    $client=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$realm/clients?clientId=$clientId" -Headers $headers)|Select-Object -First 1
    $name="$audience-audience"
    $mappers=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$realm/clients/$($client.id)/protocol-mappers/models" -Headers $headers)
    if (-not ($mappers|Where-Object {$_.name -eq $name})) {
        $body=@{name=$name;protocol="openid-connect";protocolMapper="oidc-audience-mapper";consentRequired=$false;config=@{"included.client.audience"=$audience;"id.token.claim"="false";"access.token.claim"="true"}}
        Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/$realm/clients/$($client.id)/protocol-mappers/models" -Headers $headers -Body ($body|ConvertTo-Json -Depth 6) | Out-Null
    }
}
function Ensure-ProductRealm($realm,$display,$webPort,$apiClient,$mobileClient,$scheme,$brokerClientId) {
    Ensure-Realm $realm $display; Ensure-Role $realm "product_access"; Ensure-Role $realm "tenant_member"; Ensure-Role $realm "demo_user"
    Ensure-Client $realm "$realm-web" $false @("http://localhost:$webPort/*") | Out-Null
    Ensure-Client $realm $mobileClient $true @("$scheme`://redirect") | Out-Null
    Ensure-Client $realm $apiClient $false @() | Out-Null
    Ensure-ApiAudience $realm "$realm-web" $apiClient
    Ensure-ApiAudience $realm $mobileClient $apiClient
    $broker=Ensure-Client "acutisrealm" $brokerClientId $false @("$BaseUrl/realms/$realm/broker/acutis-identity/endpoint")
    $secret=(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/acutisrealm/clients/$($broker.id)/client-secret" -Headers $headers).value
    if (-not (Get-One "$BaseUrl/admin/realms/$realm/identity-provider/instances/acutis-identity")) {
        $body=@{alias="acutis-identity";displayName="Acutis";providerId="oidc";enabled=$true;trustEmail=$true;firstBrokerLoginFlowAlias="first broker login";config=@{authorizationUrl="$BaseUrl/realms/acutisrealm/protocol/openid-connect/auth";tokenUrl="$BaseUrl/realms/acutisrealm/protocol/openid-connect/token";userInfoUrl="$BaseUrl/realms/acutisrealm/protocol/openid-connect/userinfo";issuer="$BaseUrl/realms/acutisrealm";clientId=$brokerClientId;clientSecret=$secret;clientAuthMethod="client_secret_post";defaultScope="openid profile email";syncMode="IMPORT"}}
        Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/$realm/identity-provider/instances" -Headers $headers -Body ($body|ConvertTo-Json -Depth 8) | Out-Null
    }
}
Ensure-Role "acutisrealm" "AcutisPlatformDemo"
$allUsers=Invoke-RestMethod -Uri "$BaseUrl/admin/realms/acutisrealm/users?max=100" -Headers $headers
$demoUser=$allUsers|Where-Object {$_.username -eq "frank.demo"}|Select-Object -First 1
if (-not $demoUser) { Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/acutisrealm/users" -Headers $headers -Body (@{username="frank.demo";enabled=$true;emailVerified=$true;firstName="Frank";lastName="Demo";email="frank.demo@example.invalid"}|ConvertTo-Json) | Out-Null; $allUsers=Invoke-RestMethod -Uri "$BaseUrl/admin/realms/acutisrealm/users?max=100" -Headers $headers; $demoUser=$allUsers|Where-Object {$_.username -eq "frank.demo"}|Select-Object -First 1 }
if (-not $demoUser) { throw "Failed to create the local frank.demo identity." }
$demoRole=Get-One "$BaseUrl/admin/realms/acutisrealm/roles/AcutisPlatformDemo"
Invoke-RestMethod -Method Post -Uri "$BaseUrl/admin/realms/acutisrealm/users/$($demoUser.id)/role-mappings/realm" -Headers $headers -Body (ConvertTo-Json -InputObject @($demoRole)) | Out-Null
if (-not $DemoPassword) { $DemoPassword="Demo!$(New-LocalSecret)"; $root=(Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path; $credentialPath=Join-Path $root ".dev-logs\demo-credentials.txt"; "frank.demo=$DemoPassword"|Set-Content $credentialPath }
Invoke-RestMethod -Method Put -Uri "$BaseUrl/admin/realms/acutisrealm/users/$($demoUser.id)/reset-password" -Headers $headers -Body (@{type="password";value=$DemoPassword;temporary=$false}|ConvertTo-Json) | Out-Null
Ensure-Client "acutisrealm" "centre-web" $true @("http://localhost:3000/*") | Out-Null
Ensure-Client "acutisrealm" "centre-mobile" $true @("acutis-tab://redirect","acutis-centre://redirect") | Out-Null
Ensure-Client "acutisrealm" "outreach-web" $false @("http://localhost:3030/*") | Out-Null
Ensure-ProductRealm "acutis-practitioner" "Acutis Practitioner" 3010 "practitioner-api" "practitioner-mobile" "acutis-practitioner" "practitioner-identity-broker"
Ensure-ProductRealm "acutis-community" "Acutis Community" 3020 "community-api" "community-mobile" "acutis-community" "community-identity-broker"
$repoRoot=(Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
foreach($item in @(@{realm="acutis-practitioner";app="acutis.practitioner\acutis.practitioner.web";port=3010},@{realm="acutis-community";app="acutis.community\acutis.community.web";port=3020})) {
    $clientId="$($item.realm)-web"; $client=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$($item.realm)/clients?clientId=$clientId" -Headers $headers)|Select-Object -First 1
    $secret=(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/$($item.realm)/clients/$($client.id)/client-secret" -Headers $headers).value
    @("KEYCLOAK_CLIENT_ID=$clientId","KEYCLOAK_CLIENT_SECRET=$secret","KEYCLOAK_ISSUER=$BaseUrl/realms/$($item.realm)","NEXTAUTH_URL=http://localhost:$($item.port)","NEXTAUTH_SECRET=$(New-LocalSecret)") | Set-Content (Join-Path $repoRoot "$($item.app)\.env.local")
}
$outreach=@(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/acutisrealm/clients?clientId=outreach-web" -Headers $headers)|Select-Object -First 1
$outreachSecret=(Invoke-RestMethod -Uri "$BaseUrl/admin/realms/acutisrealm/clients/$($outreach.id)/client-secret" -Headers $headers).value
@("KEYCLOAK_CLIENT_ID=outreach-web","KEYCLOAK_CLIENT_SECRET=$outreachSecret","KEYCLOAK_ISSUER=$BaseUrl/realms/acutisrealm","NEXTAUTH_URL=http://localhost:3030","NEXTAUTH_SECRET=$(New-LocalSecret)") | Set-Content (Join-Path $repoRoot "acutis.outreach\acutis.outreach.web\.env.local")
Write-Output "Local Acutis product realms, clients, broker identity providers, coarse roles, and the fictional demo identity are configured."
Write-Output "Demo central subject: $($demoUser.id)"
