using BackendApp.Models;
using BackendApp.Data;

namespace BackendApp.Services;

public class ApartmentService
{
    public List<Apartment> GetAllApartments() => DataStore.Apartments;

    public Apartment? GetApartmentById(Guid id) =>
        DataStore.Apartments.FirstOrDefault(a => a.Id == id);

    public Apartment AddApartment(Apartment apartment)
    {
        apartment = apartment with { Id = Guid.NewGuid() };
        DataStore.Apartments.Add(apartment);
        return apartment;
    }
}