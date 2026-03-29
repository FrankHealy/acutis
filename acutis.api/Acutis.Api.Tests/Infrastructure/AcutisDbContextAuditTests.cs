using System.Security.Claims;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Acutis.Api.Tests.Infrastructure;

public sealed class AcutisDbContextAuditTests
{
    [Fact]
    public async Task SaveChangesAsync_AuditsGenericEntityChanges_AndScrubsSensitiveFields()
    {
        var actorUserId = Guid.NewGuid();
        await using var dbContext = CreateDbContext(nameof(SaveChangesAsync_AuditsGenericEntityChanges_AndScrubsSensitiveFields), actorUserId);

        dbContext.AppUsers.Add(new AppUser
        {
            Id = Guid.NewGuid(),
            ExternalSubject = "subject-1",
            UserName = "aisling",
            DisplayName = "Aisling Murphy",
            Email = "aisling@example.com",
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var auditRow = await dbContext.AuditLogs.AsNoTracking().SingleAsync();
        Assert.Equal(actorUserId, auditRow.ActorUserId);
        Assert.Equal(nameof(AppUser), auditRow.EntityType);
        Assert.Equal("Create", auditRow.Action);
        Assert.NotNull(auditRow.AfterJson);
        Assert.DoesNotContain("aisling@example.com", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("[REDACTED]", auditRow.AfterJson!, StringComparison.Ordinal);
    }

    private static AcutisDbContext CreateDbContext(string databaseName, Guid actorUserId)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = HttpMethods.Post;
        httpContext.Request.Path = "/api/configuration/users";
        httpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, actorUserId.ToString("D"))],
                "TestAuth"));

        return new AcutisDbContext(
            options,
            new HttpContextAccessor
            {
                HttpContext = httpContext
            });
    }
}
