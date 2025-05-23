using HotChocolate;          // Dla Optional<T> (lub HotChocolate.Types dla Optional)
using HotChocolate.Types;    // Dla InputObjectType<T> i IInputObjectTypeDescriptor<T>

namespace BackendApp.GraphQL.Mutations.Inputs
{
    // Dane wejściowe dla mutacji aktualizującej profil użytkownika.
    // Użycie Optional<T> pozwala na przekazanie tylko tych pól, które mają być zmienione.
    public record UpdateUserProfileInput(
        Optional<string> Name,
        Optional<string> Email
    );

    // Definiuje typ wejściowy GraphQL dla UpdateUserProfileInput.
    public class UpdateUserProfileInputType : InputObjectType<UpdateUserProfileInput>
    {
        protected override void Configure(IInputObjectTypeDescriptor<UpdateUserProfileInput> descriptor)
        {
            // Konfiguracja pól typu wejściowego, mapowanie na właściwości rekordu.
            descriptor.Field(f => f.Name).Type<StringType>();
            descriptor.Field(f => f.Email).Type<StringType>();
        }
    }
}