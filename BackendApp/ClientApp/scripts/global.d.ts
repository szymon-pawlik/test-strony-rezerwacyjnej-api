// ClientApp/src/global.d.ts
import { Apartment } from './types.js'; // Zaimportuj typ Apartment, jeśli jest używany

declare global {
    interface Window {
        // Funkcje z authService
        loginUser?: () => Promise<void>;
        logoutUser?: () => void;
        submitRegistration?: () => Promise<void>;

        // Funkcje z apartmentService
        // fetchApartments?: () => Promise<void>; // Wywoływane przez router
        submitNewApartment?: () => Promise<void>;
        prepareEditApartmentForm?: (apartmentData: Apartment) => void; // apartmentData przychodzi jako obiekt
        cancelEditApartment?: () => void;
        submitUpdateApartment?: () => Promise<void>;
        confirmDeleteApartment?: (apartmentDbId: string, apartmentName: string) => void;
        // fetchApartmentsForSelect?: () => Promise<void>; // Raczej wywoływane wewnętrznie

        // Funkcje z bookingService
        calculateTotalPrice?: () => void;
        submitBooking?: () => Promise<void>;
        confirmDeleteBooking?: (bookingLocalGuid: string, bookingDescription: string) => void;
        // fetchAndDisplayAllAdminBookings?: () => Promise<void>; // Wywoływane przez router

        // Funkcje z reviewService
        submitReview?: () => Promise<void>;
        confirmDeleteReview?: (reviewGlobalRelayId: string, reviewCommentSnippet: string) => void;

        // Funkcje z profileService
        // fetchMyProfile?: () => Promise<void>; // Wywoływane przez router

        // Funkcje z routera nie muszą być globalne, bo są wywoływane przez event listener hashchange
    }
}

// Ten pusty export jest potrzebny, aby TypeScript traktował ten plik jako moduł,
// co jest konieczne, jeśli importujesz typy jak 'Apartment'.
// Jeśli nie importujesz niczego w tym pliku, możesz to pominąć.
export {};