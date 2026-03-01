using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface ISubmissionService
{
    Task<FormSubmission?> FindInProgressAsync(
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
}

public sealed class SubmissionService : ISubmissionService
{
    private readonly AcutisDbContext _dbContext;

    public SubmissionService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<FormSubmission?> FindInProgressAsync(
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
                submission.SubjectId == subjectId &&
                submission.Status == "in_progress")
            .OrderByDescending(submission => submission.UpdatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormSubmission> UpsertProgressAsync(
        SaveProgressRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var submission = await ResolveTargetSubmissionAsync(
            request.SubmissionId,
            request.FormCode,
            request.FormVersion,
            request.SubjectType,
            request.SubjectId,
            cancellationToken);

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

        await _dbContext.SaveChangesAsync(cancellationToken);
        return submission;
    }

    public async Task<FormSubmission> SaveSubmittedAsync(
        SaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var submission = await ResolveTargetSubmissionAsync(
            request.SubmissionId,
            request.FormCode,
            request.FormVersion,
            request.SubjectType,
            request.SubjectId,
            cancellationToken);

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

        await _dbContext.SaveChangesAsync(cancellationToken);
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
}
