namespace Acutis.Domain.Entities;

public sealed class FormSubmission
{
    public Guid Id { get; set; }
    public string FormCode { get; set; } = string.Empty;
    public int FormVersion { get; set; }
    public string SubjectType { get; set; } = string.Empty;
    public string? SubjectId { get; set; }
    public Guid StatusLookupValueId { get; set; }
    public string Status { get; set; } = "in_progress";
    public string AnswersJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
