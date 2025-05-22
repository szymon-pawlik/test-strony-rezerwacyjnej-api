// Plik: BackendApp/Services/IReviewService.cs
using BackendApp.Models; // Dla Review
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    // To DTO jest używane do przekazania danych do serwisu.
    // Nazwa jest spójna z tym, co używa Twoja implementacja ReviewService.
    public record CreateReviewDto(
        Guid ApartmentId,
        int Rating,
        string? Comment // Komentarz jest opcjonalny (nullowalny)
    );

    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId);

        // CreateReviewAsync przyjmuje DTO i ID uwierzytelnionego użytkownika
        Task<Review?> CreateReviewAsync(CreateReviewDto reviewDto, Guid authenticatedUserId);

        // GetReviewByIdAsync przyjmuje tylko ID recenzji
        Task<Review?> GetReviewByIdAsync(Guid reviewId);

        // GetReviewsByUserIdAsync przyjmuje tylko ID użytkownika
        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? token);

        // DeleteReviewAsync przyjmuje tylko ID recenzji
        Task<bool> DeleteReviewAsync(Guid reviewId);
    }
}