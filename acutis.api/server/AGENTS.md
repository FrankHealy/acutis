# AGENTS

This repository is a .NET solution with a layered structure. Use the existing folder layout when adding or updating code so the architecture stays consistent.

## Solution layout (server root)
- `Acutis.Api/` Web API host (controllers, DI composition, appsettings, auth, CORS).
- `Acutis.Application/` Application layer (DTOs, requests, validators, services, interfaces).
- `Acutis.Domain/` Domain model (entities, value objects, enums, lookups).
- `Acutis.Infrastructure/` Infrastructure layer (EF Core, persistence, mapping, services).
- `Acutis.Functions/` Function facades.
- `Acutis.Tools/` Tools/console utilities.

## DTOs and requests
- **DTOs** go in `Acutis.Application/DTOs`.
- **Request models** go in `Acutis.Application/Requests`.
- Keep DTOs/request models free of EF Core attributes and persistence concerns.

## Validation
- FluentValidation validators live in `Acutis.Application/Validators`.
- Ensure new request models have validators and they are discoverable via assembly scanning.

## Services and interfaces
- Application service interfaces live in `Acutis.Application/Interfaces`.
- Application service implementations live in `Acutis.Application/Services`.
- Infrastructure services that implement application interfaces live in `Acutis.Infrastructure/Services` (or feature folders like `Admissions`).

## Domain model
- Entities in `Acutis.Domain/Entities`.
- Value objects in `Acutis.Domain/ValueObjects`.
- Enums in `Acutis.Domain/Enums`.
- Lookups in `Acutis.Domain/Lookups`.

## EF Core and persistence
- DbContext is `Acutis.Infrastructure/AppDbContext.cs`.
- Migrations live in `Acutis.Infrastructure/Migrations`.
- Persistence configuration lives in `Acutis.Infrastructure/Persistence` and `Acutis.Infrastructure/Mapping`.
- Provider selection is configured in `Acutis.Infrastructure/InfrastructureServiceRegistration.cs` via `DbProvider` and connection strings.

## Logging and configuration
- Logging levels are configured in `Acutis.Api/appsettings.json` under `Logging`.
- Use `ILogger<T>` in controllers/services; avoid `Console.WriteLine` unless debugging.
- Application configuration is in `Acutis.Api/appsettings*.json` and wired up in `Acutis.Api/Program.cs`.

## API layer
- Controllers in `Acutis.Api/Controllers`.
- Authentication helpers in `Acutis.Api/Authentication`.
- Register services via `AddApplication()` and `AddInfrastructure()` in `Acutis.Api/Program.cs`.
