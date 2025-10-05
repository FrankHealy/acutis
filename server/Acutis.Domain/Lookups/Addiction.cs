using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Acutis.Domain.Lookups;

public class Addiction
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    // e.g. "Alcohol", "Gambling", "Cocaine", "Prescription Drugs"
    public string Name { get; private set; } = string.Empty;

    // Optional category or group label, e.g. "Substance", "Behavioural"
    public string? Category { get; private set; }

    // Optional description or clinical note
    public string? Description { get; private set; }

    private Addiction() { } // EF Core needs this

    public Addiction(string name, string? category = null, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Addiction name cannot be empty.", nameof(name));

        Name = name.Trim();
        Category = category?.Trim();
        Description = description?.Trim();
    }
}
