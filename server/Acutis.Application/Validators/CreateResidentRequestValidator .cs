using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FluentValidation;
using Acutis.Application.Requests;

namespace Acutis.Application.Validators;

public class CreateResidentRequestValidator : AbstractValidator<CreateResidentRequest>
{
    public CreateResidentRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Surname).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth).LessThan(DateTime.Today);
        RuleFor(x => x.DateOfAdmission).LessThanOrEqualTo(DateTime.Today);
        RuleFor(x => x.SocialSecurityNumber).NotEmpty().MaximumLength(50);

        RuleFor(x => x.PrimaryAddictionId).NotEmpty();
        RuleFor(x => x.CountryId).NotEmpty();
        RuleFor(x => x.AddressId).NotEmpty();

        RuleFor(x => x.NextOfKinPhoneNumber).NotEmpty().MaximumLength(50);
    }
}

