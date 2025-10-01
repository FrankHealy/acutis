namespace Acutis.Domain.Lookups;


    public class Nationality
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; } = string.Empty;

        private Nationality() { }
        public Nationality(string name) => Name = name;
    }

}
