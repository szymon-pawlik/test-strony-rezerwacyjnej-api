using BackendApp.Models;
using BackendApp.Services; // Upewnij się, że ten using jest obecny i wskazuje na namespace z IReviewService, IApartmentService, IBookingService
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System; // Potrzebne dla Guid
using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate.Types.Pagination; // Dla PagingOptions
using Microsoft.Extensions.Logging; // Opcjonalne, dla logowania w ResolveNode

namespace BackendApp.GraphQL.Types
{
    public class ApartmentType : ObjectType<Apartment>
    {
        protected override void Configure(IObjectTypeDescriptor<Apartment> descriptor)
        {
            descriptor.Description("Represents a rentable apartment.");

            // Pola modelu Apartment
            descriptor.Field(a => a.LocalDatabaseId)
                .Name("databaseId")
                .Description("The unique database identifier of the apartment.")
                .Type<NonNullType<UuidType>>();

            descriptor.Field(a => a.Name)
                .Description("The name of the apartment.")
                .Type<NonNullType<StringType>>();

            descriptor.Field(a => a.Description)
                .Description("A description of the apartment.")
                .Type<StringType>();

            descriptor.Field(a => a.Location)
                .Description("The location of the apartment.")
                .Type<StringType>();

            descriptor.Field(a => a.NumberOfBedrooms)
                .Description("The number of bedrooms in the apartment.");

            descriptor.Field(a => a.NumberOfBathrooms)
                .Description("The number of bathrooms in the apartment.");

            descriptor.Field(a => a.Amenities)
                .Description("A list of amenities available in the apartment.")
                .Type<ListType<NonNullType<StringType>>>();

            descriptor.Field(a => a.IsAvailable)
                .Description("Indicates if the apartment is currently available for booking.");

            descriptor.Field(a => a.PricePerNight)
                .Description("The price per night for renting the apartment.")
                .Type<DecimalType>(); // Lub NonNullType<DecimalType>() jeśli cena nie może być null


            // Relacje
            descriptor.Field<ApartmentResolvers>(r => r.GetReviewsForApartmentAsync(default!, default!))
                .Name("reviews")
                .Description("A list of reviews for this apartment.")
                .UsePaging<NonNullType<ReviewType>>(options: new PagingOptions { IncludeTotalCount = true })
                .UseFiltering()
                .UseSorting();

            descriptor.Field<ApartmentResolvers>(r => r.GetBookingsForApartmentAsync(default!, default!))
                .Name("bookings")
                .Description("A list of bookings for this apartment.")
                .Type<ListType<NonNullType<BookingType>>>() // Rozważ paginację/filtrowanie/sortowanie
                .UseFiltering() // Przykład dodania filtrowania
                .UseSorting();  // Przykład dodania sortowania


            // Relay node interface
descriptor.ImplementsNode()
                .IdField(a => a.LocalDatabaseId) // Upewnij się, że to jest Twoja właściwość Guid w modelu Apartment
                .ResolveNode(async (ctx, idFromRelay) =>   // idFromRelay jest typu 'object'
                {
                    // Możesz wstrzyknąć ILogger<ApartmentType> do konstruktora ApartmentType, jeśli chcesz logować
                    // var logger = ctx.Service<ILogger<ApartmentType>>();

                    var apartmentService = ctx.Service<IApartmentService>();
                    Guid apartmentGuidToFetch;

                    if (idFromRelay is Guid directGuid)
                    {
                        // HotChocolate przekazał już Guid (np. bo IdField wskazuje na Guid)
                        apartmentGuidToFetch = directGuid;
                        // logger?.LogDebug("ResolveNode for Apartment: ID was already Guid: {ApartmentGuid}", apartmentGuidToFetch);
                    }
                    else
                    {
                        // Jeśli idFromRelay nie jest Guid, spróbuj przekonwertować go na string i sparsować
                        string? idString = idFromRelay != null ? idFromRelay.ToString() : null;// Bezpieczna konwersja na string, idFromRelay może być null
                        if (idString != null && Guid.TryParse(idString, out Guid parsedGuid))
                        {
                            apartmentGuidToFetch = parsedGuid;
                            // logger?.LogDebug("ResolveNode for Apartment: ID parsed from string '{IdString}' to Guid: {ApartmentGuid}", idString, apartmentGuidToFetch);
                        }
                        else
                        {
                            // Nie udało się uzyskać Guid z idFromRelay
                            string idTypeInfo = idFromRelay == null ? "null" : idFromRelay.GetType().FullName ?? "unknown";
                            // logger?.LogWarning("ResolveNode for Apartment: Could not convert or parse node ID. Received type {IDType} with value '{IDValue}'.", idTypeInfo, idFromRelay);
                            ctx.ReportError(ErrorBuilder.New()
                               .SetMessage($"Invalid node ID format for Apartment. Expected Guid representation, got type {idTypeInfo} with value '{idFromRelay}'.")
                               .SetCode("INVALID_NODE_ID")
                               .Build());
                            return null;
                        }
                    }

                    if (apartmentGuidToFetch == Guid.Empty)
                    {
                        // logger?.LogWarning("ResolveNode for Apartment: Received an empty Guid after parsing/conversion.");
                        // Możesz chcieć zgłosić błąd lub po prostu zwrócić null, jeśli puste Guid jest nieprawidłowe
                        ctx.ReportError(ErrorBuilder.New()
                           .SetMessage("Invalid node ID for Apartment: ID cannot be an empty Guid.")
                           .SetCode("EMPTY_NODE_ID")
                           .Build());
                        return null;
                    }
                    
                    // Użyj poprawnej nazwy metody z interfejsu IApartmentService:
                    return await apartmentService.GetApartmentByIdAsync(apartmentGuidToFetch);
                });
        }

        // Klasa z resolverami dla pól, jeśli wolisz takie podejście
        // Alternatywnie, możesz użyć metod statycznych lub wstrzykiwać serwisy bezpośrednio w lambdach .Resolve()
        private class ApartmentResolvers
        {
            public async Task<IEnumerable<Review>> GetReviewsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IReviewService reviewService) // Używamy IReviewService (który jest teraz wewnętrzny)
            {
                // Upewnij się, że apartment.LocalDatabaseId to poprawne Guid, którego oczekuje serwis
                return await reviewService.GetReviewsByApartmentIdAsync(apartment.LocalDatabaseId);
            }

            public async Task<IEnumerable<Booking>> GetBookingsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IBookingService bookingService)
            {
                // Upewnij się, że apartment.LocalDatabaseId to poprawne Guid, którego oczekuje serwis
                return await bookingService.GetBookingsByApartmentIdAsync(apartment.LocalDatabaseId);
            }
        }
    }
}