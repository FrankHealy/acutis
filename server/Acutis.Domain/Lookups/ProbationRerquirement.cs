namespace Acutis.Domain.Lookups;

public class ProbationRequirement
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Requirement { get; private set; } = string.Empty; // e.g. "Mandatory Drug Testing"
    public string? Description { get; private set; }

    private ProbationRequirement() { }

    public ProbationRequirement(string requirement, string? description = null)
    {
        Requirement = requirement;
        Description = description;
    }
}
