using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Lookups;
public class ReligiousAffiliation
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    private ReligiousAffiliation() { }
    public ReligiousAffiliation(string name) { Name = name.Trim(); }
}
