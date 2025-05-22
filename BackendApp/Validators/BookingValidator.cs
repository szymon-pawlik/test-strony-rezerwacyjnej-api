using BackendApp.DTOs;
using FluentValidation;

namespace BackendApp.Validators
{
    public class BookingValidator : AbstractValidator<CreateBookingDto> 
    {
        public BookingValidator()
        {
            RuleFor(b => b.ApartmentId)
                .NotEmpty().WithMessage("Apartment ID jest wymagane.");

            RuleFor(b => b.CheckInDate)
                .NotEmpty().WithMessage("Data zameldowania jest wymagana.")
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Data zameldowania nie może być z przeszłości.");


            RuleFor(b => b.CheckOutDate)
                .NotEmpty().WithMessage("Data wymeldowania jest wymagana.")
                .GreaterThan(b => b.CheckInDate).WithMessage("Data wymeldowania musi być późniejsza niż data zameldowania.");

            RuleFor(b => b.TotalPrice)
                .GreaterThan(0).WithMessage("Całkowita cena musi być większa od zera.");
        }
    }
}