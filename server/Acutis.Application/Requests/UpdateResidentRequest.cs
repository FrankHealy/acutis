using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Acutis.Application.Requests;

public class UpdateResidentRequest
{
    public string? PhoneNumber { get; set; }
    public string? EmailAddress { get; set; }

    public Guid? AddressId { get; set; }
    public Guid? ProbationRequirementId { get; set; }

    public List<Guid>? SecondaryAddictionIds { get; set; }

    public string? NextOfKinFirstName { get; set; }
    public string? NextOfKinSecondName { get; set; }
    public string? NextOfKinPhoneNumber { get; set; }

    public bool? HasMedicalCard { get; set; }
    public string? MedicalCardNumber { get; set; }

    public bool? HasPrivateInsurance { get; set; }
    public string? PrivateMedicalInsuranceNumber { get; set; }

    public bool? HasMobilityIssue { get; set; }
}
