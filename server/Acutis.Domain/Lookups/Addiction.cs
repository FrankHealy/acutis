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
    public string? Category { get; private set; }
    private Addiction() { } //QQQ Make sure to re consider this
    public Addiction(string name, string? category = null) { Name = name.Trim(); Category = category?.Trim(); }
}

