using BackendApp.Data;
using BackendApp.Models;

namespace BackendApp.Services;

public class ApartmentService
{
    private readonly AppDbContext _context;

    public ApartmentService(AppDbContext context)
    {
        _context = context;
    }

    public List<Apartment> GetAllApartments() => _context.Apartments.ToList();

    public Apartment? GetApartmentById(Guid id) => _context.Apartments.FirstOrDefault(a => a.Id == id);

    public Apartment AddApartment(Apartment apartment)
    {
        _context.Apartments.Add(apartment);
        _context.SaveChanges();
        return apartment;
    }
    public IQueryable<Apartment> GetAllApartmentsQueryable()
    {
        return _context.Apartments.AsQueryable();
    }
}