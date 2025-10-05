using System;
using System.Linq;
using System.Collections.Generic;
using Acutis.Application.DTOs;
using Acutis.Application.Requests;
using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Domain.Enums;
using Acutis.Domain.ValueObjects;

namespace Acutis.Infrastructure.Mapping;

/// <summary>
/// Maps Resident domain entities to and from DTOs.
/// </summary>
internal static partial class DtoMapper
{
    // ---------------------------
    // ENTITY → DTO
    // ---------------------------
    public static ResidentDto ToResidentDto(Resident r)
    {
        return new ResidentDto
        {
            Id = r.Id,
            SocialSecurityNumber = r.SocialSecurityNumber,
            DateOfAdmission = r.DateOfAdmission,
            FirstName = r.FirstName,
            MiddleName = r.MiddleName,
            Surname = r.Surname,
            Alias = r.Alias,
            IsPreviousResident = r.IsPreviousResident,
            Address = r.Address is null ? string.Empty :
                $"{r.Address.Line1}, {r.Address.City}, {r.Address.County}, {r.Address.PostCode}, {r.Address.Country?.CountryName}",
            PhoneNumber = r.PhoneNumber,
            EmailAddress = r.EmailAddress,
            Sex = r.Sex,
            Country = r.Country?.CountryName ?? string.Empty,
            ReligiousAffiliation = r.ReligiousAffiliation?.Name ?? string.Empty,
            HasProbationRequirement = r.HasProbationRequirement,
            ProbationRequirement = r.ProbationRequirement?.Requirement ?? string.Empty,
            NextOfKinFirstName = r.NextOfKinFirstName,
            NextOfKinSecondName = r.NextOfKinSecondName,
            NextOfKinPhoneNumber = r.NextOfKinPhoneNumber,
            HasMedicalCard = r.HasMedicalCard,
            MedicalCardNumber = r.MedicalCardNumber,
            HasPrivateInsurance = r.HasPrivateInsurance,
            PrivateMedicalInsuranceProvider = r.PrivateMedicalInsuranceProvider?.Name ?? string.Empty,
            PrivateMedicalInsuranceNumber = r.PrivateMedicalInsuranceNumber,
            HasMobilityIssue = r.HasMobilityIssue,
            PrimaryAddiction = r.PrimaryAddiction?.Name ?? string.Empty,
            SecondaryAddictions = r.SecondaryAddictions?.Select(a => a.Name).ToList() ?? new(),
            Age = r.CalculateAge(),
            PhotoUrl = r.PhotoUrl,
            AdmissionPhase = r.AdmissionPhase.ToString(),
            CompletedBy = r.CompletedBy,
            CompletedAt = r.CompletedAt,
            IsCompleted = r.IsCompleted
        };
    }

    // ---------------------------
    // CREATE REQUEST → ENTITY
    // ---------------------------
    public static Resident ToResidentEntity(
        CreateResidentRequest request,
        Country country,
        Address address,
        ProbationRequirement? probationRequirement,
        Addiction primaryAddiction,
        List<Addiction> secondaryAddictions)
    {
        var resident = new Resident(
            request.SocialSecurityNumber,
            request.DateOfBirth,
            request.DateOfAdmission,
            request.FirstName,
            request.MiddleName,
            request.Surname,
            request.IsPreviousResident,
            primaryAddiction.Id,
            country.Id
        );

        resident.UpdateAlias(request.Alias);
        resident.UpdateAddress(address.Id);
        resident.UpdatePhoto(request.PhotoUrl);

        if (probationRequirement != null)
            resident.AssignProbationRequirement(probationRequirement.Id);

        if (secondaryAddictions.Any())
            resident.UpdateSecondaryAddictions(secondaryAddictions.Select(a => a.Id).ToList());

        resident.UpdateContact(request.PhoneNumber, request.EmailAddress);
        resident.UpdateNextOfKin(request.NextOfKinFirstName, request.NextOfKinSecondName, request.NextOfKinPhoneNumber);

        resident.UpdateMedicalInfo(
            request.HasMedicalCard,
            request.MedicalCardNumber,
            request.HasPrivateInsurance,
            request.PrivateMedicalInsuranceProviderId,
            request.PrivateMedicalInsuranceNumber,
            request.HasMobilityIssue
        );

        resident.AdvancePhase(AdmissionPhase.Intake);

        if (request.IsCompleted)
            resident.MarkCompleted("system");

        return resident;
    }

    // ---------------------------
    // UPDATE REQUEST → EXISTING ENTITY
    // ---------------------------
    public static Resident UpdateResidentEntity(Resident r, UpdateResidentRequest request)
    {
        r.UpdateAlias(request.Alias);
        r.UpdateContact(request.PhoneNumber, request.EmailAddress);
        r.UpdateNextOfKin(request.NextOfKinFirstName, request.NextOfKinSecondName, request.NextOfKinPhoneNumber);

        if (request.AddressId.HasValue)
            r.UpdateAddress(request.AddressId.Value);

        if (request.ProbationRequirementId.HasValue)
            r.AssignProbationRequirement(request.ProbationRequirementId.Value);

        if (request.SecondaryAddictionIds is { Count: > 0 })
            r.UpdateSecondaryAddictions(request.SecondaryAddictionIds);

        r.UpdateMedicalInfo(
            request.HasMedicalCard,
            request.MedicalCardNumber,
            request.HasPrivateInsurance,
            request.PrivateMedicalInsuranceProviderId,
            request.PrivateMedicalInsuranceNumber,
            request.HasMobilityIssue
        );

        if (!string.IsNullOrWhiteSpace(request.PhotoUrl))
            r.UpdatePhoto(request.PhotoUrl);

        if (request.AdmissionPhase.HasValue)
            r.AdvancePhase(request.AdmissionPhase.Value);

        if (request.IsCompleted)
            r.MarkCompleted("system");

        return r;
    }
}

}
