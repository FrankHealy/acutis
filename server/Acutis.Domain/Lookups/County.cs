namespace Acutis.Domain.Lookups;

public class County
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;

    public Guid CountryId { get; private set; }
    public Country Country { get; private set; } = null!;

    private County() { }
    public County(string name, Guid countryId)
    {
        Name = name.Trim();
        CountryId = countryId;
    }
}

