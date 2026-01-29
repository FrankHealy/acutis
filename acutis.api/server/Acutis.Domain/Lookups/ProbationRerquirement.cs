namespace Acutis.Domain.Lookups;
public class ProbationRequirement
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Requirement { get; private set; } = string.Empty; // e.g., "Curfew", "Weekly Check-in"
    private ProbationRequirement() { }
    public ProbationRequirement(string requirement) { Requirement = requirement.Trim(); }
}
