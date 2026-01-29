using System;
using System.Collections.Generic;

namespace Acutis.Application.DTOs;

public class ResidentDto
{
    public Guid Id { get; set; }
    public string? SocialSecurityNumber { get; set; }
    public DateTime DateOfAdmission { get; set; }
    public DateTime? DateOfBirth { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string Surname { get; set; } = string.Empty;
    public string? Alias { get; set; }

    public bool IsPreviousResident { get; set; }
    public string? Sex { get; set; }

    public string Address { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public string? ReligiousAffiliation { get; set; }
    public bool HasProbationRequirement { get; set; }
    public string? ProbationRequirement { get; set; }

    public bool HasMedicalCard { get; set; }
    public string? MedicalCardNumber { get; set; }
    public bool HasPrivateInsurance { get; set; }
    public string? PrivateMedicalInsuranceProvider { get; set; }
    public string? PrivateMedicalInsuranceNumber { get; set; }
    public bool HasMobilityIssue { get; set; }

    public string PrimaryAddiction { get; set; } = string.Empty;
    public List<string> SecondaryAddictions { get; set; } = new();

    public string? PhoneNumber { get; set; }
    public string? EmailAddress { get; set; }

    public string? NextOfKinFirstName { get; set; }
    public string? NextOfKinSecondName { get; set; }
    public string? NextOfKinPhoneNumber { get; set; }

    public string? PhotoUrl { get; set; }
    public string? ArrivalPhotoUrl { get; set; }
    public string? DischargePhotoUrl { get; set; }
    public bool PhotoDeclined { get; set; }
    public string? PhotoDeclinedReason { get; set; }

    public string AdmissionPhase { get; set; } = "Intake";
    public string DataQuality { get; set; } = "Draft";

    public bool IsAdmissionFormComplete { get; set; }
    public DateTime? AdmissionFormCompletedAt { get; set; }
    public string? AdmissionFormCompletedBy { get; set; }

    public string? QuestionnairesJson { get; set; }
    public string PreferredStepDownHouse { get; set; } = "None";

    public bool NeedsReview { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public bool IsCompleted { get; set; }
    public string? CompletedBy { get; set; }
    public DateTime? CompletedAt { get; set; }

    public string? RoomNumber { get; set; }
    public decimal? DepositAmount { get; set; }
    public DateTime? DepositReceivedAt { get; set; }

    public int Age { get; set; }
}
