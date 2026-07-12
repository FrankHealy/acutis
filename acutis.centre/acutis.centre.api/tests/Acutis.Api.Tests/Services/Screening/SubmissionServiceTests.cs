using System.Security.Claims;
using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Api.Services.Screening;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Acutis.Api.Tests.Services.Screening;

public sealed class SubmissionServiceTests
{
    [Fact]
    public async Task UpsertProgressAsync_WritesAuditRows_WithActorUser()
    {
        await using var dbContext = CreateDbContext(nameof(UpsertProgressAsync_WritesAuditRows_WithActorUser));
        var residentCase = await SeedResidentCaseAsync(dbContext);
        var actorUserId = Guid.NewGuid();
        var service = CreateService(dbContext, actorUserId, "screening-worker");

        var submission = await service.UpsertProgressAsync(
            new SaveProgressRequest
            {
                FormCode = "admission_alcohol",
                FormVersion = 5,
                Locale = "en-IE",
                SubjectType = "admission",
                SubjectId = residentCase.Id.ToString("D"),
                SubmissionId = null,
                Answers = new Dictionary<string, JsonElement>
                {
                    ["first_name"] = JsonSerializer.SerializeToElement("Aisling"),
                    ["phone_number"] = JsonSerializer.SerializeToElement("0871234567")
                }
            });

        Assert.Equal("in_progress", submission.Status);

        var auditRows = await dbContext.AuditLogs
            .AsNoTracking()
            .OrderBy(x => x.OccurredAt)
            .ToListAsync();

        Assert.Equal(2, auditRows.Count);
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(FormSubmission) &&
            x.EntityId == submission.Id.ToString("D") &&
            x.Action == "Create" &&
            x.ActorUserId == actorUserId &&
            x.ActorRole == "screening-worker");
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(ResidentCase) &&
            x.EntityId == residentCase.Id.ToString("D") &&
            x.Action == "ScreeningProgressCreated" &&
            x.ActorUserId == actorUserId);
    }

    [Fact]
    public async Task SaveRejectedAsync_WritesAuditRows_AndKeepsCaseOpen()
    {
        await using var dbContext = CreateDbContext(nameof(SaveRejectedAsync_WritesAuditRows_AndKeepsCaseOpen));
        var residentCase = await SeedResidentCaseAsync(dbContext);
        var actorUserId = Guid.NewGuid();
        var service = CreateService(dbContext, actorUserId, "screening-manager");

        var submission = await service.SaveRejectedAsync(
            new RejectRequest
            {
                FormCode = "admission_alcohol",
                FormVersion = 5,
                Locale = "en-IE",
                SubjectType = "admission",
                SubjectId = residentCase.Id.ToString("D"),
                SubmissionId = null,
                RejectionReason = "Risk not suitable for admission",
                Answers = new Dictionary<string, JsonElement>
                {
                    ["first_name"] = JsonSerializer.SerializeToElement("Aisling"),
                    ["phone_number"] = JsonSerializer.SerializeToElement("0871234567")
                }
            });

        var refreshedCase = await dbContext.ResidentCases.AsNoTracking().SingleAsync(x => x.Id == residentCase.Id);
        Assert.Equal("submitted", submission.Status);
        Assert.Equal("rejected", refreshedCase.AdmissionDecisionStatus);
        Assert.Equal("Risk not suitable for admission", refreshedCase.AdmissionDecisionReason);
        Assert.Equal("screening_completed", refreshedCase.CaseStatus);
        Assert.Equal("admission_decision", refreshedCase.CasePhase);
        Assert.Null(refreshedCase.ClosedWithoutAdmissionAtUtc);
        Assert.Null(refreshedCase.ClosedAtUtc);

        var auditRows = await dbContext.AuditLogs
            .AsNoTracking()
            .OrderBy(x => x.OccurredAt)
            .ToListAsync();

        Assert.Equal(2, auditRows.Count);
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(FormSubmission) &&
            x.Action == "Reject" &&
            x.ActorUserId == actorUserId &&
            x.Reason == "Risk not suitable for admission");
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(ResidentCase) &&
            x.Action == "AdmissionDecisionRejected" &&
            x.ActorUserId == actorUserId &&
            x.Reason == "Risk not suitable for admission");
    }

    [Fact]
    public async Task SaveSubmittedAsync_WritesSubmitAudit()
    {
        await using var dbContext = CreateDbContext(nameof(SaveSubmittedAsync_WritesSubmitAudit));
        var residentCase = await SeedResidentCaseAsync(dbContext);
        var actorUserId = Guid.NewGuid();
        var service = CreateService(dbContext, actorUserId, "screening-manager");

        var submission = await service.SaveSubmittedAsync(
            new SaveRequest
            {
                FormCode = "admission_alcohol",
                FormVersion = 5,
                Locale = "en-IE",
                SubjectType = "admission",
                SubjectId = residentCase.Id.ToString("D"),
                SubmissionId = null,
                Answers = new Dictionary<string, JsonElement>
                {
                    ["first_name"] = JsonSerializer.SerializeToElement("Aisling"),
                    ["phone_number"] = JsonSerializer.SerializeToElement("0871234567")
                }
            });

        Assert.Equal("submitted", submission.Status);

        var auditRows = await dbContext.AuditLogs.AsNoTracking().ToListAsync();
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(FormSubmission) &&
            x.EntityId == submission.Id.ToString("D") &&
            x.Action == "Submit" &&
            x.ActorUserId == actorUserId);
        Assert.Contains(auditRows, x =>
            x.EntityType == nameof(ResidentCase) &&
            x.EntityId == residentCase.Id.ToString("D") &&
            x.Action == "ScreeningSubmitted" &&
            x.ActorUserId == actorUserId);
    }

    [Fact]
    public async Task SaveSubmittedAsync_RedactsPpsFields_FromAuditTrail()
    {
        await using var dbContext = CreateDbContext(nameof(SaveSubmittedAsync_RedactsPpsFields_FromAuditTrail));
        var residentCase = await SeedResidentCaseAsync(dbContext);
        var service = CreateService(dbContext, Guid.NewGuid(), "screening-manager");

        await service.SaveSubmittedAsync(
            new SaveRequest
            {
                FormCode = "admission_alcohol",
                FormVersion = 5,
                Locale = "en-IE",
                SubjectType = "admission",
                SubjectId = residentCase.Id.ToString("D"),
                SubmissionId = null,
                Answers = new Dictionary<string, JsonElement>
                {
                    ["first_name"] = JsonSerializer.SerializeToElement("Aisling"),
                    ["pps_number"] = JsonSerializer.SerializeToElement("1234567AB"),
                    ["personal_public_service_number"] = JsonSerializer.SerializeToElement("7654321ZX")
                }
            });

        var formAudit = await dbContext.AuditLogs
            .AsNoTracking()
            .SingleAsync(x => x.EntityType == nameof(FormSubmission) && x.Action == "Submit");

        Assert.NotNull(formAudit.AfterJson);
        Assert.DoesNotContain("pps_number", formAudit.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("personal_public_service_number", formAudit.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("1234567AB", formAudit.AfterJson!, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("7654321ZX", formAudit.AfterJson!, StringComparison.OrdinalIgnoreCase);
    }

    private static SubmissionService CreateService(AcutisDbContext dbContext, Guid actorUserId, string role)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = HttpMethods.Post;
        httpContext.Request.Path = "/api/screening/Save";
        httpContext.Request.Headers[RequestCorrelationMiddleware.CorrelationIdHeader] = "submission-service-tests";
        httpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, actorUserId.ToString("D")),
                    new Claim(ClaimTypes.Role, role)
                },
                "TestAuth"));

        var httpContextAccessor = new HttpContextAccessor
        {
            HttpContext = httpContext
        };

        var auditService = new AuditService(dbContext, httpContextAccessor);
        return new SubmissionService(dbContext, auditService);
    }

    private static async Task<ResidentCase> SeedResidentCaseAsync(AcutisDbContext dbContext)
    {
        var residentCase = new ResidentCase
        {
            Id = Guid.NewGuid(),
            CentreId = Guid.NewGuid(),
            UnitId = Guid.NewGuid(),
            CaseStatusLookupValueId = ScreeningLifecycleLookups.CaseStatuses.Referred,
            CasePhaseLookupValueId = ScreeningLifecycleLookups.CasePhases.Intake,
            CaseStatus = "referred",
            CasePhase = "intake",
            OpenedAtUtc = DateTime.UtcNow,
            IntakeSource = "screening_call"
        };

        dbContext.ResidentCases.Add(residentCase);
        await dbContext.SaveChangesAsync();
        return residentCase;
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AcutisDbContext(options);
    }
}
