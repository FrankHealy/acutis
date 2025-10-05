using Acutis.Domain.Lookups;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Entities
{
    public class Address
    {
        public Guid Id { get; private set; } = Guid.NewGuid();

        public string Line1 { get; private set; } = string.Empty;
        public string? Line2 { get; private set; }
        public string City { get; private set; } = string.Empty;
        public string County { get; private set; } = string.Empty;
        public string PostCode { get; private set; } = string.Empty;

        public Guid CountryId { get; private set; }
        public Country Country { get; private set; } = null!;

        private Address() { }

        public Address(string line1, string? line2, string city, string county, string postCode, Guid countryId)
        {
            Line1 = line1;
            Line2 = line2;
            City = city;
            County = county;
            PostCode = postCode;
            CountryId = countryId;
        }
    }
}
