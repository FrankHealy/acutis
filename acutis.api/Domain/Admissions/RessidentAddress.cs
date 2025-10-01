namespace Acutis.Domain.Admissions;

public class ResidentAddress
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid ResidentId { get; private set; }
    public Resident Resident { get; private set; } = null!;

    public string Line1 { get; private set; } = string.Empty;
    public string? Line2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string County { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string Country { get; private set; } = string.Empty;

    public bool IsCurrent { get; private set; }
    public string AddressType { get; private set; } = "Home";

    private ResidentAddress() { }
    public ResidentAddress(Guid residentId, string line1, string city, string county, string postalCode, string country, bool isCurrent, string addressType = "Home")
    {
        ResidentId = residentId;
        Line1 = line1;
        City = city;
        County = county;
        PostalCode = postalCode;
        Country = country;
        IsCurrent = isCurrent;
        AddressType = addressType;
    }
}

