using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Application.Requests
{

    public class CreateResidentRequest
    {
        public string SocialSecurityNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public DateTime DateOfAdmission { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string Surname { get; set; } = string.Empty;
        public bool IsPreviousResident { get; set; }

        public Guid PrimaryAddictionId { get; set; }
        public List<Guid> SecondaryAddictionIds { get; set; } = new();

        public Guid CountryId { get; set; }
        public Guid AddressId { get; set; }
        public Guid? ProbationRequirementId { get; set; }

        public string NextOfKinFirstName { get; set; } = string.Empty;
        public string? NextOfKinSecondName { get; set; }
        public string NextOfKinPhoneNumber { get; set; } = string.Empty;

        public bool HasMedicalCard { get; set; }
        public string? MedicalCardNumber { get; set; }
        public bool HasPrivateInsurance { get; set; }
        public string? PrivateMedicalInsuranceNumber { get; set; }
        public bool HasMobilityIssue { get; set; }
    }
}
