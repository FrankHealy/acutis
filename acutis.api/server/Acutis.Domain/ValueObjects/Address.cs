using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Acutis.Domain.Lookups;

namespace Acutis.Domain.ValueObjects;
public class Address
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Line1 { get; private set; } = string.Empty;
    public string? Line2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public Guid CountyId { get; private set; }
    public County County { get; private set; } = null!;
    public string PostCode { get; private set; } = string.Empty;
    public Guid CountryId { get; private set; }
    public Country Country { get; private set; } = null!;
    private Address() { }
    public Address(string line1, string? line2, string city, Guid countyId, string postCode, Guid countryId)
    {
        Line1 = line1.Trim(); Line2 = line2?.Trim(); City = city.Trim(); PostCode = postCode.Trim();
        CountyId = countyId; CountryId = countryId;
    }
}
