using FluentValidation;
using Acutis.Application.Requests;

public class CreateResidentRequestValidator : AbstractValidator<CreateResidentRequest>
{
    public CreateResidentRequestValidator()
    {
        RuleFor(x => x.PrimaryAddictionId).NotEmpty().WithMessage("Primary addiction is required.");
        RuleForEach(x => x.SecondaryAddictionIds)
            .NotEqual(x => x.PrimaryAddictionId)
            .WithMessage("Secondary addiction cannot be the same as the primary addiction.");
    }
}
