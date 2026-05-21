This folder contains files to deploy a fresh Keycloak instance for the `acutisrealm` realm.

Steps (backup existing Keycloak first):

1. Export existing realm (recommended):

 - Using the admin console: Admin Console -> Realm settings -> "Export" (choose full export).
 - Or (if running in Docker):
   ```powershell
   docker ps
   # find the container id/name for the current keycloak
   docker exec -it <keycloak-container> /opt/keycloak/bin/kc.sh export --dir /opt/keycloak/data/realm-export
   docker cp <keycloak-container>:/opt/keycloak/data/realm-export .\keycloak-backup
   ```

2. Stop and remove the current Keycloak container and volumes (if you want complete teardown):

```powershell
docker ps -a
docker stop <keycloak-container>
docker rm <keycloak-container>
# remove volumes if you created persistent storage
docker volume ls
docker volume rm <volume-name>
```

3. Start the new Keycloak (this folder uses `acutisrealm.json`):

```powershell
cd deploy\keycloak
docker compose up -d
```

The container will expose Keycloak at `http://localhost:8080`. Admin UI credentials are `admin` / `admin` (from the compose file). Change these in production.

4. Update API configuration (.env or environment variables):

Create a `.env` file in `acutis.api` (or set env vars):

```
ASPNETCORE_URLS=http://localhost:5009
ASPNETCORE_ENVIRONMENT=Development
Jwt__Issuer=http://localhost:8080/realms/acutisrealm
Jwt__Authority=http://localhost:8080/realms/acutisrealm
Jwt__Audience=api-client
Authorization__Disabled=false
```

5. Restart API with the new settings.

Notes:
- The provided `acutisrealm.json` is a minimal realm suitable for initial testing. Modify it to add users, roles, and mappers as required.
- If you need me to customize clients (roles, protocol mappers, service accounts), tell me the desired claims and I will update the realm JSON.
