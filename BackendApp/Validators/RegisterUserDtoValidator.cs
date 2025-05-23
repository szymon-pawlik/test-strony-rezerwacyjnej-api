using BackendApp.DTOs;
using FluentValidation;

namespace BackendApp.Validators
{
    public class RegisterUserDtoValidator : AbstractValidator<RegisterUserDto>
    {
        public RegisterUserDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Imię jest wymagane.")
                .Length(2, 100).WithMessage("Imię musi mieć od 2 do 100 znaków.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email jest wymagany.")
                .EmailAddress().WithMessage("Niepoprawny format adresu email.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane.")
                .MinimumLength(6).WithMessage("Hasło musi mieć co najmniej 6 znaków.");


            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Potwierdzenie hasła jest wymagane.")
                .Equal(x => x.Password).WithMessage("Hasła nie pasują do siebie.");
        }
    }
}