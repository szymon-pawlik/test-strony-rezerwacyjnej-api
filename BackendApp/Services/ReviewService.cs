using BackendApp.Models;
using BackendApp.DTOs;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json; // Potrzebne dla JsonSerializerOptions i JsonSerializer
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BackendApp.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ReviewService> _logger;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        public ReviewService(IHttpClientFactory httpClientFactory, ILogger<ReviewService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonSerializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // Ważne dla mapowania camelCase JSON na PascalCase C#
            };
        }

        public async Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId)
        {
            var httpClient = _httpClientFactory.CreateClient("ReviewServiceClient");
            _logger.LogInformation("Fetching reviews for apartment {ApartmentId} from ReviewServiceApp", apartmentId);
            try
            {
                var response = await httpClient.GetAsync($"reviews/apartment/{apartmentId}");
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Raw JSON response from ReviewServiceApp for ApartmentId {ApartmentId}: {JsonResponse}", apartmentId, responseString);

                    try
                    {
                        var reviews = JsonSerializer.Deserialize<List<Review>>(responseString, _jsonSerializerOptions);
                        if (reviews != null)
                        {
                            _logger.LogInformation("Successfully deserialized {Count} reviews for ApartmentId {ApartmentId}.", reviews.Count, apartmentId);
                            foreach (var review in reviews)
                            {
                                _logger.LogInformation("Deserialized Review (for ApartmentId {AptId}) - ID: {ReviewId}, ApartmentId: {ReviewAptId}, UserId: {ReviewUserId}, Rating: {Rating}",
                                    apartmentId, review.Id, review.ApartmentId, review.UserId, review.Rating);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Deserialized reviews list is null for ApartmentId {ApartmentId}.", apartmentId);
                        }
                        return reviews ?? new List<Review>();
                    }
                    catch (JsonException jsonEx)
                    {
                        _logger.LogError(jsonEx, "JSON Deserialization failed for reviews for ApartmentId {ApartmentId}. Response: {JsonResponse}", apartmentId, responseString);
                        return new List<Review>();
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to fetch reviews from ReviewServiceApp for apartment {ApartmentId}. Status: {StatusCode}, Response: {ErrorContent}", apartmentId, response.StatusCode, errorContent);
                    return new List<Review>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching reviews from ReviewServiceApp for apartment {ApartmentId}", apartmentId);
                throw;
            }
        }

        public async Task<Review?> CreateReviewAsync(CreateReviewDtoInBackendApp reviewDto, string? userToken)
        {
            if (string.IsNullOrEmpty(userToken))
            {
                _logger.LogWarning("Cannot create review: userToken is missing for ReviewServiceApp call.");
                return null;
            }
            var httpClient = _httpClientFactory.CreateClient("ReviewServiceClient");
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            _logger.LogInformation("Creating review via ReviewServiceApp for apartment {ApartmentId}", reviewDto.ApartmentId);
            try
            {
                var serviceDto = new {
                    ApartmentId = reviewDto.ApartmentId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment
                };
                var response = await httpClient.PostAsJsonAsync("reviews", serviceDto);
                if (response.IsSuccessStatusCode)
                {
                    // Używamy JsonSerializerOptions również tutaj dla spójności, jeśli serwer zwraca niestandardowy casing
                    var createdReview = await response.Content.ReadFromJsonAsync<Review>(_jsonSerializerOptions);
                    return createdReview;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to create review via ReviewServiceApp. Status: {StatusCode}, Response: {ErrorContent}", response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while creating review via ReviewServiceApp for apartment {ApartmentId}", reviewDto.ApartmentId);
                throw;
            }
        }

        public async Task<Review?> GetReviewByIdAsync(Guid reviewId, string? userToken)
        {
            var httpClient = _httpClientFactory.CreateClient("ReviewServiceClient");
            _logger.LogInformation("Fetching review {ReviewId} from ReviewServiceApp", reviewId);

            if (!string.IsNullOrEmpty(userToken))
            {
                 httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
            }

            try
            {
                var response = await httpClient.GetAsync($"reviews/{reviewId}");
                if (response.IsSuccessStatusCode)
                {
                    var review = await response.Content.ReadFromJsonAsync<Review>(_jsonSerializerOptions);
                    return review;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Review {ReviewId} not found in ReviewServiceApp.", reviewId);
                    return null;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to fetch review {ReviewId} from ReviewServiceApp. Status: {StatusCode}, Response: {ErrorContent}", reviewId, response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching review {ReviewId} from ReviewServiceApp", reviewId);
                throw;
            }
        }

        public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? userToken)
        {
            var httpClient = _httpClientFactory.CreateClient("ReviewServiceClient");
            _logger.LogInformation("Fetching reviews for user {UserId} from ReviewServiceApp", userId);

            if (string.IsNullOrEmpty(userToken))
            {
                _logger.LogWarning("Cannot fetch reviews for user {UserId}: userToken is missing for ReviewServiceApp call (endpoint might be protected).", userId);
                return new List<Review>(); 
            }
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

            try
            {
                var response = await httpClient.GetAsync($"reviews/user/{userId}");
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Raw JSON response from ReviewServiceApp for UserId {UserId}: {JsonResponse}", userId, responseString);
                    
                    try
                    {
                        var reviews = JsonSerializer.Deserialize<List<Review>>(responseString, _jsonSerializerOptions);
                        if (reviews != null)
                        {
                            _logger.LogInformation("Successfully deserialized {Count} reviews for UserId {UserId}.", reviews.Count, userId);
                            foreach (var review in reviews)
                            {
                                _logger.LogInformation("Deserialized Review (for UserId {UsrId}) - ID: {ReviewId}, ApartmentId: {ReviewAptId}, UserId: {ReviewUserId}, Rating: {Rating}",
                                    userId, review.Id, review.ApartmentId, review.UserId, review.Rating);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Deserialized reviews list is null for UserId {UserId}.", userId);
                        }
                        return reviews ?? new List<Review>();
                    }
                    catch (JsonException jsonEx)
                    {
                         _logger.LogError(jsonEx, "JSON Deserialization failed for reviews for UserId {UserId}. Response: {JsonResponse}", userId, responseString);
                        return new List<Review>();
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to fetch reviews for user {UserId} from ReviewServiceApp. Status: {StatusCode}, Response: {ErrorContent}", userId, response.StatusCode, errorContent);
                    return new List<Review>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching reviews for user {UserId} from ReviewServiceApp", userId);
                throw;
            }
        }
    }
}