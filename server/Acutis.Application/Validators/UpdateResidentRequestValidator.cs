using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Acutis.Application.Requests;
using FluentValidation;

namespace Acutis.Application.Validators
{

    public class UpdateResidentRequestValidator : AbstractValidator<UpdateResidentRequest>
    {
        public UpdateResidentRequestValidator()
        {
            // Optional fields: only validate when present
            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[0-9+\-\s]{7,15}$")
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
                .WithMessage("Invalid phone number format.");

            RuleFor(x => x.EmailAddress)
                .EmailAddress()
                .When(x => !string.IsNullOrWhiteSpace(x.EmailAddress))
                .WithMessage("Invalid email address format.");

            RuleFor(x => x.NextOfKinPhoneNumber)
                .Matches(@"^[0-9+\-\s]{7,15}$")
                .When(x => !string.IsNullOrWhiteSpace(x.NextOfKinPhoneNumber))
                .WithMessage("Invalid next-of-kin phone number format.");

            // Optional ID relationships
            RuleFor(x => x.AddressId)
                .NotEmpty()
                .When(x => x.AddressId.HasValue)
                .WithMessage("AddressId cannot be empty.");

            RuleFor(x => x.ProbationRequirementId)
                .NotEmpty()
                .When(x => x.ProbationRequirementId.HasValue)
                .WithMessage("ProbationRequirementId cannot be empty.");

            // Optional secondary addictions
            RuleForEach(x => x.SecondaryAddictionIds)
                .NotEmpty()
                .WithMessage("Secondary addiction ID cannot be empty.");
        }
    }


}
