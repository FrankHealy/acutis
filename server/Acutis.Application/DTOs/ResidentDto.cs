namespace Acutis.Application.DTOs;

   

public record ResidentDto
{
    public Guid Id { get; set; }
    public string SocialSecurityNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime DateOfAdmission { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string Surname { get; set; } = string.Empty;
    public bool IsPreviousResident { get; set; }

    public string Country { get; set; } = string.Empty;   // from Country.CountryName
    public string Address { get; set; } = string.Empty;   // flattened
    public string PrimaryAddiction { get; set; } = string.Empty;
    public List<string> SecondaryAddictions { get; set; } = new();

    public string? ProbationRequirement { get; set; }

    public string NextOfKinFirstName { get; set; } = string.Empty;
    public string? NextOfKinSecondName { get; set; }
    public string NextOfKinPhoneNumber { get; set; } = string.Empty;

    public bool HasMedicalCard { get; set; }
    public string? MedicalCardNumber { get; set; }
    public bool HasPrivateInsurance { get; set; }
    public string? PrivateMedicalInsuranceNumber { get; set; }
    public bool HasMobilityIssue { get; set; }

    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CompletedBy { get; set; }

    public int Age { get; set; }

    public List<string> Photos { get; set; } = new();
    public List<string> Documents { get; set; } = new();
}
