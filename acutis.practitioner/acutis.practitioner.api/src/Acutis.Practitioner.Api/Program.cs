using System.Security.Claims;
using Acutis.Practitioner.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PractitionerDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("Practitioner") ?? throw new InvalidOperationException("ConnectionStrings:Practitioner is required.")));
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(builder.Configuration["WebOrigin"] ?? "http://localhost:3010").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["Identity:Authority"];
    options.Audience = builder.Configuration["Identity:Audience"] ?? "practitioner-api";
    options.RequireHttpsMetadata = builder.Configuration.GetValue("Identity:RequireHttpsMetadata", true);
});
builder.Services.AddAuthorization(options => options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
var app = builder.Build();
app.UseCors(); app.UseAuthentication(); app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { product = "Acutis Practitioner" })).AllowAnonymous();
app.MapGet("/api/access", async (ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct) =>
{
    var subject = user.FindFirstValue("acutis_subject") ?? user.FindFirstValue("preferred_username") ?? user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
    return await db.Memberships.AsNoTracking().Where(x => x.ExternalSubject == subject && x.IsActive)
        .Select(x => new { x.TenantId, x.RolesJson, x.Tenant.OrganisationName, x.Tenant.IsDemo }).ToListAsync(ct);
});
app.MapGet("/api/tenants/{tenantId:guid}/forms", async (Guid tenantId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct) =>
    await HasMembership(db, tenantId, Subject(user), ct)
        ? Results.Ok(await db.FormDefinitions.AsNoTracking().Where(x => x.TenantId == tenantId).OrderBy(x => x.Code).ThenByDescending(x => x.Version).ToListAsync(ct))
        : Results.Forbid());
app.MapPost("/api/tenants/{tenantId:guid}/forms", async (Guid tenantId, FormDefinitionRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct) =>
{
    var subject = Subject(user);
    if (!await HasMembership(db, tenantId, subject, ct)) return Results.Forbid();
    var definition = new PractitionerFormDefinition { Id = Guid.NewGuid(), TenantId = tenantId, Code = request.Code.Trim(), Version = request.Version, SchemaJson = request.SchemaJson, Status = "draft" };
    db.FormDefinitions.Add(definition);
    db.AuditEvents.Add(new PractitionerAuditEvent { Id = Guid.NewGuid(), TenantId = tenantId, ExternalSubject = subject, Action = "Create", EntityType = nameof(PractitionerFormDefinition), EntityId = definition.Id.ToString(), OccurredAtUtc = DateTime.UtcNow });
    await db.SaveChangesAsync(ct);
    return Results.Created($"/api/tenants/{tenantId}/forms/{definition.Id}", definition);
});
app.Run();
static string Subject(ClaimsPrincipal user) => user.FindFirstValue("acutis_subject") ?? user.FindFirstValue("preferred_username") ?? user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
static Task<bool> HasMembership(PractitionerDbContext db, Guid tenantId, string subject, CancellationToken ct) => db.Memberships.AnyAsync(x => x.TenantId == tenantId && x.ExternalSubject == subject && x.IsActive && x.RolesJson.Contains("Practitioner"), ct);
public sealed record FormDefinitionRequest(string Code, int Version, string SchemaJson);
public partial class Program { }
