# Acutis identity topology

`acutisrealm` is the Centre identity realm. `acutis-practitioner` and `acutis-community` are independent product realms with their own normal username/password login screens. An OIDC identity provider named **Acutis** is retained for a separately designed convenience SSO flow, but it is hidden from the core product login pages and must not be configured as the default browser-flow redirect. Product realms contain product clients and coarse `product_access`, `tenant_member`, and `demo_user` roles. Fine permissions and tenant memberships remain in product databases.

Apply the repeatable local configuration with:

```powershell
$env:KEYCLOAK_ADMIN_PASSWORD = '<local admin password>'
$env:ACUTIS_DEMO_PASSWORD = '<local fictional demo password>'
.\infrastructure\keycloak\apply-local-product-realms.ps1
```

The script obtains generated broker-client secrets at runtime and writes them only to local Keycloak. Secrets are not stored in the repository. Production is never targeted by this script unless an operator explicitly overrides `-BaseUrl`; production changes require a separate reviewed deployment process.
