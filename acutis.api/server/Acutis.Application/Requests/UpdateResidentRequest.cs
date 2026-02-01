using System;
using System.Collections.Generic;
using Acutis.Domain.Enums;

namespace Acutis.Application.Requests;

public class UpdateResidentRequest
{
    public string? Alias { get; set; }
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
    public Guid? PrivateMedicalInsuranceProviderId { get; set; }
    public string? PrivateMedicalInsuranceNumber { get; set; }
    public bool? HasMobilityIssue { get; set; }

    public string? PhotoUrl { get; set; }
    public bool? PhotoDeclined { get; set; }
    public string? PhotoDeclinedReason { get; set; }

    public AdmissionPhase? AdmissionPhase { get; set; }
    public bool IsAdmissionFormComplete { get; set; } = false;
    public string? QuestionnairesJson { get; set; }
    public string? PreferredStepDownHouse { get; set; }

    public bool? NeedsReview { get; set; }
    public string? RoomNumber { get; set; }
    public decimal? DepositAmount { get; set; }
}
