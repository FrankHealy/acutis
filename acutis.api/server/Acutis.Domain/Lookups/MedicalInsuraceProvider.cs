namespace Acutis.Domain.Lookups;
public class MedicalInsuranceProvider
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    private MedicalInsuranceProvider() { }
    public MedicalInsuranceProvider(string name) { Name = name.Trim(); }
}
