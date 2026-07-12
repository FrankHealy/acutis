# Exposed development secrets rotation

Literal development credentials were previously tracked in `fix-acutis-dev.sh`. Removing those literals from the current branch does not remove them from prior Git history. This repository reorganisation does not rewrite history.

Treat the following credentials as compromised:

- the Keycloak client credential now supplied through `AUTH_KEYCLOAK_SECRET`;
- the NextAuth signing credential now supplied through `NEXTAUTH_SECRET`.

The script does not contain a Keycloak administrative password. If an administrative credential was shared with either exposed value outside the repository, rotate it separately.

## Rotation checklist

1. Identify every local, test, staging, or deployed environment that used the exposed credentials.
2. Generate a new secret for the affected Keycloak client in the owning Keycloak realm.
3. Replace the Keycloak client credential in the relevant local environment files, deployment secret stores, Docker or Compose variables, and application settings.
4. Generate a new high-entropy NextAuth signing credential independently of the Keycloak credential.
5. Replace `NEXTAUTH_SECRET` in every consuming environment and secret store.
6. Confirm that real environment files remain untracked and that examples contain names or unmistakable placeholders only.
7. Restart affected web applications and services after updating their secret sources.
8. Invalidate existing NextAuth sessions. Revoke or expire affected Keycloak sessions and refresh tokens where appropriate.

## Verification

After rotation, verify each affected environment:

- login completes through the expected Keycloak realm and client;
- issued tokens validate against the expected issuer and audience;
- refresh-token renewal succeeds;
- logout invalidates the application session and completes the expected identity-provider flow;
- Centre, Community, Practitioner, and Outreach API access remains isolated by product;
- Community and Practitioner tenant membership checks still succeed only for authorized users;
- web and tablet or mobile redirect URIs continue to use their existing registered identifiers;
- service credentials, where applicable, authenticate only to their intended clients and audiences.

Do not place replacement values in this document, tracked environment files, shell scripts, or command examples.
