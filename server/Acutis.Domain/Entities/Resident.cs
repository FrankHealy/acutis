using Acutis.Domain.Lookups;

namespace Acutis.Domain.Entities;

public class Resident : AuditableEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    // Identity
    public string SocialSecurityNumber { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public DateTime DateOfAdmission { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string? MiddleName { get; private set; }
    public string Surname { get; private set; } = string.Empty;
    public bool IsPreviousResident { get; private set; }

    // Addictions
    public Guid PrimaryAddictionId { get; private set; }
    public AddictionType PrimaryAddiction { get; private set; } = null!;
    public ICollection<ResidentSecondaryAddiction> SecondaryAddictions { get; private set; }
        = new List<ResidentSecondaryAddiction>();

    // Nationality
    public Guid CountryId { get; private set; }
    public Country Country { get; private set; } = null!;

    // Probation
    public Guid? ProbationRequirementId { get; private set; }
    public ProbationRequirement? ProbationRequirement { get; private set; }

    // Next of Kin
    public string NextOfKinFirstName { get; private set; } = string.Empty;
    public string? NextOfKinSecondName { get; private set; }
    public string NextOfKinPhoneNumber { get; private set; } = string.Empty;

    // Medical
    public bool HasMedicalCard { get; private set; }
    public string? MedicalCardNumber { get; private set; }
    public bool HasPrivateInsurance { get; private set; }
    public string? PrivateMedicalInsuranceNumber { get; private set; }
    public bool HasMobilityIssue { get; private set; }

    // Completion
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }

    // Photos & Documents
    public ICollection<ResidentPhoto> Photos { get; private set; } = new List<ResidentPhoto>();
    public ICollection<ResidentDocument> Documents { get; private set; } = new List<ResidentDocument>();

    // Derived
    public int Age => DateTime.Today.Year - DateOfBirth.Year -
        (DateOfBirth.Date > DateTime.Today.AddYears(-(DateTime.Today.Year - DateOfBirth.Year)) ? 1 : 0);

    private Resident() { }

    public Resident(
        string ssn,
        DateTime dob,
        DateTime doa,
        string firstName,
        string? middleName,
        string surname,
        bool isPreviousResident,
        Guid primaryAddictionId,
        Guid  countryId)
    {
        SocialSecurityNumber = ssn;
        DateOfBirth = dob;
        DateOfAdmission = doa;
        FirstName = firstName;
        MiddleName = middleName;
        Surname = surname;
        IsPreviousResident = isPreviousResident;
        PrimaryAddictionId = primaryAddictionId;
        CountryId = countryId;
    }

    public void MarkAsCompleted(string completedBy)
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
    }
}

