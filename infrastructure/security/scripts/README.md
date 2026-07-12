# Rotation scripts

Future, separately approved scripts in this directory must:

- rotate Keycloak administrative and client credentials;
- generate or replace NextAuth signing secrets;
- update explicitly selected environment secret stores;
- avoid printing secret values;
- verify login, token validation, refresh, logout, and product API access;
- provide a documented rollback path.

No credential rotation script is implemented or executed during the repository reorganisation.
