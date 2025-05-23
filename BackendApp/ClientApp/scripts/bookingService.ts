// Importy modułów, funkcji pomocniczych i typów
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { logoutUser } from './authService.js';
import { handleRouteChange } from './router.js';

import {
    Booking,
    NewBookingRESTInput,
    NewBookingRESTSuccessResponse,
    AllBookingsAdminQueryData,
    GraphQLResponse,
    ApiErrorResponse,
    DeleteBookingMutationPayload
} from './types';

/**
 * Oblicza całkowitą cenę rezerwacji na podstawie wybranego mieszkania,
 * daty zameldowania i wymeldowania. Aktualizuje pole totalPrice w formularzu.
 */
export function calculateTotalPrice(): void {
    console.log("calculateTotalPrice function CALLED");
    // Pobranie elementów DOM
    const apartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const checkInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const checkOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;
    const totalPriceEl = document.getElementById('bookingTotalPrice') as HTMLInputElement | null;

    // Jeśli brakuje któregokolwiek z kluczowych elementów, wyczyść cenę i zakończ
    if (!apartmentSelectEl || !checkInDateEl || !checkOutDateEl || !totalPriceEl) {
        if (totalPriceEl) totalPriceEl.value = ""; // Wyczyść pole ceny, jeśli istnieje
        return;
    }

    // Pobranie ceny za noc z atrybutu data-* wybranej opcji mieszkania
    const selectedOption = apartmentSelectEl.options[apartmentSelectEl.selectedIndex] as HTMLOptionElement | undefined;
    const pricePerNightStr = selectedOption?.dataset.pricePerNight;

    // Sprawdzenie, czy wszystkie potrzebne dane są dostępne
    if (pricePerNightStr && checkInDateEl.value && checkOutDateEl.value) {
        const pricePerNight = parseFloat(pricePerNightStr);
        const checkIn = new Date(checkInDateEl.value);
        const checkOut = new Date(checkOutDateEl.value);

        // Walidacja danych: cena musi być liczbą, daty poprawne (checkIn < checkOut)
        if (!isNaN(pricePerNight) && pricePerNight > 0 && checkIn < checkOut) {
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Obliczenie liczby nocy
            if (nights > 0) {
                totalPriceEl.value = (nights * pricePerNight).toFixed(2); // Ustawienie obliczonej ceny
            } else {
                totalPriceEl.value = "0.00"; // Jeśli liczba nocy jest <= 0 (co nie powinno się zdarzyć przy checkIn < checkOut)
            }
        } else {
            totalPriceEl.value = ""; // Wyczyść cenę, jeśli dane są niepoprawne
        }
    } else {
        totalPriceEl.value = ""; // Wyczyść cenę, jeśli brakuje danych
    }
}

/**
 * Przesyła dane nowej rezerwacji do serwera (REST API).
 * Wymaga zalogowanego użytkownika.
 */
export async function submitBooking(): Promise<void> {
    console.log("submitBooking function CALLED");
    const responseEl = document.getElementById('addBookingResponse') as HTMLPreElement | null;
    if (!responseEl) {
        console.error("Element addBookingResponse nie został znaleziony.");
        return;
    }
    responseEl.textContent = 'Przetwarzanie rezerwacji...'; // Komunikat o przetwarzaniu

    // Sprawdzenie autoryzacji
    const currentJwtToken = getJwtToken();
    if (!currentJwtToken) {
        alert('Musisz być zalogowany, aby dokonać rezerwacji.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/'; // Przekierowanie do logowania
        return;
    }

    // Pobranie elementów formularza
    const apartmentIdEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const checkInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const checkOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;
    const totalPriceEl = document.getElementById('bookingTotalPrice') as HTMLInputElement | null;
    const addBookingFormEl = document.getElementById('addBookingForm') as HTMLFormElement | null; // Referencja do formularza

    if (!apartmentIdEl || !checkInDateEl || !checkOutDateEl || !totalPriceEl) {
        responseEl.textContent = 'Błąd: Brakuje elementów formularza.';
        return;
    }

    // Pobranie wartości z formularza
    const apartmentId = apartmentIdEl.value; // databaseId mieszkania
    const checkInDate = checkInDateEl.value;
    const checkOutDate = checkOutDateEl.value;
    const totalPrice = parseFloat(totalPriceEl.value);

    // Podstawowa walidacja danych
    if (!apartmentId || !checkInDate || !checkOutDate || isNaN(totalPrice) || totalPrice <= 0) {
        alert('Wypełnij poprawnie wszystkie pola rezerwacji. Całkowita cena musi być większa od zera.');
        responseEl.textContent = 'Błędne dane rezerwacji.';
        return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        alert('Data zameldowania musi być wcześniejsza niż data wymeldowania.');
        responseEl.textContent = 'Błędne daty.';
        return;
    }

    // Przygotowanie danych do wysłania
    const bookingData: NewBookingRESTInput = { apartmentId, checkInDate, checkOutDate, totalPrice };

    try {
        const res = await fetch(`${backendAppUrl}/api/bookings`, { // Endpoint REST API
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(bookingData)
        });

        const bodyText = await res.text(); // Odczytanie odpowiedzi jako tekst
        let resData: NewBookingRESTSuccessResponse | ApiErrorResponse | null = null;

        // Próba sparsowania odpowiedzi jako JSON
        if (bodyText) {
            try {
                resData = JSON.parse(bodyText);
            } catch (e) {
                console.warn("Odpowiedź z API /api/bookings nie była poprawnym JSON:", bodyText);
                // Pozostaw resData jako null, jeśli parsowanie się nie powiedzie
            }
        }

        // Wyświetlenie odpowiedzi (surowej lub sparsowanej)
        responseEl.textContent = resData ? JSON.stringify(resData, null, 2) : `Status: ${res.status}. Odpowiedź: ${bodyText || '(pusta)'}`;

        if (res.ok && (resData as NewBookingRESTSuccessResponse)?.id) { // Sprawdzenie sukcesu i obecności ID rezerwacji
            alert('Rezerwacja utworzona pomyślnie!');
            if (addBookingFormEl) addBookingFormEl.reset(); // Reset formularza
            if (totalPriceEl) totalPriceEl.value = ""; // Wyczyść pole ceny
            // Można dodać przekierowanie lub odświeżenie widoku "moje rezerwacje"
        } else { // Obsługa błędów
            let errMsg = `Błąd tworzenia rezerwacji (Status: ${res.status}).`;
            const errorDetails = resData as ApiErrorResponse;

            // Próba uzyskania bardziej szczegółowego komunikatu błędu
            if (errorDetails?.message) errMsg = errorDetails.message;
            else if (errorDetails?.Message) errMsg = errorDetails.Message; // Alternatywna nazwa pola
            else if (errorDetails?.title && errorDetails?.errors) { // Błędy walidacji
                const validationErrors = Object.entries(errorDetails.errors)
                    .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
                errMsg = `${errorDetails.title}:\n${validationErrors}`;
            } else if (bodyText && !resData) { // Jeśli odpowiedź była tekstem, a nie JSON-em
                errMsg += ` Odpowiedź serwera: ${bodyText}`;
            }
            alert(errMsg);
        }
    } catch (error: any) { // Błąd sieciowy
        responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
        console.error('Błąd podczas tworzenia rezerwacji:', error);
        alert('Wystąpił błąd sieciowy podczas próby utworzenia rezerwacji.');
    }
}

/**
 * Pobiera i wyświetla wszystkie rezerwacje dla administratora (GraphQL Query).
 * Wymaga uprawnień administratora.
 */
export async function fetchAndDisplayAllAdminBookings(): Promise<void> {
    console.log("fetchAndDisplayAllAdminBookings function CALLED");
    // Pobranie elementów DOM do wyświetlania danych
    const rawEl = document.getElementById('adminBookingsResponseRaw') as HTMLPreElement | null;
    const listEl = document.getElementById('adminBookingsListFormatted') as HTMLElement | null;
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    // Sprawdzenie istnienia elementów DOM
    if (!rawEl) {
        console.error("Element adminBookingsResponseRaw nie został znaleziony w DOM.");
        if (listEl) listEl.innerHTML = '<p style="color:red; text-align:center;">Błąd wewnętrzny strony: Nie można wyświetlić surowych danych.</p>';
        return;
    }
    if (!listEl) {
        console.error("Element adminBookingsListFormatted nie został znaleziony w DOM.");
        rawEl.textContent = 'Błąd wewnętrzny strony: Nie można wyświetlić listy rezerwacji.';
        return;
    }

    // Ustawienie stanu "ładowanie"
    rawEl.textContent = 'Pobieranie wszystkich rezerwacji...';
    listEl.innerHTML = '<p style="text-align:center;">Ładowanie rezerwacji...</p>';

    // Sprawdzenie uprawnień administratora
    if (!currentJwtToken || currentUserRole !== 'Admin') {
        const unauthorizedMsg = 'Brak uprawnień do wyświetlenia tej sekcji. Wymagana jest rola Administratora.';
        listEl.innerHTML = `<p style="color:red; text-align:center;">${unauthorizedMsg}</p>`;
        rawEl.textContent = unauthorizedMsg;
        return;
    }

    // Zapytanie GraphQL
    const graphqlQuery = {
        query: `
            query PobierzWszystkieRezerwacjeDlaAdmina {
              allBookingsForAdmin { 
                nodes {
                  id # Globalne ID GraphQL
                  databaseId # UUID z bazy danych
                  checkInDate
                  checkOutDate
                  totalPrice
                  apartment {
                    id
                    name
                    location
                  }
                  user { 
                    id
                    name
                    email
                  }
                }
                totalCount 
              }
            }
        `
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(graphqlQuery)
        });

        // Bezpieczne parsowanie JSON
        const responseData = await response.json().catch(e => {
            console.error("Błąd parsowania JSON w fetchAndDisplayAllAdminBookings:", e);
            return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." }] } as GraphQLResponse<null>;
        }) as GraphQLResponse<AllBookingsAdminQueryData>;

        rawEl.textContent = JSON.stringify(responseData, null, 2); // Wyświetlenie surowej odpowiedzi
        const bookingsDataContainer = responseData.data?.allBookingsForAdmin;

        if (response.ok && bookingsDataContainer?.nodes) {
            const bookings: Booking[] = bookingsDataContainer.nodes;
            if (bookings.length === 0) {
                listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych rezerwacji w systemie.</p>';
                return;
            }

            // Budowanie HTML dla listy rezerwacji
            let html = `<h4 style="text-align:center;">Znaleziono rezerwacji: ${bookingsDataContainer.totalCount ?? bookings.length}</h4>`;
            bookings.forEach((booking: Booking) => {
                // Formatowanie danych do wyświetlenia
                const userName = booking.user?.name || 'Użytkownik nieznany';
                const userEmail = booking.user?.email || 'brak emaila';
                const apartmentName = booking.apartment?.name || 'Mieszkanie nieznane';
                const apartmentLocation = booking.apartment?.location || 'brak lokalizacji';
                const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'Brak';
                const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'Brak';
                const totalPrice = typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A';
                const bookingGuidForDelete = String(booking.databaseId || booking.id); // Użyj databaseId (UUID) jeśli dostępne

                // Bezpieczne dane dla atrybutów onclick
                const bookingDescription = `rezerwację dla ${userName} w ${apartmentName} (od ${checkIn} do ${checkOut})`;
                const safeBookingDescription = bookingDescription.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                const safeBookingGuid = bookingGuidForDelete.replace(/'/g, "\\'").replace(/"/g, "&quot;");

                // Generowanie unikalnego ID dla elementu HTML rezerwacji
                const bookingHtmlIdBase = booking.databaseId || booking.id || Math.random().toString(36).substring(2,9);
                const bookingHtmlId = `admin-booking-item-${bookingHtmlIdBase.toString().replace(/[^a-zA-Z0-9_-]/g, "")}`;


                html += `
                    <div class="data-card" id="${bookingHtmlId}" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                        <p><strong>ID Rezerwacji (Baza):</strong> ${booking.databaseId || '<em>N/A</em>'}</p>
                        <p><strong>Użytkownik:</strong> ${userName} (<em>${userEmail}</em>)</p>
                        <p><strong>Mieszkanie:</strong> ${apartmentName} (<em>${apartmentLocation}</em>)</p>
                        <p><strong>Zameldowanie:</strong> ${checkIn}</p>
                        <p><strong>Wymeldowanie:</strong> ${checkOut}</p>
                        <p><strong>Cena Całkowita:</strong> ${totalPrice} PLN</p>
                        <button
                            onclick="confirmDeleteBooking('${safeBookingGuid}', '${safeBookingDescription}')"
                            class="action-button-secondary"
                            style="font-size:0.9em; padding:5px 10px; background-color: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer; margin-top: 5px;">
                            Usuń Rezerwację
                        </button>
                    </div>`;
            });
            listEl.innerHTML = html;

        } else if (responseData.errors) { // Obsługa błędów GraphQL
            const errorMessages = responseData.errors.map(err => {
                let msg = err.message;
                if (err.path) msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                return msg;
            }).join('<br>');
            listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił błąd po stronie serwera podczas pobierania rezerwacji:<br>${errorMessages}</p>`;
            // Automatyczne wylogowanie przy błędach autoryzacji
            if (responseData.errors.some(e => e.extensions?.code === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")))) {
                alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                logoutUser();
            }
        } else { // Nieoczekiwana odpowiedź
            listEl.innerHTML = `<p style="color:orange; text-align:center;">Otrzymano odpowiedź z serwera, ale dane rezerwacji są w nieoczekiwanym formacie lub ich brakuje. Status: ${response.status}</p>`;
        }
    } catch (error: any) { // Błąd sieciowy lub inny błąd wykonania
        console.error('Krytyczny błąd sieciowy lub JavaScript w fetchAndDisplayAllAdminBookings:', error);
        if(rawEl) rawEl.textContent = 'Błąd krytyczny: ' + (error instanceof Error ? error.message : String(error));
        if(listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił krytyczny błąd podczas próby pobrania rezerwacji: ${error instanceof Error ? error.message : String(error)}.</p>`;
    }
}

/**
 * Wyświetla okno dialogowe z potwierdzeniem usunięcia rezerwacji.
 * @param bookingLocalGuid UUID rezerwacji (databaseId).
 * @param bookingDescription Opis rezerwacji do wyświetlenia w potwierdzeniu.
 */
export function confirmDeleteBooking(bookingLocalGuid: string, bookingDescription: string): void {
    console.log("confirmDeleteBooking CALLED for Local GUID:", bookingLocalGuid);
    if (confirm(`Czy na pewno chcesz usunąć ${bookingDescription} (ID: ${bookingLocalGuid})?`)) {
        deleteBooking(bookingLocalGuid); // Używa UUID (databaseId)
    }
}

/**
 * Usuwa rezerwację z serwera (GraphQL Mutation).
 * Wymaga uprawnień administratora.
 * @param bookingLocalGuid UUID rezerwacji (databaseId) do usunięcia.
 */
export async function deleteBooking(bookingLocalGuid: string): Promise<void> {
    console.log("deleteBooking CALLED for Local GUID:", bookingLocalGuid); // UUID
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    // Sprawdzenie uprawnień
    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Musisz być zalogowany jako Administrator, aby usunąć rezerwację.');
        return;
    }
    if (!bookingLocalGuid) {
        alert('Błąd wewnętrzny: Brak ID rezerwacji (GUID) do wysłania.');
        return;
    }

    // Mutacja GraphQL do usuwania rezerwacji po UUID
    const graphqlMutation = {
        query: `mutation UsunRezerwacje($id: UUID!) { deleteBooking(id: $id) }`,
        variables: { id: bookingLocalGuid }
    };

    let responseData: GraphQLResponse<DeleteBookingMutationPayload> | undefined;

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(graphqlMutation),
        });

        const contentType = response.headers.get("content-type");

        // Obsługa różnych typów odpowiedzi serwera
        if (response.ok && contentType && contentType.includes("application/json")) {
            // Oczekiwana odpowiedź JSON
            responseData = await response.json() as GraphQLResponse<DeleteBookingMutationPayload>;
        } else if (response.ok) {
            // Odpowiedź nie jest JSON, ale status jest OK (np. 204 No Content, lub tekst 'true')
            const textResponse = await response.text();
            if (response.status === 204 || textResponse.trim().toLowerCase() === "true" || textResponse.trim() === "") {
                responseData = { data: { deleteBooking: true } }; // Sukces, jeśli odpowiedź jest pusta lub 'true'
            } else {
                // Próba sparsowania jako JSON, jeśli serwer wysłał OK, ale z dziwną treścią
                try {
                    responseData = JSON.parse(textResponse) as GraphQLResponse<DeleteBookingMutationPayload>;
                    // Jeśli parsowanie się udało, ale brakuje pól data/errors, potraktuj jako błąd
                    if (responseData && !(responseData as any).data && !(responseData as any).errors) {
                        responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}): ${textResponse}` }] };
                    }
                } catch (e) { // Jeśli nie da się sparsować
                    responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}), nie JSON: ${textResponse}` }] };
                }
            }
        } else { // Błąd HTTP
            const errorText = await response.text();
            try { // Spróbuj sparsować ciało błędu jako JSON
                responseData = JSON.parse(errorText) as GraphQLResponse<DeleteBookingMutationPayload>;
                if (!responseData.errors) { // Jeśli JSON nie ma struktury błędu GraphQL
                    responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}): ${errorText}` }] };
                }
            } catch (e) { // Jeśli ciało błędu nie jest JSON
                responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}), nie JSON: ${errorText}` }] };
            }
        }
    } catch (error: any) { // Błąd sieciowy
        console.error('Błąd sieciowy lub JavaScript w deleteBooking:', error);
        alert(`Wystąpił błąd sieciowy podczas usuwania rezerwacji: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }

    console.log("Odpowiedź serwera (deleteBooking) po przetworzeniu:", responseData);

    // Obsługa wyniku operacji
    if (responseData?.data?.deleteBooking === true) {
        alert('Rezerwacja została pomyślnie usunięta!');
        handleRouteChange(); // Odświeżenie widoku (np. listy rezerwacji)
    } else {
        const errorMsg = responseData?.errors?.map(e => e.message).join('; ') || 'Nie udało się usunąć rezerwacji.';
        alert(`Błąd usuwania rezerwacji: ${errorMsg}`);
    }
}