using System.Security.Claims;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Acutis.Api.Tests.Services.TherapyScheduling;

public sealed class AuditServiceTests
{
    [Fact]
    public async Task WriteAsync_RedactsSensitiveFieldsAcrossObjects()
    {
        await using var dbContext = CreateDbContext(nameof(WriteAsync_RedactsSensitiveFieldsAcrossObjects));
        var actorUserId = Guid.NewGuid();
        var service = CreateService(dbContext, actorUserId);

        await service.WriteAsync(
            centreId: Guid.NewGuid(),
            unitId: Guid.NewGuid(),
            entityType: "ResidentCase",
            entityId: Guid.NewGuid().ToString("D"),
            action: "Update",
            before: new
            {
                ReferralReference = "BRI-ALC-26-13-001",
                FirstName = "Aisling",
                Surname = "Murphy",
                PhoneNumber = "0871234567",
                Email = "aisling@example.com",
                DateOfBirth = "1991-04-21",
                AddressLine1 = "1 Main Street"
            },
            after: new
            {
                ReferralReference = "BRI-ALC-26-13-001",
                FirstName = "Aisling",
                Surname = "Murphy",
                PhoneNumber = "0871234567",
                Email = "aisling@example.com",
                DateOfBirth = "1991-04-21",
                AddressLine1 = "1 Main Street"
            },
            reason: null);

        var auditRow = await dbContext.AuditLogs.AsNoTracking().SingleAsync();

        Assert.Equal(actorUserId, auditRow.ActorUserId);
        Assert.NotNull(auditRow.AfterJson);
        Assert.Contains("BRI-ALC-26-13-001", auditRow.AfterJson!, StringComparison.Ordinal);
        Assert.DoesNotContain("Aisling", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Murphy", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("0871234567", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("aisling@example.com", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("1991-04-21", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("1 Main Street", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task WriteAsync_RedactsNestedDictionaryPiiAndPps()
    {
        await using var dbContext = CreateDbContext(nameof(WriteAsync_RedactsNestedDictionaryPiiAndPps));
        var service = CreateService(dbContext, Guid.NewGuid());

        await service.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: "FormSubmission",
            entityId: Guid.NewGuid().ToString("D"),
            action: "Submit",
            before: null,
            after: new Dictionary<string, object?>
            {
                ["answers"] = new Dictionary<string, object?>
                {
                    ["pps_number"] = "1234567AB",
                    ["next_of_kin_phone"] = "0869999999",
                    ["referral_reference"] = "BRI-ALC-26-13-001"
                }
            },
            reason: null);

        var auditRow = await dbContext.AuditLogs.AsNoTracking().SingleAsync();

        Assert.NotNull(auditRow.AfterJson);
        Assert.DoesNotContain("1234567AB", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("0869999999", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("BRI-ALC-26-13-001", auditRow.AfterJson!, StringComparison.Ordinal);
    }

    [Fact]
    public async Task WriteAsync_RedactsFreeTextFieldsEntirely()
    {
        await using var dbContext = CreateDbContext(nameof(WriteAsync_RedactsFreeTextFieldsEntirely));
        var service = CreateService(dbContext, Guid.NewGuid());

        await service.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: "Incident",
            entityId: Guid.NewGuid().ToString("D"),
            action: "Create",
            before: null,
            after: new
            {
                Notes = "Aisling Murphy called from 0871234567 about follow-up.",
                FreeText = "Email aisling@example.com after review.",
                Reason = "Discussed PPS 1234567AB with family member.",
                ReferralReference = "BRI-ALC-26-13-001"
            },
            reason: null);

        var auditRow = await dbContext.AuditLogs.AsNoTracking().SingleAsync();

        Assert.NotNull(auditRow.AfterJson);
        Assert.Contains("BRI-ALC-26-13-001", auditRow.AfterJson!, StringComparison.Ordinal);
        Assert.DoesNotContain("Aisling", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("0871234567", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("aisling@example.com", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("1234567AB", auditRow.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("[REDACTED]", auditRow.AfterJson!, StringComparison.Ordinal);
    }

    private static AuditService CreateService(AcutisDbContext dbContext, Guid actorUserId)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = HttpMethods.Post;
        httpContext.Request.Path = "/api/test/audit";
        httpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, actorUserId.ToString("D"))],
                "TestAuth"));

        return new AuditService(
            dbContext,
            new HttpContextAccessor
            {
                HttpContext = httpContext
            });
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AcutisDbContext(options);
    }
}
