using System.Linq;
using Acutis.Domain.Enums;
using Acutis.Domain.Lookups;
using Acutis.Domain.ValueObjects;

namespace Acutis.Domain.Entities
{
    public class Resident
    {
        public Guid Id { get; private set; } = Guid.NewGuid();

        // Core identifiers
        public string? SocialSecurityNumber { get; private set; }
        public DateTime DateOfAdmission { get; private set; }
        public DateTime? DateOfBirth { get; private set; }

        // Names & Identity
        public string FirstName { get; private set; } = string.Empty;
        public string? MiddleName { get; private set; }
        public string Surname { get; private set; } = string.Empty;
        public string? Alias { get; private set; }

        // Demographics
        public bool IsPreviousResident { get; private set; }
        public string? Sex { get; private set; }

        // Address / Country
        public Guid AddressId { get; private set; }
        public Address Address { get; private set; } = null!;
        public Guid CountryId { get; private set; }
        public Country Country { get; private set; } = null!;

        // Religion
        public Guid? ReligiousAffiliationId { get; private set; }
        public ReligiousAffiliation? ReligiousAffiliation { get; private set; }

        // Probation
        public bool HasProbationRequirement { get; private set; }
        public Guid? ProbationRequirementId { get; private set; }
        public ProbationRequirement? ProbationRequirement { get; private set; }

        // Medical / Insurance
        public bool HasMedicalCard { get; private set; }
        public string? MedicalCardNumber { get; private set; }
        public bool HasPrivateInsurance { get; private set; }
        public Guid? PrivateMedicalInsuranceProviderId { get; private set; }
        public MedicalInsuranceProvider? PrivateMedicalInsuranceProvider { get; private set; }
        public string? PrivateMedicalInsuranceNumber { get; private set; }
        public bool HasMobilityIssue { get; private set; }

        // Addictions
        public Guid PrimaryAddictionId { get; private set; }
        public Addiction PrimaryAddiction { get; private set; } = null!;
        public List<Addiction> SecondaryAddictions { get; private set; } = new();

        // Contact
        public string? PhoneNumber { get; private set; }
        public string? EmailAddress { get; private set; }

        // Next of Kin
        public string? NextOfKinFirstName { get; private set; }
        public string? NextOfKinSecondName { get; private set; }
        public string? NextOfKinPhoneNumber { get; private set; }

        // Photos
        public string? PhotoUrl { get; private set; }
        public string? ArrivalPhotoUrl { get; private set; }
        public string? DischargePhotoUrl { get; private set; }
        public bool PhotoDeclined { get; private set; }
        public string? PhotoDeclinedReason { get; private set; }

        // Lifecycle & quality
        public AdmissionPhase AdmissionPhase { get; private set; } = AdmissionPhase.Intake;
        public DataQualityStatus DataQuality { get; private set; } = DataQualityStatus.Draft;

        // Admission form completion
        public bool IsAdmissionFormComplete { get; private set; }
        public string? AdmissionFormCompletedBy { get; private set; }
        public DateTime? AdmissionFormCompletedAt { get; private set; }

        // Questionnaires JSON
        public string? QuestionnairesJson { get; private set; }

        // Step-down preference
        public StepDownHouse PreferredStepDownHouse { get; private set; } = StepDownHouse.None;

        // “Two sets of eyes”
        public bool NeedsReview { get; private set; }
        public string? ReviewedBy { get; private set; }
        public DateTime? ReviewedAt { get; private set; }

        // Programme completion placeholder
        public bool IsCompleted { get; private set; }
        public string? CompletedBy { get; private set; }
        public DateTime? CompletedAt { get; private set; }

        // Role attribution (optional IDs)
        public Guid? AdmittedById { get; private set; }
        public Guid? DoctorId { get; private set; }
        public Guid? NurseId { get; private set; }
        public Guid? FinanceOfficerId { get; private set; }
        public decimal? DepositAmount { get; private set; }
        public DateTime? DepositReceivedAt { get; private set; }
        public string? RoomNumber { get; private set; }

        // Prescriptions
        public List<Prescription> Prescriptions { get; private set; } = new();

        protected Resident() { } // EF

        public Resident(
            string? socialSecurityNumber,
            DateTime? dateOfBirth,
            DateTime dateOfAdmission,
            string firstName,
            string? middleName,
            string surname,
            bool isPreviousResident,
            Guid primaryAddictionId,
            Guid countryId)
        {
            SocialSecurityNumber = socialSecurityNumber;
            DateOfBirth = dateOfBirth;
            DateOfAdmission = dateOfAdmission;
            FirstName = firstName.Trim();
            MiddleName = middleName?.Trim();
            Surname = surname.Trim();
            IsPreviousResident = isPreviousResident;
            PrimaryAddictionId = primaryAddictionId;
            CountryId = countryId;
            AdmissionPhase = AdmissionPhase.Intake;
            DataQuality = DataQualityStatus.Draft;
        }

        // --- Domain behavior ---
        public void UpdateAlias(string? alias) { if (!string.IsNullOrWhiteSpace(alias)) Alias = alias.Trim(); }
        public void UpdatePhoto(string? url) { if (!string.IsNullOrWhiteSpace(url)) PhotoUrl = url.Trim(); }
        public void SetArrivalPhoto(string? url)
        { if (!string.IsNullOrWhiteSpace(url) && string.IsNullOrWhiteSpace(ArrivalPhotoUrl)) { ArrivalPhotoUrl = url.Trim(); PhotoUrl = ArrivalPhotoUrl; } }
        public void SetDischargePhoto(string? url) { if (!string.IsNullOrWhiteSpace(url)) DischargePhotoUrl = url.Trim(); }
        public void DeclinePhoto(string? reason) { PhotoDeclined = true; PhotoDeclinedReason = reason?.Trim(); PhotoUrl = null; }
        public void RevokePhotoDecline() { PhotoDeclined = false; PhotoDeclinedReason = null; }

        public void UpdateAddress(Guid addressId) { if (addressId != Guid.Empty) AddressId = addressId; }
        public void AssignProbationRequirement(Guid probationRequirementId) { ProbationRequirementId = probationRequirementId; HasProbationRequirement = true; }
        public void UpdateContact(string? phone, string? email) { if (!string.IsNullOrWhiteSpace(phone)) PhoneNumber = phone.Trim(); if (!string.IsNullOrWhiteSpace(email)) EmailAddress = email.Trim(); }
        public void UpdateNextOfKin(string? first, string? second, string? phone)
        { if (!string.IsNullOrWhiteSpace(first)) NextOfKinFirstName = first.Trim(); if (!string.IsNullOrWhiteSpace(second)) NextOfKinSecondName = second.Trim(); if (!string.IsNullOrWhiteSpace(phone)) NextOfKinPhoneNumber = phone.Trim(); }

        public void UpdateMedicalInfo(bool hasCard, string? cardNumber, bool hasPrivate, Guid? providerId, string? policy, bool hasMobility)
        { HasMedicalCard = hasCard; MedicalCardNumber = cardNumber?.Trim(); HasPrivateInsurance = hasPrivate; PrivateMedicalInsuranceProviderId = providerId; PrivateMedicalInsuranceNumber = policy?.Trim(); HasMobilityIssue = hasMobility; }

        public void ClearSecondaryAddictions() => SecondaryAddictions.Clear();
        public void UpdateSecondaryAddictions(IEnumerable<Addiction> addictions)
        {
            SecondaryAddictions.Clear();
            foreach (var addiction in addictions.DistinctBy(a => a.Id))
                SecondaryAddictions.Add(addiction);
        }

        public void AdvancePhase(AdmissionPhase next)
        {
            if (next < AdmissionPhase) return;
            AdmissionPhase = next;
            if (AdmissionPhase >= AdmissionPhase.MedicalReview && !IsAdmissionFormComplete) MarkAdmissionFormComplete("system");
        }

        public void MarkAdmissionFormComplete(string by) { IsAdmissionFormComplete = true; AdmissionFormCompletedBy = by; AdmissionFormCompletedAt = DateTime.UtcNow; }
        public void AttachQuestionnaire(string json) { QuestionnairesJson = json; }
        public void SetPreferredStepDownHouse(StepDownHouse house) { PreferredStepDownHouse = house; }

        public void FlagForReview(string? reason = null) { NeedsReview = true; }
        public void MarkReviewed(string reviewedBy) { NeedsReview = false; ReviewedBy = reviewedBy; ReviewedAt = DateTime.UtcNow; }
        public void MarkTreatmentCompleted(string by, string? dischargePhoto = null)
        { IsCompleted = true; CompletedBy = by; CompletedAt = DateTime.UtcNow; AdvancePhase(AdmissionPhase.Completed); if (!string.IsNullOrWhiteSpace(dischargePhoto)) SetDischargePhoto(dischargePhoto); }

        public void AssignDoctor(Guid doctorId) => DoctorId = doctorId;
        public void AssignNurse(Guid nurseId) => NurseId = nurseId;
        public void AssignRoom(string roomNumber) { RoomNumber = string.IsNullOrWhiteSpace(roomNumber) ? RoomNumber : roomNumber.Trim(); }
        public void RecordDeposit(decimal amount, Guid financeOfficerId) { if (amount < 0) return; DepositAmount = amount; FinanceOfficerId = financeOfficerId; DepositReceivedAt = DateTime.UtcNow; }

        public void AddPrescription(string med, string dose, string freq, string by, string? notes = null)
        {
            Prescriptions.Add(new Prescription
            {
                ResidentId = Id,
                MedicationName = med.Trim(),
                Dosage = dose.Trim(),
                Frequency = freq.Trim(),
                PrescribedBy = by.Trim(),
                Notes = notes
            });
        }

        public void MarkVerified() => DataQuality = DataQualityStatus.Verified;
        public void MarkCorrected() => DataQuality = DataQualityStatus.Corrected;

        public int CalculateAge()
        {
            if (!DateOfBirth.HasValue) return 0;
            var today = DateTime.Today;
            var age = today.Year - DateOfBirth.Value.Year;
            if (DateOfBirth.Value.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}
