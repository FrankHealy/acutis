using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Acutis.Domain.Lookups
{
    public class Country
    {
        public Guid Id { get; private set; } = Guid.NewGuid(); 
        public string CountryCode { get; private set; } = string.Empty; 
        public string Demonym { get; private set; }
        public string CountryName { get; set; }

        public Country(string countryCode, string countryName, string demonym)
     => (CountryCode, CountryName, Demonym) = (countryCode, countryName, demonym);


    }
}
