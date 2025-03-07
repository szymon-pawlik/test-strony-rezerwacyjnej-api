using BackendApp.DTOs;
using FluentValidation;

namespace BackendApp.Validators;

public class BookingValidator : AbstractValidator<BookingDTO>
{
    public BookingValidator()
    {
        RuleFor(b => b.ApartmentId).NotEmpty();
        RuleFor(b => b.UserId).NotEmpty();
        RuleFor(b => b.CheckInDate).NotEmpty();
        RuleFor(b => b.CheckOutDate).NotEmpty().GreaterThan(b => b.CheckInDate);
        RuleFor(b => b.TotalPrice).GreaterThan(0);
    }
}