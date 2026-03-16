namespace Acutis.Api.Contracts;

public sealed class IncidentTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
}

public sealed class IncidentDto
{
    public Guid Id { get; set; }
    public int IncidentTypeId { get; set; }
    public string IncidentTypeCode { get; set; } = string.Empty;
    public string IncidentTypeName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public Guid? ResidentId { get; set; }
    public string? ResidentName { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string DetailsJson { get; set; } = "{}";
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public sealed class CreateIncidentRequest
{
    public int IncidentTypeId { get; set; }
    public string Scope { get; set; } = "unit";
    public Guid? ResidentId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? DetailsJson { get; set; }
}
