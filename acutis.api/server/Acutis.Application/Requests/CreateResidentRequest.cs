using System;
using System.Collections.Generic;

namespace Acutis.Application.Requests;

public class CreateResidentRequest
{
    // minimal + optional on first pass
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string? Alias { get; set; }

    public DateTime DateOfAdmission { get; set; } = DateTime.UtcNow;
    public DateTime? DateOfBirth { get; set; }
    public string? SocialSecurityNumber { get; set; }
    public string? Sex { get; set; }

    public Guid CountryId { get; set; }
    public Guid AddressId { get; set; }

    public bool IsPreviousResident { get; set; }

    public Guid PrimaryAddictionId { get; set; }
    public List<Guid> SecondaryAddictionIds { get; set; } = new();

    // Contact
    public string? PhoneNumber { get; set; }
    public string? EmailAddress { get; set; }

    // Next of Kin
    public string? NextOfKinFirstName { get; set; }
    public string? NextOfKinSecondName { get; set; }
    public string? NextOfKinPhoneNumber { get; set; }

    // Legal / Religious
    public Guid? ProbationRequirementId { get; set; }
    public Guid? ReligiousAffiliationId { get; set; }

    // Medical / Insurance
    public bool HasMedicalCard { get; set; }
    public string? MedicalCardNumber { get; set; }
    public bool HasPrivateInsurance { get; set; }
    public Guid? PrivateMedicalInsuranceProviderId { get; set; }
    public string? PrivateMedicalInsuranceNumber { get; set; }
    public bool HasMobilityIssue { get; set; }

    // Photos
    public string? PhotoUrl { get; set; }
    public bool PhotoDeclined { get; set; }
    public string? PhotoDeclinedReason { get; set; }

    // Options
    public bool IsAdmissionFormComplete { get; set; } = false;
    public string? QuestionnairesJson { get; set; }
    public string PreferredStepDownHouse { get; set; } = "None";

    // Operational
    public string? RoomNumber { get; set; }
    public decimal? DepositAmount { get; set; }
}
