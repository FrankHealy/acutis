using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Lookups;
public class Addiction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;

    // Optional legacy category label; keeping for backwards compatibility
    public string? Category { get; private set; }

    // New normalized type link
    public Guid? AddictionTypeId { get; private set; }
    public AddictionType? AddictionType { get; private set; }

    private Addiction() { }
    public Addiction(string name, string? category = null)
    {
        Name = name.Trim();
        Category = category?.Trim();
    }

    public void SetType(Guid typeId) => AddictionTypeId = typeId;
}

