namespace Acutis.Domain.Entities;

public sealed class GroupTherapyResidentRemark
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = null!;
    public string ProgramCode { get; set; } = null!;
    public int ResidentId { get; set; }
    public string ModuleKey { get; set; } = null!;
    public string NoteLinesJson { get; set; } = "[]";
    public string FreeText { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
