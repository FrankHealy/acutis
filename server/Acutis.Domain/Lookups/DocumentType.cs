using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Lookups
{
    internal class DocumentType
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; } = string.Empty;

        private DocumentType() { }

        public DocumentType(string name) => Name = name;
    }
}
