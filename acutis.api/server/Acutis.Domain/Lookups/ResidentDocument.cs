using Acutis.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Lookups
{
    internal class ResidentDocument
    {

        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid ResidentId { get; private set; }
        public Resident Resident { get; private set; } = null!;
        public Guid DocumentTypeId { get; private set; }
        public DocumentType DocumentType { get; private set; } = null!;
        public string Url { get; private set; } = string.Empty;

        private ResidentDocument() { }

        public ResidentDocument(Guid residentId, Guid documentTypeId, string url)
        {
            ResidentId = residentId;
            DocumentTypeId = documentTypeId;
            Url = url;
        }
    }
}
