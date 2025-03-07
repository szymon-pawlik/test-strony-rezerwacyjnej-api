using BackendApp.DTOs;
using FluentValidation;

namespace BackendApp.Validators;

public class ApartmentValidator : AbstractValidator<ApartmentDTO>
{
    public ApartmentValidator()
    {
        RuleFor(a => a.Name).NotEmpty().MaximumLength(100);
        RuleFor(a => a.Description).NotEmpty().MaximumLength(500);
        RuleFor(a => a.Location).NotEmpty().MaximumLength(100);
        RuleFor(a => a.PricePerNight).GreaterThan(0);
        RuleFor(a => a.NumberOfBedrooms).GreaterThan(0);
        RuleFor(a => a.NumberOfBathrooms).GreaterThan(0);
    }
}