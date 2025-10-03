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

        public string CountryCode { get; private set; } = string.Empty;
        public string CountryNane { get; private set; } 
        public string Demonym { get; private set; }
        public Country(string countryCode, string countryName, string demonym)
     => (CountryCode, CountryNane, Demonym) = (countryCode, countryName, demonym);


    }
}
