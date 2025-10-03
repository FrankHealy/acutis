using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Acutis.Domain.Lookups;

namespace Acutis.Domain.Entities;

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
