// Import typu Apartment, jeśli jest potrzebny w deklaracjach globalnych
import { Apartment } from './types.js';

// Rozszerzenie globalnego interfejsu Window o funkcje dostępne w całej aplikacji
declare global {
    interface Window {
        // --- Funkcje związane z autoryzacją (z authService.js) ---
        loginUser?: () => Promise<void>;               // Obsługuje logowanie użytkownika
        logoutUser?: () => void;                      // Obsługuje wylogowywanie użytkownika
        submitRegistration?: () => Promise<void>;     // Obsługuje proces rejestracji nowego użytkownika

        // --- Funkcje ogólne / paginacja (prawdopodobnie z uiService.js lub router.js) ---
        handleGenericPageChange?: (page: number, containerId: string) => void; // Obsługuje zmianę strony dla generycznych list paginowanych

        // --- Funkcje związane z mieszkaniami (z apartmentService.js) ---
        submitNewApartment?: () => Promise<void>;      // Obsługuje dodawanie nowego mieszkania
        prepareEditApartmentForm?: (apartmentData: Apartment) => void; // Przygotowuje formularz edycji danymi mieszkania
        cancelEditApartment?: () => void;             // Anuluje edycję mieszkania
        submitUpdateApartment?: () => Promise<void>;   // Obsługuje aktualizację danych mieszkania
        confirmDeleteApartment?: (apartmentDbId: string, apartmentName: string) => void; // Potwierdza i inicjuje usunięcie mieszkania

        // --- Funkcje związane z rezerwacjami (z bookingService.js) ---
        calculateTotalPrice?: () => void;             // Oblicza całkowitą cenę rezerwacji
        submitBooking?: () => Promise<void>;          // Obsługuje tworzenie nowej rezerwacji
        confirmDeleteBooking?: (bookingLocalGuid: string, bookingDescription: string) => void; // Potwierdza i inicjuje usunięcie rezerwacji

        // --- Funkcje związane z recenzjami (prawdopodobnie z reviewService.js) ---
        submitReview?: () => Promise<void>;           // Obsługuje dodawanie nowej recenzji
        confirmDeleteReview?: (reviewGlobalRelayId: string, reviewCommentSnippet: string) => void; // Potwierdza i inicjuje usunięcie recenzji

        // --- Funkcje związane ze zgłoszeniami (ticketami) (prawdopodobnie z ticketService.js) ---
        viewTicketDetails?: (ticketId: string) => void; // Wyświetla szczegóły zgłoszenia (dla admina)
        viewMyTicketDetails?: (ticketId: string) => void; // Wyświetla szczegóły zgłoszenia (dla użytkownika)
        
    }
}
export {};