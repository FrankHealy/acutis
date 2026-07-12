# Environment integrations

Future rotation tooling may integrate with explicitly configured local, test, staging, and production secret stores from this area.

Environment adapters must identify required variables and destinations without containing secret values. They must support verification and rollback and must not silently fall back to development credentials.

No environment adapter is implemented during the repository reorganisation.
