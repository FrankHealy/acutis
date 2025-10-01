using Acutis.Domain.Lookups;
using Acutis.Domain.Admissions;

namespace Acutis.Domain.Admissions;

public class ResidentSecondaryAddiction
{
    public Guid ResidentId { get; private set; }
    public Resident Resident { get; private set; } = null!;

    public Guid AddictionTypeId { get; private set; }
    public AddictionType AddictionType { get; private set; } = null!;

    private ResidentSecondaryAddiction() { }
    public ResidentSecondaryAddiction(Guid residentId, Guid addictionTypeId)
    {
        ResidentId = residentId;
        AddictionTypeId = addictionTypeId;
    }
}
