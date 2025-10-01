# Acutis API Architecture

## Overview
The backend API provides persistent services for the Acutis admissions and group-therapy application. It is implemented as an ASP.NET Core 8.0 Web API using Entity Framework Core with a SQL Server provider. The API is designed so that it can run locally against the developer's SQL Server instance, fall back to an in-memory provider for automated tests, and deploy to Azure (App Service or Functions) without code changes.

Key objectives:
- Model residents, group-therapy content, and session notes in a normalized database schema.
- Provide REST endpoints that the React front end can migrate towards.
- Capture auditable changes for compliance.
- Introduce a security layer that supports API keys locally and JWT bearer tokens for production.
- Supply Azure Function entry points that share the same domain services when serverless hosting is required.

## Solution Layout
`
server/
  Acutis.Api/              # ASP.NET Core Web API host
  Acutis.Application/      # Application services, DTOs, validators
  Acutis.Domain/           # Entities, value objects, enums
  Acutis.Infrastructure/   # EF Core DbContext, repositories, audit + security implementations
  Acutis.Functions/        # Azure Functions (isolated worker) surfacing selected endpoints
  Acutis.sln
`

### Project responsibilities
- **Domain**: Pure C# records/classes for Resident, TherapyModule, TherapyTerm, GroupSession, AuditEntry, etc. Contains no EF Core annotations beyond simple attributes to keep persistence concerns separate.
- **Application**: CQRS-style commands/queries (kept light), DTOs, mapping profiles, validation logic (FluentValidation), interfaces for security/audit abstractions.
- **Infrastructure**: Implements AcutisDbContext, data seeding from the existing JSON assets, auditing interceptor, token service, and API key repository. Includes EF Core migrations configured for SQL Server but falls back to UseSqlite or UseInMemoryDatabase when the configured connection string is absent.
- **Api**: Wires ASP.NET Core minimal APIs (or Controllers) that depend on the application layer. Adds authentication/authorization middleware, swagger, and problem details.
- **Functions**: Provides a small façade for Azure Functions (HTTP-triggered endpoints) that call into the application layer. This lets the same codebase power both the Web API and serverless endpoints.

## Entity Model Summary
| Entity | Description | Key Relationships |
| --- | --- | --- |
| Resident | Individual in the care system | GroupSessionParticipant (join)
| TherapyTermRating | Lookup values (Core, Frequent, etc.) | TherapyTerm (one-to-many)
| TherapyTerm | Behavioral observation snippet | TherapyTermRating (many-to-one)
| TherapyModule | Represents curriculum module content | ModuleQuestion, GroupSession
| ModuleQuestion | Either a plain question or a grouped question with parts | TherapyModule
| GroupSession | Captures a therapy session occurrence | TherapyModule, GroupSessionParticipant, SessionNote
| GroupSessionParticipant | Join entity connecting GroupSession and Resident, tracks attendance, speaking status | links to SessionNote
| SessionNote | Free-form notes with structured quick comments | GroupSessionParticipant
| QuickCommentTemplate | Pre-defined comments (e.g., "Excellent insight") | referenced in SessionNoteComment
| SessionNoteComment | Cross-table storing which quick comments were applied in a note | links to QuickCommentTemplate
| AuditEntry | Stores auditable change metadata (entity name, keys, diff JSON, user context) | Created by audit interceptor

The seed data for TherapyTerm and TherapyTermRating comes from src/data/groupTherapyTerms.json and src/data/groupTherapyTermsRatings.json. TherapyModule seed content mirrors the hard-coded front-end module until a CMS is introduced.

## Persistence & EF Core
- AcutisDbContext uses SQL Server via connection string AcutisDatabase. If missing, UseSqlite("Data Source=:memory:") with automatic creation is applied for testing.
- ModelBuilder configuration lives in separate files per aggregate to keep the DbContext lean.
- Automatic auditing is implemented via a custom SaveChangesInterceptor that materializes AuditEntry rows. Entries include timestamp, user identity (from IA currentUserService), correlation ID, and serialized Before/After JSON payloads.
- Soft deletes are supported via IsDeleted flag on core entities, enforced by global query filters.

## Security Layer
- API key authentication handler for service-to-service communication (header X-API-Key). Keys are hashed and stored in the database with scopes.
- JWT bearer auth configured via Microsoft.AspNetCore.Authentication.JwtBearer. Token issuance uses ITokenService which wraps System.IdentityModel.Tokens.Jwt. Secrets are stored in Azure Key Vault in production, environment variables locally.
- Authorization policies: Policies.TherapyWrite, Policies.AdmissionsRead, etc., expressed via constants.
- Rate limiting middleware (ASP.NET Core rate limiting) to protect public endpoints.

## Audit Layer
- IAuditTrail application service for querying audit history (paged).
- AuditEntry entity stored in table Audit.AuditEntries.
- AuditInterceptor inspects tracked entries on SaveChanges, captures property diffs, user metadata, and pushes to the database plus an optional Serilog sink.
- Background service AuditCleanupJob purges audits beyond retention horizon (configurable).

## Azure Functions Integration
- Acutis.Functions uses isolated worker (.NET 8) with dependency injection referencing Acutis.Application & Infrastructure.
- Example HTTP trigger: GetTherapyTerms that returns cached results. Functions project reuses the same EF DbContext (through dependency injection) and respects the security layer by validating API keys/JWT from headers.

## Testing Strategy
- Unit tests for application services using InMemory provider & Bogus data builders (future Acutis.Tests project).
- Integration tests with WebApplicationFactory hitting in-memory database.
- Postman collection (to be added) for manual validation.

## Configuration
- ppsettings.json in Api project:
  - ConnectionStrings:AcutisDatabase
  - Authentication:Jwt:Issuer, Audience, SigningKey
  - Security:ApiKeys (seed entries for development)
  - Audit:RetentionDays
- local.settings.json in Functions project mirrors the same keys for Azure Functions runtime.

## Deployment Notes
- CI builds produce Docker image for API (Dockerfile included). Image deploys to Azure Container Apps or App Service.
- EF Core migrations run via dotnet ef database update or automatically on startup (toggle via config) for dev.
- Azure Functions deployment via unc azure functionapp publish or GitHub Actions workflow.

This architecture keeps the domain-driven pieces clean, enforces auditing/security, and paves the way for a smooth Azure migration.
