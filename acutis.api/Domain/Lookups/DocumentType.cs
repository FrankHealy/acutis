namespace Acutis.Domain.Lookups;

public class DocumentType
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;

    private DocumentType() { }
    public DocumentType(string name) => Name = name;
}

