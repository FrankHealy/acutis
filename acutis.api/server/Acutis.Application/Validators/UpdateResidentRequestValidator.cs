using FluentValidation;
using Acutis.Application.Requests;

namespace Acutis.Application.Validators;
public class UpdateResidentRequestValidator : AbstractValidator<UpdateResidentRequest>
{
    public UpdateResidentRequestValidator()
    {
        RuleFor(x => x.PhoneNumber).Matches(@"^[0-9+\-\s]{7,20}$")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
        RuleFor(x => x.EmailAddress).EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.EmailAddress));
        RuleForEach(x => x.SecondaryAddictionIds!).NotEmpty()
            .When(x => x.SecondaryAddictionIds != null);
    }
}
