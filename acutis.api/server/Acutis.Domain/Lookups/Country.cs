using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Acutis.Domain.Lookups;
public class Country
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string CountryCode { get; private set; } = string.Empty;
    public string CountryName { get; private set; } = string.Empty;
    public string? Demonym { get; private set; }
    private Country() { }
    public Country(string code, string name, string? demonym = null)
    { CountryCode = code.Trim(); CountryName = name.Trim(); Demonym = demonym?.Trim(); }
}
