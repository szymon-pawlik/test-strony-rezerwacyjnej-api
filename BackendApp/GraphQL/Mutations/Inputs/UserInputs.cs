using HotChocolate;
using HotChocolate.Types; // Dodaj ten using

namespace BackendApp.GraphQL.Mutations.Inputs
{
    public record UpdateUserProfileInput(
        Optional<string> Name,
        Optional<string> Email
    );

    // Jawna definicja typu inputu, jeśli automatyczna generacja sprawia problemy
    public class UpdateUserProfileInputType : InputObjectType<UpdateUserProfileInput>
    {
        protected override void Configure(IInputObjectTypeDescriptor<UpdateUserProfileInput> descriptor)
        {
            descriptor.Field(f => f.Name).Type<StringType>(); // StringType jest domyślnie nullowalny
            descriptor.Field(f => f.Email).Type<StringType>(); // StringType jest domyślnie nullowalny
        }
    }
}