using System.Linq;
using Acutis.Application.DTOs;
using Acutis.Application.Requests;
using Acutis.Domain.Entities;
using Acutis.Domain.Enums;

namespace Acutis.Infrastructure.Mapping
{
    internal static class DtoMapper
    {
        public static ResidentDto ToResidentDto(Resident r) => new()
        {
            Id = r.Id,
            SocialSecurityNumber = r.SocialSecurityNumber,
            DateOfAdmission = r.DateOfAdmission,
            DateOfBirth = r.DateOfBirth,

            FirstName = r.FirstName,
            MiddleName = r.MiddleName,
            Surname = r.Surname,
            Alias = r.Alias,

            IsPreviousResident = r.IsPreviousResident,
            Sex = r.Sex,

            Address = r.Address is null ? "" : $"{r.Address.Line1}, {r.Address.City}, {r.Address.County}, {r.Address.PostCode}",
            Country = r.Country?.CountryName ?? "",

            ReligiousAffiliation = r.ReligiousAffiliation?.Name,
            HasProbationRequirement = r.HasProbationRequirement,
            ProbationRequirement = r.ProbationRequirement?.Requirement,

            HasMedicalCard = r.HasMedicalCard,
            MedicalCardNumber = r.MedicalCardNumber,
            HasPrivateInsurance = r.HasPrivateInsurance,
            PrivateMedicalInsuranceProvider = r.PrivateMedicalInsuranceProvider?.Name,
            PrivateMedicalInsuranceNumber = r.PrivateMedicalInsuranceNumber,
            HasMobilityIssue = r.HasMobilityIssue,

            PrimaryAddiction = r.PrimaryAddiction?.Name ?? "",
            SecondaryAddictions = r.SecondaryAddictions.Select(a => a.Name).ToList(),

            PhoneNumber = r.PhoneNumber,
            EmailAddress = r.EmailAddress,

            NextOfKinFirstName = r.NextOfKinFirstName,
            NextOfKinSecondName = r.NextOfKinSecondName,
            NextOfKinPhoneNumber = r.NextOfKinPhoneNumber,

            PhotoUrl = r.PhotoUrl,
            ArrivalPhotoUrl = r.ArrivalPhotoUrl,
            DischargePhotoUrl = r.DischargePhotoUrl,
            PhotoDeclined = r.PhotoDeclined,
            PhotoDeclinedReason = r.PhotoDeclinedReason,

            AdmissionPhase = r.AdmissionPhase.ToString(),
            DataQuality = r.DataQuality.ToString(),

            IsAdmissionFormComplete = r.IsAdmissionFormComplete,
            AdmissionFormCompletedAt = r.AdmissionFormCompletedAt,
            AdmissionFormCompletedBy = r.AdmissionFormCompletedBy,

            QuestionnairesJson = r.QuestionnairesJson,
            PreferredStepDownHouse = r.PreferredStepDownHouse.ToString(),

            NeedsReview = r.NeedsReview,
            ReviewedBy = r.ReviewedBy,
            ReviewedAt = r.ReviewedAt,

            IsCompleted = r.IsCompleted,
            CompletedBy = r.CompletedBy,
            CompletedAt = r.CompletedAt,

            RoomNumber = r.RoomNumber,
            DepositAmount = r.DepositAmount,
            DepositReceivedAt = r.DepositReceivedAt,

            Age = r.CalculateAge()
        };

        // IMPORTANT: No secondary-addictions logic here (service handles EF lookups).
        public static Resident ApplyUpdate(Resident r, UpdateResidentRequest req)
        {
            r.UpdateAlias(req.Alias);
            r.UpdateContact(req.PhoneNumber, req.EmailAddress);
            r.UpdateNextOfKin(req.NextOfKinFirstName, req.NextOfKinSecondName, req.NextOfKinPhoneNumber);

            if (req.AddressId.HasValue)
                r.UpdateAddress(req.AddressId.Value);

            if (req.ProbationRequirementId.HasValue)
                r.AssignProbationRequirement(req.ProbationRequirementId.Value);

            r.UpdateMedicalInfo(
                req.HasMedicalCard ?? r.HasMedicalCard,
                req.MedicalCardNumber ?? r.MedicalCardNumber,
                req.HasPrivateInsurance ?? r.HasPrivateInsurance,
                req.PrivateMedicalInsuranceProviderId ?? r.PrivateMedicalInsuranceProviderId,
                req.PrivateMedicalInsuranceNumber ?? r.PrivateMedicalInsuranceNumber,
                req.HasMobilityIssue ?? r.HasMobilityIssue
            );

            if (req.PhotoDeclined == true)
                r.DeclinePhoto(req.PhotoDeclinedReason);
            else if (!string.IsNullOrWhiteSpace(req.PhotoUrl))
                r.UpdatePhoto(req.PhotoUrl);

            if (req.AdmissionPhase.HasValue)
                r.AdvancePhase(req.AdmissionPhase.Value);

            if (req.IsAdmissionFormComplete)
                r.MarkAdmissionFormComplete("system");

            if (!string.IsNullOrWhiteSpace(req.QuestionnairesJson))
                r.AttachQuestionnaire(req.QuestionnairesJson);

            if (!string.IsNullOrWhiteSpace(req.PreferredStepDownHouse) &&
                Enum.TryParse<StepDownHouse>(req.PreferredStepDownHouse, true, out var house))
                r.SetPreferredStepDownHouse(house);

            if (req.NeedsReview == true)
                r.FlagForReview();

            if (!string.IsNullOrWhiteSpace(req.RoomNumber))
                r.AssignRoom(req.RoomNumber);

            if (req.DepositAmount.HasValue)
                r.RecordDeposit(req.DepositAmount.Value, Guid.Empty);

            return r;
        }
    }
}
