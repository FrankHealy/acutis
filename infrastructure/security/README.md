# Security operations

This area is reserved for explicit, environment-aware security operations. It is separate from application source and from the product-oriented repository relocation.

Credential rotation is deferred operational work. No rotation is implemented or executed as part of the structural refactor.

- `docs/` records procedures, verification, and rollback expectations.
- `environments/` documents environment-specific secret-store integration without containing credentials.
- `scripts/` will contain reviewed operational tooling when rotation is separately authorized.

Real credentials, generated secrets, exported realm data, tokens, and environment-specific secret files must never be committed here.
