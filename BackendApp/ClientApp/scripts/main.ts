// main.ts
import { checkLoginOnLoad, loginUser, logoutUser, submitRegistration } from './authService.js'; // Poprawione importy
import {
    // fetchApartments, // Wywoływane przez router
    submitNewApartment,
    prepareEditApartmentForm,
    cancelEditApartment,
    submitUpdateApartment,
    confirmDeleteApartment,
    // fetchApartmentsForSelect // Wywoływane wewnętrznie
} from './apartmentService.js'; // Poprawione importy
import {
    calculateTotalPrice,
    submitBooking,
    confirmDeleteBooking,
    // fetchAndDisplayAllAdminBookings // Wywoływane przez router
} from './bookingService.js'; // Poprawione importy
import {
    submitReview,
    confirmDeleteReview
} from './reviewService.js'; // Poprawione importy
// import { fetchMyProfile } from './profileService'; // Wywoływane przez router
import { handleRouteChange } from './router.js'; // Poprawione importy

// Typy dla Apartment (jeśli global.d.ts nie jest używany lub dla jasności)
import { Apartment } from './types';


// --- Inicjalizacja aplikacji ---
document.addEventListener('DOMContentLoaded', () => {
    // Nasłuchiwacze dla formularzy i dynamicznych elementów
    const bookingApartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const bookingCheckInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const bookingCheckOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;

    // Funkcje calculateTotalPrice jest wywoływana przez onchange w HTML, więc musi być na window
    // lub event listenery muszą być dodane tutaj.
    // Aktualny kod HTML używa onchange, więc zostawiamy calculateTotalPrice na window.
    if (bookingApartmentSelectEl) bookingApartmentSelectEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckInDateEl) bookingCheckInDateEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckOutDateEl) bookingCheckOutDateEl.addEventListener('change', calculateTotalPrice);


    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    if (loginForm) {
        loginForm.addEventListener('submit', (e: SubmitEvent) => { // Typujemy event
            e.preventDefault();
            loginUser(); // loginUser jest async, ale tutaj nie oczekujemy na wynik
        });
    }

    const registerForm = document.getElementById('registerForm') as HTMLFormElement | null;
    if (registerForm) {
        registerForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitRegistration();
        });
    }

    const logoutButton = document.getElementById('logoutButton') as HTMLButtonElement | null;
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser); // logoutUser jest synchroniczna
    }

    const addApartmentForm = document.getElementById('addApartmentForm') as HTMLFormElement | null;
    if (addApartmentForm) {
        addApartmentForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitNewApartment();
        });
    }

    const addReviewForm = document.getElementById('addReviewForm') as HTMLFormElement | null;
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitReview();
        });
    }

    const addBookingForm = document.getElementById('addBookingForm') as HTMLFormElement | null;
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitBooking();
        });
    }

    const editApartmentForm = document.getElementById('editApartmentForm') as HTMLFormElement | null;
    if (editApartmentForm) {
        editApartmentForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitUpdateApartment();
        });
    }

    const cancelEditButton = document.getElementById('cancelEditApartmentButton') as HTMLButtonElement | null;
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', cancelEditApartment); // cancelEditApartment jest synchroniczna
    }


    // Sprawdź stan logowania przy ładowaniu strony
    checkLoginOnLoad(); // synchroniczna, ale wewnętrznie może wywoływać async
    // Obsłuż początkową ścieżkę
    handleRouteChange(); // synchroniczna
    // Nasłuchuj na zmiany w hashu URL
    window.addEventListener('hashchange', handleRouteChange);

    // --- Workaround dla funkcji onclick w HTML ---
    // Przypisanie funkcji do obiektu window, aby były dostępne globalnie dla atrybutów onclick
    // Użycie deklaracji z global.d.ts (lub na górze pliku) pozwoli TypeScriptowi to zweryfikować.

    // Funkcje, które są już obsłużone przez addEventListener powyżej,
    // technicznie nie muszą być na window DLA TYCH KONKRETNYCH listenerów.
    // Ale jeśli są inne miejsca w HTML (np. dynamicznie generowany HTML) używające onclick,
    // to muszą tu pozostać.
    window.loginUser = loginUser;
    window.logoutUser = logoutUser;
    window.submitRegistration = submitRegistration;
    window.submitNewApartment = submitNewApartment;
    window.prepareEditApartmentForm = prepareEditApartmentForm;
    window.cancelEditApartment = cancelEditApartment;
    window.submitUpdateApartment = submitUpdateApartment;
    window.confirmDeleteApartment = confirmDeleteApartment;
    window.submitReview = submitReview;
    window.submitBooking = submitBooking;
    window.calculateTotalPrice = calculateTotalPrice; // Dla onchange w HTML
    window.confirmDeleteReview = confirmDeleteReview;
    window.confirmDeleteBooking = confirmDeleteBooking;

    // Funkcje wywoływane przez router nie muszą być na window, chyba że dla debugowania z konsoli.
    // window.fetchMyProfile = fetchMyProfile;
    // window.fetchApartments = fetchApartments;
    // window.fetchAndDisplayAllAdminBookings = fetchAndDisplayAllAdminBookings;

    console.log("Aplikacja zainicjalizowana, moduły załadowane.");
});