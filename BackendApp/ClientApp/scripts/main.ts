// Importy serwisów, funkcji routingu, typów i funkcji UI
import { checkLoginOnLoad, loginUser, logoutUser, submitRegistration } from './authService.js';
import {
    fetchApartments,
    submitNewApartment,
    prepareEditApartmentForm,
    cancelEditApartment,
    submitUpdateApartment,
    confirmDeleteApartment,
} from './apartmentService.js';
import {
    calculateTotalPrice,
    submitBooking,
    confirmDeleteBooking,
} from './bookingService.js';
import {
    submitReview,
    confirmDeleteReview
} from './reviewService.js';
import { handleRouteChange } from './router.js';
import {
    submitNewTicket,        // Funkcja do wysyłania nowego zgłoszenia
    fetchTicketById,        // Funkcja do pobierania szczegółów zgłoszenia po ID
    submitTicketReply,      // Funkcja do wysyłania odpowiedzi na zgłoszenie
} from './ticketApiService.js';
import {
    Apartment,
    CreateTicketDto,        // Typ dla danych nowego zgłoszenia
    CreateTicketReplyDto,   // Typ dla danych nowej odpowiedzi na zgłoszenie
    Ticket,                 // Typ reprezentujący zgłoszenie
    TicketReply             // Typ reprezentujący odpowiedź na zgłoszenie
} from './types.js';
import { renderAdminTicketDetail, renderMyTicketDetail } from './uiService.js'; // Funkcje do renderowania widoków

// Główny blok kodu aplikacji, wykonywany po załadowaniu struktury DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] DOMContentLoaded event fired.");

    // --- Definicje funkcji globalnych udostępnianych przez obiekt window ---
    // (używane np. w atrybutach onclick generowanych dynamicznie w HTML)

    /**
     * Globalna funkcja do nawigacji do szczegółów zgłoszenia (widok admina).
     * @param ticketId ID zgłoszenia.
     */
    const viewTicketDetailsGlobal = (ticketId: string): void => {
        console.log("[INFO] main.ts: viewTicketDetailsGlobal (admin onclick) navigating to ticket ID:", ticketId);
        window.location.hash = `#/admin/tickety/${ticketId}`; // Zmiana hasha URL, co uruchomi router
    };

    /**
     * Globalna funkcja do nawigacji do szczegółów zgłoszenia (widok użytkownika).
     * @param ticketId ID zgłoszenia.
     */
    const viewMyTicketDetailsGlobal = (ticketId: string): void => {
        console.log("[INFO] main.ts: viewMyTicketDetailsGlobal (user onclick) navigating to ticket ID:", ticketId);
        window.location.hash = `#/moje-zgloszenia/${ticketId}`; // Zmiana hasha URL
    };

    /**
     * Globalna funkcja do obsługi zmiany strony w generycznych komponentach paginacji.
     * Wywołuje callback (_onPageChangeCallback) zapisany na kontenerze paginacji.
     * @param page Numer strony do wyświetlenia.
     * @param containerId ID elementu HTML zawierającego kontrolki paginacji.
     */
    const handleGenericPageChangeGlobal = (page: number, containerId: string): void => {
        console.log(`[INFO] main.ts: handleGenericPageChange called for page ${page}, containerId ${containerId}`);
        // Sprawdzenie, czy element istnieje i ma przypisany callback
        const paginationContainer = document.getElementById(containerId) as HTMLElement & { _onPageChangeCallback?: (page: number) => void };
        if (paginationContainer && typeof paginationContainer._onPageChangeCallback === 'function') {
            paginationContainer._onPageChangeCallback(page); // Wywołanie zapisanego callbacku
        } else {
            console.error(`[ERROR] main.ts: Callback _onPageChangeCallback not found or not a function on container ${containerId}`);
        }
    };

    // Przypisanie funkcji z serwisów do globalnego obiektu window,
    // aby były dostępne z poziomu HTML (np. w atrybutach onclick)
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
    window.calculateTotalPrice = calculateTotalPrice;
    window.confirmDeleteReview = confirmDeleteReview;
    window.confirmDeleteBooking = confirmDeleteBooking;
    window.viewTicketDetails = viewTicketDetailsGlobal;
    window.viewMyTicketDetails = viewMyTicketDetailsGlobal;
    window.handleGenericPageChange = handleGenericPageChangeGlobal;

    console.log("[DEBUG] main.ts: Global functions for onclick have been assigned to window.");

    // --- Konfiguracja nasłuchiwaczy zdarzeń dla formularzy i przycisków ---

    // Nasłuchiwacze dla formularza rezerwacji (automatyczne obliczanie ceny)
    const bookingApartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const bookingCheckInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const bookingCheckOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;

    if (bookingApartmentSelectEl) bookingApartmentSelectEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckInDateEl) bookingCheckInDateEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckOutDateEl) bookingCheckOutDateEl.addEventListener('change', calculateTotalPrice);

    // Formularz logowania
    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    if (loginForm) {
        loginForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault(); // Zapobieganie domyślnej akcji formularza
            loginUser();        // Wywołanie funkcji logowania
        });
    }

    // Formularz rejestracji
    const registerForm = document.getElementById('registerForm') as HTMLFormElement | null;
    if (registerForm) {
        registerForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitRegistration(); // Wywołanie funkcji rejestracji
        });
    }

    // Przycisk wylogowania
    const logoutButtonEl = document.getElementById('logoutButton') as HTMLButtonElement | null;
    if (logoutButtonEl) {
        logoutButtonEl.addEventListener('click', logoutUser); // Wywołanie funkcji wylogowania
    }

    // Formularz dodawania mieszkania
    const addApartmentForm = document.getElementById('addApartmentForm') as HTMLFormElement | null;
    if (addApartmentForm) {
        addApartmentForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitNewApartment(); // Wywołanie funkcji dodawania mieszkania
        });
    }

    // Formularz dodawania recenzji
    const addReviewForm = document.getElementById('addReviewForm') as HTMLFormElement | null;
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitReview(); // Wywołanie funkcji dodawania recenzji
        });
    }

    // Formularz rezerwacji
    const addBookingForm = document.getElementById('addBookingForm') as HTMLFormElement | null;
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitBooking(); // Wywołanie funkcji tworzenia rezerwacji
        });
    }

    // Formularz edycji mieszkania
    const editApartmentForm = document.getElementById('editApartmentForm') as HTMLFormElement | null;
    if (editApartmentForm) {
        editApartmentForm.addEventListener('submit', (e: SubmitEvent) => {
            e.preventDefault();
            submitUpdateApartment(); // Wywołanie funkcji aktualizacji mieszkania
        });
    }

    // Przycisk anulowania edycji mieszkania
    const cancelEditButton = document.getElementById('cancelEditApartmentButton') as HTMLButtonElement | null;
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', cancelEditApartment); // Wywołanie funkcji anulowania edycji
    }

    // Formularz zgłaszania nowego problemu (ticketu)
    const submitTicketFormEl = document.getElementById('submitTicketForm') as HTMLFormElement | null;
    if (submitTicketFormEl) {
        submitTicketFormEl.addEventListener('submit', async (e: SubmitEvent) => {
            e.preventDefault();
            // Pobranie elementów formularza zgłoszenia
            const subjectEl = document.getElementById('ticketSubject') as HTMLInputElement | null;
            const descriptionEl = document.getElementById('ticketDescription') as HTMLTextAreaElement | null;
            const responseEl = document.getElementById('submitTicketResponse') as HTMLElement | null;

            if (!subjectEl || !descriptionEl || !responseEl) {
                console.error("Brakuje elementów formularza ticketu.");
                if(responseEl) responseEl.innerHTML = `<p style="color: red;">Błąd wewnętrzny formularza.</p>`;
                return;
            }
            // Pobranie i walidacja danych
            const subject = subjectEl.value.trim();
            const description = descriptionEl.value.trim();
            if (!subject || !description) {
                responseEl.innerHTML = `<p style="color: red;">Temat i opis są wymagane.</p>`;
                return;
            }
            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie zgłoszenia...</p>`;
            const ticketData: CreateTicketDto = { subject, description };
            // Wywołanie funkcji API do wysłania zgłoszenia
            const createdTicket = await submitNewTicket(ticketData);
            // Obsługa odpowiedzi
            if (createdTicket) {
                responseEl.innerHTML = `<p style="color: green;">Zgłoszenie wysłane pomyślnie! ID Twojego zgłoszenia: ${createdTicket.id}</p>`;
                submitTicketFormEl.reset(); // Reset formularza
            } else {
                // Jeśli komunikat o wysyłaniu nie został nadpisany przez błąd z API
                if (responseEl.innerHTML.includes("Wysyłanie zgłoszenia...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać zgłoszenia. Spróbuj ponownie.</p>`;
                }
            }
        });
    }

    // Przycisk powrotu do listy zgłoszeń (dla admina)
    const backToTicketsListBtnEl = document.getElementById('backToTicketsListBtn') as HTMLButtonElement | null;
    if (backToTicketsListBtnEl) {
        backToTicketsListBtnEl.addEventListener('click', () => {
            window.location.hash = '#/admin/tickety'; // Zmiana trasy
        });
    }

    // Przycisk powrotu do listy "moich zgłoszeń" (dla użytkownika)
    const backToMyTicketsListBtnEl = document.getElementById('backToMyTicketsListBtn') as HTMLButtonElement | null;
    if (backToMyTicketsListBtnEl) {
        backToMyTicketsListBtnEl.addEventListener('click', () => {
            window.location.hash = '#/moje-zgloszenia'; // Zmiana trasy
        });
    }

    // Formularz odpowiedzi administratora na zgłoszenie
    const adminReplyToTicketFormEl = document.getElementById('adminReplyToTicketForm') as HTMLFormElement | null;
    if (adminReplyToTicketFormEl) {
        adminReplyToTicketFormEl.addEventListener('submit', async (e: SubmitEvent) => {
            e.preventDefault();
            // Pobranie elementów formularza odpowiedzi
            const ticketIdEl = document.getElementById('replyTicketId') as HTMLInputElement | null; // Ukryte pole z ID zgłoszenia
            const replyTextEl = document.getElementById('adminTicketReplyText') as HTMLTextAreaElement | null;
            const responseEl = document.getElementById('adminReplyTicketResponse') as HTMLElement | null;

            if (!ticketIdEl || !replyTextEl || !responseEl) { return; } // Podstawowe zabezpieczenie
            const ticketId = ticketIdEl.value;
            const replyText = replyTextEl.value.trim();
            if (!replyText || !ticketId) { // Walidacja danych
                responseEl.innerHTML = `<p style="color: red;">ID ticketu i treść odpowiedzi są wymagane.</p>`;
                return;
            }
            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie odpowiedzi...</p>`;
            const replyData: CreateTicketReplyDto = { message: replyText };
            // Wywołanie funkcji API do wysłania odpowiedzi
            const createdReply: TicketReply | null = await submitTicketReply(ticketId, replyData);

            if (createdReply) {
                responseEl.innerHTML = `<p style="color: green;">Odpowiedź wysłana pomyślnie!</p>`;
                replyTextEl.value = ''; // Wyczyść pole tekstowe odpowiedzi
                // Odświeżenie widoku szczegółów zgłoszenia, aby pokazać nową odpowiedź
                if (window.location.hash.includes (`#/admin/tickety/${ticketId}`)) {
                    fetchTicketById(ticketId)
                        .then((ticketWithReplies: Ticket | null) => {
                            if (ticketWithReplies) renderAdminTicketDetail(ticketWithReplies);
                            else if (responseEl) responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu (nie znaleziono ticketu).</p>`;
                        })
                        .catch((error: Error) => {
                            console.error(`[ERROR] main.ts: Błąd odświeżania szczegółów ticketu ${ticketId} po odpowiedzi admina:`, error);
                            if (responseEl) responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu: ${error.message}</p>`;
                        });
                }
            } else {
                if (responseEl.innerHTML.includes("Wysyłanie odpowiedzi...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać odpowiedzi. Spróbuj ponownie.</p>`;
                }
            }
        });
    }

    // Formularz odpowiedzi użytkownika na zgłoszenie (w widoku "moje zgłoszenia")
    const userReplyToTicketFormEl = document.getElementById('userReplyToTicketForm') as HTMLFormElement | null;
    if (userReplyToTicketFormEl) {
        userReplyToTicketFormEl.addEventListener('submit', async (e: SubmitEvent) => {
            e.preventDefault();
            // Pobranie elementów formularza
            const ticketIdEl = document.getElementById('userReplyTicketId') as HTMLInputElement | null; // Ukryte pole z ID zgłoszenia
            const replyTextEl = document.getElementById('userTicketReplyText') as HTMLTextAreaElement | null;
            const responseEl = document.getElementById('userReplyTicketResponse') as HTMLElement | null;

            if (!ticketIdEl || !replyTextEl || !responseEl) {  return; } // Podstawowe zabezpieczenie
            const ticketId = ticketIdEl.value;
            const replyText = replyTextEl.value.trim();
            if (!replyText || !ticketId) {  return; } // Walidacja

            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie Twojej odpowiedzi...</p>`;
            const replyData: CreateTicketReplyDto = { message: replyText };
            // Wywołanie funkcji API do wysłania odpowiedzi
            const createdReply: TicketReply | null = await submitTicketReply(ticketId, replyData);

            if (createdReply) {
                responseEl.innerHTML = `<p style="color: green;">Twoja odpowiedź została wysłana!</p>`;
                replyTextEl.value = ''; // Wyczyść pole tekstowe
                // Odświeżenie widoku szczegółów zgłoszenia
                if (window.location.hash.includes(`#/moje-zgloszenia/${ticketId}`)) {
                    fetchTicketById(ticketId)
                        .then((ticketWithReplies: Ticket | null) => {
                            if (ticketWithReplies) renderMyTicketDetail(ticketWithReplies);
                            else if (responseEl) responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu.</p>`;
                        })
                        .catch((error: Error) => {
                            console.error(`[ERROR] main.ts: Błąd odświeżania szczegółów ticketu ${ticketId} po odpowiedzi użytkownika:`, error);
                            if (responseEl) responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu: ${error.message}</p>`;
                        });
                }
            } else {
                if (responseEl.innerHTML.includes("Wysyłanie Twojej odpowiedzi...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać Twojej odpowiedzi. Spróbuj ponownie.</p>`;
                }
            }
        });
    }

    // --- Inicjalizacja aplikacji ---
    checkLoginOnLoad();    // Sprawdzenie, czy użytkownik jest już zalogowany (na podstawie localStorage)
    handleRouteChange();   // Obsługa początkowej trasy (na podstawie hasha URL)
    window.addEventListener('hashchange', handleRouteChange); // Nasłuchiwanie na zmiany trasy

    console.log("Aplikacja zainicjalizowana, moduły załadowane.");
});