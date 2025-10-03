using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Entities
{
    public class ResidentPhoto
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid ResidentId { get; private set; }
        public Resident Resident { get; private set; } = null!;
        public string Url { get; private set; } = string.Empty;
        public bool IsPrimary { get; private set; }

        private ResidentPhoto() { }

        public ResidentPhoto(Guid residentId, string url, bool isPrimary = false)
        {
            ResidentId = residentId;
            Url = url;
            IsPrimary = isPrimary;
        }
    }
}
