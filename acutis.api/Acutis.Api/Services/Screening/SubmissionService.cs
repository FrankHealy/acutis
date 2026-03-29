using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface ISubmissionService
{
    Task<FormSubmission?> FindLatestAsync(
        string formCode,
        int formVersion,
        string subjectType,
        string? subjectId,
        CancellationToken cancellationToken = default);

    Task<FormSubmission> UpsertProgressAsync(
        SaveProgressRequest request,
        CancellationToken cancellationToken = default);

    Task<FormSubmission> SaveSubmittedAsync(
        SaveRequest request,
        CancellationToken cancellationToken = default);

    Task<FormSubmission> SaveRejectedAsync(
        RejectRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class SubmissionService : ISubmissionService
{
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;

    public SubmissionService(AcutisDbContext dbContext, IAuditService auditService)
    {
        _dbContext = dbContext;
        _auditService = auditService;
    }

    public async Task<FormSubmission?> FindLatestAsync(
        string formCode,
        int formVersion,
        string subjectType,
        string? subjectId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.FormSubmissions
            .AsNoTracking()
            .Where(submission =>
                submission.FormCode == formCode &&
                submission.FormVersion == formVersion &&
                submission.SubjectType == subjectType &&
                submission.SubjectId == subjectId)
            .OrderByDescending(submission => submission.UpdatedAt)
            .ThenByDescending(submission => submission.CompletedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormSubmission> UpsertProgressAsync(
        SaveProgressRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        ResidentCaseAuditSnapshot? residentCaseBefore = null;
        ResidentCase? residentCase = null;
        var submission = await ResolveTargetSubmissionAsync(
            request.SubmissionId,
            request.FormCode,
            request.FormVersion,
            request.SubjectType,
            request.SubjectId,
            cancellationToken);
        var submissionBefore = submission is null ? null : CreateFormSubmissionAuditSnapshot(submission);
        var isCreate = submission is null;

        if (submission is null)
        {
            submission = new FormSubmission
            {
                Id = request.SubmissionId ?? Guid.NewGuid(),
                FormCode = request.FormCode,
                FormVersion = request.FormVersion,
                SubjectType = request.SubjectType,
                SubjectId = request.SubjectId,
                Status = "in_progress",
                AnswersJson = JsonSerializer.Serialize(request.Answers),
                CreatedAt = now,
                UpdatedAt = now
            };

            _dbContext.FormSubmissions.Add(submission);
        }
        else
        {
            submission.AnswersJson = JsonSerializer.Serialize(request.Answers);
            submission.UpdatedAt = now;
            submission.Status = "in_progress";
            submission.CompletedAt = null;
        }

        (residentCase, residentCaseBefore) = await LoadResidentCaseAuditContextAsync(
            request.SubjectType,
            request.SubjectId,
            cancellationToken);

        ApplyAdmissionScreeningLifecycleAsync(
            residentCase,
            markCompleted: false,
            now,
            admissionDecisionStatus: null,
            admissionDecisionReason: null);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteSubmissionAuditAsync(
            submission,
            submissionBefore,
            isCreate ? "Create" : "Update",
            null,
            residentCase,
            cancellationToken);
        await WriteResidentCaseAuditIfChangedAsync(
            residentCase,
            residentCaseBefore,
            isCreate ? "ScreeningProgressCreated" : "ScreeningProgressUpdated",
            null,
            cancellationToken);
        return submission;
    }

    public async Task<FormSubmission> SaveSubmittedAsync(
        SaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        ResidentCaseAuditSnapshot? residentCaseBefore = null;
        ResidentCase? residentCase = null;
        var submission = await ResolveTargetSubmissionAsync(
            request.SubmissionId,
            request.FormCode,
            request.FormVersion,
            request.SubjectType,
            request.SubjectId,
            cancellationToken);
        var submissionBefore = submission is null ? null : CreateFormSubmissionAuditSnapshot(submission);

        if (submission is null)
        {
            submission = new FormSubmission
            {
                Id = request.SubmissionId ?? Guid.NewGuid(),
                FormCode = request.FormCode,
                FormVersion = request.FormVersion,
                SubjectType = request.SubjectType,
                SubjectId = request.SubjectId,
                CreatedAt = now
            };
            _dbContext.FormSubmissions.Add(submission);
        }

        submission.AnswersJson = JsonSerializer.Serialize(request.Answers);
        submission.Status = "submitted";
        submission.UpdatedAt = now;
        submission.CompletedAt = now;

        (residentCase, residentCaseBefore) = await LoadResidentCaseAuditContextAsync(
            request.SubjectType,
            request.SubjectId,
            cancellationToken);

        ApplyAdmissionScreeningLifecycleAsync(
            residentCase,
            markCompleted: true,
            now,
            admissionDecisionStatus: "approved",
            admissionDecisionReason: null);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteSubmissionAuditAsync(
            submission,
            submissionBefore,
            "Submit",
            null,
            residentCase,
            cancellationToken);
        await WriteResidentCaseAuditIfChangedAsync(
            residentCase,
            residentCaseBefore,
            "ScreeningSubmitted",
            null,
            cancellationToken);
        return submission;
    }

    public async Task<FormSubmission> SaveRejectedAsync(
        RejectRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        ResidentCaseAuditSnapshot? residentCaseBefore = null;
        ResidentCase? residentCase = null;
        var submission = await ResolveTargetSubmissionAsync(
            request.SubmissionId,
            request.FormCode,
            request.FormVersion,
            request.SubjectType,
            request.SubjectId,
            cancellationToken);
        var submissionBefore = submission is null ? null : CreateFormSubmissionAuditSnapshot(submission);

        if (submission is null)
        {
            submission = new FormSubmission
            {
                Id = request.SubmissionId ?? Guid.NewGuid(),
                FormCode = request.FormCode,
                FormVersion = request.FormVersion,
                SubjectType = request.SubjectType,
                SubjectId = request.SubjectId,
                CreatedAt = now
            };
            _dbContext.FormSubmissions.Add(submission);
        }

        submission.AnswersJson = JsonSerializer.Serialize(request.Answers);
        submission.Status = "submitted";
        submission.UpdatedAt = now;
        submission.CompletedAt = now;

        (residentCase, residentCaseBefore) = await LoadResidentCaseAuditContextAsync(
            request.SubjectType,
            request.SubjectId,
            cancellationToken);

        ApplyAdmissionScreeningLifecycleAsync(
            residentCase,
            markCompleted: true,
            now,
            admissionDecisionStatus: "rejected",
            admissionDecisionReason: request.RejectionReason);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteSubmissionAuditAsync(
            submission,
            submissionBefore,
            "Reject",
            request.RejectionReason,
            residentCase,
            cancellationToken);
        await WriteResidentCaseAuditIfChangedAsync(
            residentCase,
            residentCaseBefore,
            "AdmissionDecisionRejected",
            request.RejectionReason,
            cancellationToken);
        return submission;
    }

    private async Task<FormSubmission?> ResolveTargetSubmissionAsync(
        Guid? submissionId,
        string formCode,
        int formVersion,
        string subjectType,
        string? subjectId,
        CancellationToken cancellationToken)
    {
        if (submissionId.HasValue)
        {
            var byId = await _dbContext.FormSubmissions.FirstOrDefaultAsync(
                submission => submission.Id == submissionId.Value,
                cancellationToken);
            if (byId is not null)
            {
                return byId;
            }
        }

        return await _dbContext.FormSubmissions.FirstOrDefaultAsync(
            submission =>
                submission.FormCode == formCode &&
                submission.FormVersion == formVersion &&
                submission.SubjectType == subjectType &&
                submission.SubjectId == subjectId &&
                submission.Status == "in_progress",
            cancellationToken);
    }

    private static void ApplyAdmissionScreeningLifecycleAsync(
        ResidentCase? residentCase,
        bool markCompleted,
        DateTime now,
        string? admissionDecisionStatus = null,
        string? admissionDecisionReason = null)
    {
        if (residentCase is null)
        {
            return;
        }

        residentCase.LastContactAtUtc = now;

        if (!residentCase.ScreeningStartedAtUtc.HasValue)
        {
            residentCase.ScreeningStartedAtUtc = now;
        }

        if (string.Equals(residentCase.CasePhase, "intake", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(residentCase.CasePhase, "referral", StringComparison.OrdinalIgnoreCase))
        {
            residentCase.CasePhase = markCompleted ? "admission_decision" : "screening";
        }
        else if (markCompleted && string.Equals(residentCase.CasePhase, "screening", StringComparison.OrdinalIgnoreCase))
        {
            residentCase.CasePhase = "admission_decision";
        }

        if (!markCompleted)
        {
            if (string.Equals(residentCase.CaseStatus, "referred", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(residentCase.CaseStatus, "referral_received", StringComparison.OrdinalIgnoreCase))
            {
                residentCase.CaseStatus = "screening_in_progress";
            }

            return;
        }

        residentCase.ScreeningCompletedAtUtc = now;

        if (!string.IsNullOrWhiteSpace(admissionDecisionStatus))
        {
            residentCase.AdmissionDecisionStatus = admissionDecisionStatus.Trim();
            residentCase.AdmissionDecisionReason = string.IsNullOrWhiteSpace(admissionDecisionReason)
                ? null
                : admissionDecisionReason.Trim();
            residentCase.AdmissionDecisionAtUtc = now;

            if (string.Equals(admissionDecisionStatus, "rejected", StringComparison.OrdinalIgnoreCase))
            {
                residentCase.CasePhase = "admission_decision";
            }
        }

        if (string.Equals(residentCase.CaseStatus, "referred", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(residentCase.CaseStatus, "referral_received", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(residentCase.CaseStatus, "screening_in_progress", StringComparison.OrdinalIgnoreCase))
        {
            residentCase.CaseStatus = "screening_completed";
        }
    }

    private async Task<(ResidentCase? residentCase, ResidentCaseAuditSnapshot? snapshot)> LoadResidentCaseAuditContextAsync(
        string subjectType,
        string? subjectId,
        CancellationToken cancellationToken)
    {
        if (!string.Equals(subjectType, "admission", StringComparison.OrdinalIgnoreCase) ||
            !Guid.TryParse(subjectId, out var caseId))
        {
            return (null, null);
        }

        var residentCase = await _dbContext.ResidentCases.FirstOrDefaultAsync(
            entity => entity.Id == caseId,
            cancellationToken);

        return residentCase is null
            ? (null, null)
            : (residentCase, CreateResidentCaseAuditSnapshot(residentCase));
    }

    private async Task WriteSubmissionAuditAsync(
        FormSubmission submission,
        FormSubmissionAuditSnapshot? before,
        string action,
        string? reason,
        ResidentCase? residentCase,
        CancellationToken cancellationToken)
    {
        await _auditService.WriteAsync(
            centreId: residentCase?.CentreId,
            unitId: residentCase?.UnitId,
            entityType: nameof(FormSubmission),
            entityId: submission.Id.ToString("D"),
            action: action,
            before: before,
            after: CreateFormSubmissionAuditSnapshot(submission),
            reason: reason,
            cancellationToken);
    }

    private async Task WriteResidentCaseAuditIfChangedAsync(
        ResidentCase? residentCase,
        ResidentCaseAuditSnapshot? before,
        string action,
        string? reason,
        CancellationToken cancellationToken)
    {
        if (residentCase is null || before is null)
        {
            return;
        }

        var after = CreateResidentCaseAuditSnapshot(residentCase);
        if (JsonSerializer.Serialize(before) == JsonSerializer.Serialize(after))
        {
            return;
        }

        await _auditService.WriteAsync(
            centreId: residentCase.CentreId,
            unitId: residentCase.UnitId,
            entityType: nameof(ResidentCase),
            entityId: residentCase.Id.ToString("D"),
            action: action,
            before: before,
            after: after,
            reason: reason,
            cancellationToken);
    }

    private static FormSubmissionAuditSnapshot CreateFormSubmissionAuditSnapshot(FormSubmission submission) =>
        new()
        {
            Id = submission.Id,
            FormCode = submission.FormCode,
            FormVersion = submission.FormVersion,
            SubjectType = submission.SubjectType,
            SubjectId = submission.SubjectId,
            Status = submission.Status,
            AnswersJson = SanitizeAnswersJsonForAudit(submission.AnswersJson),
            CreatedAt = submission.CreatedAt,
            UpdatedAt = submission.UpdatedAt,
            CompletedAt = submission.CompletedAt
        };

    private static string? SanitizeAnswersJsonForAudit(string? answersJson)
    {
        if (string.IsNullOrWhiteSpace(answersJson))
        {
            return answersJson;
        }

        try
        {
            using var document = JsonDocument.Parse(answersJson);
            var sanitized = SanitizeJsonElement(document.RootElement);
            return JsonSerializer.Serialize(sanitized);
        }
        catch
        {
            return answersJson;
        }
    }

    private static object? SanitizeJsonElement(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Object => SanitizeObject(element),
            JsonValueKind.Array => element.EnumerateArray().Select(SanitizeJsonElement).ToList(),
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out var longValue)
                ? longValue
                : element.TryGetDecimal(out var decimalValue)
                    ? decimalValue
                    : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => element.ToString()
        };
    }

    private static Dictionary<string, object?> SanitizeObject(JsonElement element)
    {
        var result = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var property in element.EnumerateObject())
        {
            if (IsAuditRestrictedField(property.Name))
            {
                continue;
            }

            result[property.Name] = SanitizeJsonElement(property.Value);
        }

        return result;
    }

    private static bool IsAuditRestrictedField(string fieldKey)
    {
        if (string.IsNullOrWhiteSpace(fieldKey))
        {
            return false;
        }

        return fieldKey.Contains("pps", StringComparison.OrdinalIgnoreCase) ||
               fieldKey.Contains("personal_public_service", StringComparison.OrdinalIgnoreCase) ||
               fieldKey.Contains("personalpublicservice", StringComparison.OrdinalIgnoreCase);
    }

    private static ResidentCaseAuditSnapshot CreateResidentCaseAuditSnapshot(ResidentCase residentCase) =>
        new()
        {
            Id = residentCase.Id,
            ResidentId = residentCase.ResidentId,
            CentreId = residentCase.CentreId,
            UnitId = residentCase.UnitId,
            CaseStatus = residentCase.CaseStatus,
            CasePhase = residentCase.CasePhase,
            IntakeSource = residentCase.IntakeSource,
            ScreeningStartedAtUtc = residentCase.ScreeningStartedAtUtc,
            ScreeningCompletedAtUtc = residentCase.ScreeningCompletedAtUtc,
            ReferralReference = residentCase.ReferralReference,
            ReferralCallId = residentCase.ReferralCallId,
            AdmissionDecisionAtUtc = residentCase.AdmissionDecisionAtUtc,
            AdmissionDecisionStatus = residentCase.AdmissionDecisionStatus,
            AdmissionDecisionReason = residentCase.AdmissionDecisionReason,
            ClosedWithoutAdmissionAtUtc = residentCase.ClosedWithoutAdmissionAtUtc,
            LastContactAtUtc = residentCase.LastContactAtUtc,
            ClosedAtUtc = residentCase.ClosedAtUtc
        };

    private sealed class FormSubmissionAuditSnapshot
    {
        public Guid Id { get; init; }
        public string FormCode { get; init; } = string.Empty;
        public int FormVersion { get; init; }
        public string SubjectType { get; init; } = string.Empty;
        public string? SubjectId { get; init; }
        public string Status { get; init; } = string.Empty;
        public string? AnswersJson { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public DateTime? CompletedAt { get; init; }
    }

    private sealed class ResidentCaseAuditSnapshot
    {
        public Guid Id { get; init; }
        public Guid? ResidentId { get; init; }
        public Guid CentreId { get; init; }
        public Guid? UnitId { get; init; }
        public string CaseStatus { get; init; } = string.Empty;
        public string CasePhase { get; init; } = string.Empty;
        public string? IntakeSource { get; init; }
        public string? ReferralReference { get; init; }
        public Guid? ReferralCallId { get; init; }
        public DateTime? ScreeningStartedAtUtc { get; init; }
        public DateTime? ScreeningCompletedAtUtc { get; init; }
        public DateTime? AdmissionDecisionAtUtc { get; init; }
        public string? AdmissionDecisionStatus { get; init; }
        public string? AdmissionDecisionReason { get; init; }
        public DateTime? ClosedWithoutAdmissionAtUtc { get; init; }
        public DateTime? LastContactAtUtc { get; init; }
        public DateTime? ClosedAtUtc { get; init; }
    }
}
