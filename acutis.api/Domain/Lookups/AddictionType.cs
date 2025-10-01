namespace Acutis.Domain.Lookups
{
    public class AddictionType
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; } = string.Empty;

        private AddictionType() { }
        public AddictionType(string name) => Name = name;
    }
}
