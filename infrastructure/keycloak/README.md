# Acutis identity topology

`acutisrealm` is the central human-identity realm. Centre uses it directly. `acutis-practitioner` and `acutis-community` are product realms with an OIDC identity provider named **Acutis** that brokers the central realm. Their browser flows redirect to that provider automatically, so human credentials are entered only in `acutisrealm`; the product-realm password forms are not normal sign-in surfaces. Product realms contain product clients and coarse `product_access`, `tenant_member`, and `demo_user` roles. Fine permissions and tenant memberships remain in product databases.

Apply the repeatable local configuration with:

```powershell
$env:KEYCLOAK_ADMIN_PASSWORD = '<local admin password>'
$env:ACUTIS_DEMO_PASSWORD = '<local fictional demo password>'
.\infrastructure\keycloak\apply-local-product-realms.ps1
```

The script obtains generated broker-client secrets at runtime and writes them only to local Keycloak. Secrets are not stored in the repository. Production is never targeted by this script unless an operator explicitly overrides `-BaseUrl`; production changes require a separate reviewed deployment process.
