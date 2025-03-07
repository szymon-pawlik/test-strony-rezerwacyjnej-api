using BackendApp.Models;

namespace BackendApp.Data;

public static class DataStore
{
    public static List<Apartment> Apartments = new();
    public static List<User> Users = new();
    public static List<Booking> Bookings = new();
    public static List<Review> Reviews = new();
}