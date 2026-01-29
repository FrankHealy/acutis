using FluentValidation;
using Acutis.Application.Requests;

namespace Acutis.Application.Validators;

public class CreateResidentRequestValidator : AbstractValidator<CreateResidentRequest>
{
    public CreateResidentRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Surname).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CountryId).NotEmpty();
        RuleFor(x => x.AddressId).NotEmpty();
        RuleFor(x => x.PrimaryAddictionId).NotEmpty();
        RuleFor(x => x.EmailAddress).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.EmailAddress));
    }
}
