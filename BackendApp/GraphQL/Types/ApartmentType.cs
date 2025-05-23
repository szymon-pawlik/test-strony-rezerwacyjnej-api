using BackendApp.Models;
using BackendApp.Services;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla Node, ImplementsNode, [ID]
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate.Types.Pagination; // Dla PagingOptions
using Microsoft.Extensions.Logging;   // Dla ILogger, jeśli byłby tu używany bezpośrednio

namespace BackendApp.GraphQL.Types
{
    /// <summary>
    /// Definiuje typ GraphQL dla modelu Apartment.
    /// Odpowiada za mapowanie właściwości modelu Apartment na pola w schemacie GraphQL.
    /// </summary>
    public class ApartmentType : ObjectType<Apartment>
    {
        // Konfiguruje strukturę typu Apartment w schemacie GraphQL.
        protected override void Configure(IObjectTypeDescriptor<Apartment> descriptor)
        {
            descriptor.Description("Reprezentuje mieszkanie do wynajęcia.");

            // Mapowanie podstawowych właściwości modelu Apartment na pola GraphQL.
            descriptor.Field(a => a.LocalDatabaseId)
                .Name("databaseId")
                .Description("Unikalny identyfikator mieszkania w bazie danych.")
                .Type<NonNullType<UuidType>>();

            descriptor.Field(a => a.Name)
                .Description("Nazwa mieszkania.")
                .Type<NonNullType<StringType>>();

            descriptor.Field(a => a.Description)
                .Description("Opis mieszkania.")
                .Type<StringType>();

            descriptor.Field(a => a.Location)
                .Description("Lokalizacja mieszkania.")
                .Type<StringType>();

            descriptor.Field(a => a.NumberOfBedrooms)
                .Description("Liczba sypialni w mieszkaniu.");

            descriptor.Field(a => a.NumberOfBathrooms)
                .Description("Liczba łazienek w mieszkaniu.");

            descriptor.Field(a => a.Amenities)
                .Description("Lista udogodnień dostępnych w mieszkaniu.")
                .Type<ListType<NonNullType<StringType>>>();

            descriptor.Field(a => a.IsAvailable)
                .Description("Wskazuje, czy mieszkanie jest aktualnie dostępne do rezerwacji.");

            descriptor.Field(a => a.PricePerNight)
                .Description("Cena za noc wynajmu mieszkania.")
                .Type<DecimalType>();

            // Definicja pola 'reviews' jako kolekcji z paginacją, filtrowaniem i sortowaniem.
            descriptor.Field<ApartmentResolvers>(r => r.GetReviewsForApartmentAsync(default!, default!))
                .Name("reviews")
                .Description("Lista recenzji dla tego mieszkania.")
                .UsePaging<NonNullType<ReviewType>>(options: new PagingOptions { IncludeTotalCount = true })
                .UseFiltering()
                .UseSorting();

            // Definicja pola 'bookings' jako listy z filtrowaniem i sortowaniem.
            descriptor.Field<ApartmentResolvers>(r => r.GetBookingsForApartmentAsync(default!, default!))
                .Name("bookings")
                .Description("Lista rezerwacji dla tego mieszkania.")
                .Type<ListType<NonNullType<BookingType>>>()
                .UseFiltering()
                .UseSorting();

            // Implementacja interfejsu Node dla globalnej identyfikacji obiektów.
            descriptor.ImplementsNode()
                .IdField(a => a.LocalDatabaseId) // Wskazuje, która właściwość dostarcza lokalne ID.
                .ResolveNode(async (ctx, idFromRelay) => // Definiuje logikę pobierania obiektu na podstawie globalnego ID Relay.
                {
                    // Ten resolver jest odpowiedzialny za odtworzenie obiektu Apartment na podstawie jego globalnego ID.
                    var apartmentService = ctx.Service<IApartmentService>();
                    Guid apartmentGuidToFetch;

                    // Próba konwersji otrzymanego ID na Guid.
                    if (idFromRelay is Guid directGuid)
                    {
                        apartmentGuidToFetch = directGuid;
                    }
                    else
                    {
                        string? idString = idFromRelay != null ? idFromRelay.ToString() : null;
                        if (idString != null && Guid.TryParse(idString, out Guid parsedGuid))
                        {
                            apartmentGuidToFetch = parsedGuid;
                        }
                        else
                        {
                            // Obsługa błędu nieprawidłowego formatu ID.
                            string idTypeInfo = idFromRelay == null ? "null" : idFromRelay.GetType().FullName ?? "unknown";
                            ctx.ReportError(ErrorBuilder.New()
                               .SetMessage($"Invalid node ID format for Apartment. Expected Guid representation, got type {idTypeInfo} with value '{idFromRelay}'.")
                               .SetCode("INVALID_NODE_ID")
                               .Build());
                            return null;
                        }
                    }

                    // Sprawdzenie, czy ID nie jest puste.
                    if (apartmentGuidToFetch == Guid.Empty)
                    {
                        ctx.ReportError(ErrorBuilder.New()
                           .SetMessage("Invalid node ID for Apartment: ID cannot be an empty Guid.")
                           .SetCode("EMPTY_NODE_ID")
                           .Build());
                        return null;
                    }
                    // Pobranie mieszkania z serwisu.
                    return await apartmentService.GetApartmentByIdAsync(apartmentGuidToFetch);
                });
        }

        // Prywatna klasa wewnętrzna grupująca metody resolverów dla ApartmentType.
        private class ApartmentResolvers
        {
            // Resolver dla pola 'reviews'.
            public async Task<IEnumerable<Review>> GetReviewsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IReviewService reviewService)
            {
                return await reviewService.GetReviewsByApartmentIdAsync(apartment.LocalDatabaseId);
            }

            // Resolver dla pola 'bookings'.
            public async Task<IEnumerable<Booking>> GetBookingsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IBookingService bookingService)
            {
                return await bookingService.GetBookingsByApartmentIdAsync(apartment.LocalDatabaseId);
            }
        }
    }
}