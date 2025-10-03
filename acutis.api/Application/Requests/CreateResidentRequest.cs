namespace Acutis.Application.Requests;

public record CreateResidentRequest(
    string SocialSecurityNumber,
    DateTime DateOfBirth,
    DateTime DateOfAdmission,
    string FirstName,
    string? MiddleName,
    string Surname,
    bool IsPreviousResident,
    Guid PrimaryAddictionId,
    List<Guid>? SecondaryAddictionIds,
    Guid NationalityId
);
