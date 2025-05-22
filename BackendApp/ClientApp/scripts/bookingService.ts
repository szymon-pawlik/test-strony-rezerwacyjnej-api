// bookingService.ts
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { logoutUser } from './authService.js'; // Poprawiony import
import { handleRouteChange } from './router.js';

// Importy typów
import {
    Booking,
    NewBookingRESTInput,
    NewBookingRESTSuccessResponse,
    AllBookingsAdminQueryData,
    GraphQLResponse,
    ApiErrorResponse,
    DeleteBookingMutationPayload
} from './types';

export function calculateTotalPrice(): void {
    console.log("calculateTotalPrice function CALLED");
    const apartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const checkInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const checkOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;
    const totalPriceEl = document.getElementById('bookingTotalPrice') as HTMLInputElement | null;

    if (!apartmentSelectEl || !checkInDateEl || !checkOutDateEl || !totalPriceEl) {
        if (totalPriceEl) totalPriceEl.value = ""; // Wyczyść, jeśli totalPriceEl istnieje, a inne nie
        return;
    }

    const selectedOption = apartmentSelectEl.options[apartmentSelectEl.selectedIndex] as HTMLOptionElement | undefined;
    const pricePerNightStr = selectedOption?.dataset.pricePerNight;

    if (pricePerNightStr && checkInDateEl.value && checkOutDateEl.value) {
        const pricePerNight = parseFloat(pricePerNightStr);
        const checkIn = new Date(checkInDateEl.value);
        const checkOut = new Date(checkOutDateEl.value);

        // Sprawdź poprawność dat i ceny
        if (!isNaN(pricePerNight) && pricePerNight > 0 && checkIn < checkOut) {
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (nights > 0) {
                totalPriceEl.value = (nights * pricePerNight).toFixed(2);
            } else {
                totalPriceEl.value = "0.00"; // Jeśli noce <= 0 (np. ta sama data)
            }
        } else {
            totalPriceEl.value = ""; // Wyczyść, jeśli dane są niepoprawne
        }
    } else {
        totalPriceEl.value = ""; // Wyczyść, jeśli brakuje danych
    }
}

export async function submitBooking(): Promise<void> {
    console.log("submitBooking function CALLED");
    const responseEl = document.getElementById('addBookingResponse') as HTMLPreElement | null;
    if (!responseEl) {
        console.error("Element addBookingResponse nie został znaleziony.");
        return;
    }
    responseEl.textContent = 'Przetwarzanie rezerwacji...';

    const currentJwtToken = getJwtToken();
    if (!currentJwtToken) {
        alert('Musisz być zalogowany.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/';
        return;
    }

    const apartmentIdEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const checkInDateEl = document.getElementById('bookingCheckInDate') as HTMLInputElement | null;
    const checkOutDateEl = document.getElementById('bookingCheckOutDate') as HTMLInputElement | null;
    const totalPriceEl = document.getElementById('bookingTotalPrice') as HTMLInputElement | null;
    const addBookingFormEl = document.getElementById('addBookingForm') as HTMLFormElement | null;


    if (!apartmentIdEl || !checkInDateEl || !checkOutDateEl || !totalPriceEl) {
        responseEl.textContent = 'Błąd: Brakuje elementów formularza.';
        return;
    }

    const apartmentId = apartmentIdEl.value;
    const checkInDate = checkInDateEl.value;
    const checkOutDate = checkOutDateEl.value;
    const totalPrice = parseFloat(totalPriceEl.value);

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

    const bookingData: NewBookingRESTInput = { apartmentId, checkInDate, checkOutDate, totalPrice };

    try {
        const res = await fetch(`${backendAppUrl}/api/bookings`, { // REST endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(bookingData)
        });

        const bodyText = await res.text();
        let resData: NewBookingRESTSuccessResponse | ApiErrorResponse | null = null;

        if (bodyText) {
            try {
                resData = JSON.parse(bodyText);
            } catch (e) {
                console.warn("Odpowiedź z API /api/bookings nie była poprawnym JSON:", bodyText);
                // Jeśli nie JSON, ale status OK, to może być problem, ale na razie zostawiamy resData jako null
            }
        }

        responseEl.textContent = resData ? JSON.stringify(resData, null, 2) : `Status: ${res.status}. Odpowiedź: ${bodyText || '(pusta)'}`;

        // Sprawdzamy, czy 'id' istnieje w resData, co sugeruje sukces
        if (res.ok && (resData as NewBookingRESTSuccessResponse)?.id) {
            alert('Rezerwacja utworzona pomyślnie!');
            if (addBookingFormEl) addBookingFormEl.reset();
            if (totalPriceEl) totalPriceEl.value = ""; // Resetuj pole ceny
            // Rozważ odświeżenie widoku lub przekierowanie, np. do profilu użytkownika
            // window.location.hash = '#/profil'; 
        } else {
            let errMsg = `Błąd tworzenia rezerwacji (Status: ${res.status}).`;
            const errorDetails = resData as ApiErrorResponse;

            if (errorDetails?.message) errMsg = errorDetails.message;
            else if (errorDetails?.Message) errMsg = errorDetails.Message;
            else if (errorDetails?.title && errorDetails?.errors) {
                const validationErrors = Object.entries(errorDetails.errors)
                    .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
                errMsg = `${errorDetails.title}:\n${validationErrors}`;
            } else if (bodyText && !resData) { // Jeśli nie udało się sparsować JSON, ale jest tekst
                errMsg += ` Odpowiedź serwera: ${bodyText}`;
            }
            alert(errMsg);
        }
    } catch (error: any) {
        responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
        console.error('Błąd podczas tworzenia rezerwacji:', error);
        alert('Wystąpił błąd sieciowy podczas próby utworzenia rezerwacji.');
    }
}


export async function fetchAndDisplayAllAdminBookings(): Promise<void> {
    console.log("fetchAndDisplayAllAdminBookings function CALLED");
    const rawEl = document.getElementById('adminBookingsResponseRaw') as HTMLPreElement | null;
    const listEl = document.getElementById('adminBookingsListFormatted') as HTMLElement | null;
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

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

    rawEl.textContent = 'Pobieranie wszystkich rezerwacji...';
    listEl.innerHTML = '<p style="text-align:center;">Ładowanie rezerwacji...</p>';

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        const unauthorizedMsg = 'Brak uprawnień do wyświetlenia tej sekcji. Wymagana jest rola Administratora.';
        listEl.innerHTML = `<p style="color:red; text-align:center;">${unauthorizedMsg}</p>`;
        rawEl.textContent = unauthorizedMsg;
        return;
    }

    const graphqlQuery = { 
        query: `
            query PobierzWszystkieRezerwacjeDlaAdmina {
              allBookingsForAdmin { 
                nodes {
                  id 
                  databaseId 
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

        const responseData = await response.json().catch(e => {
            console.error("Błąd parsowania JSON w fetchAndDisplayAllAdminBookings:", e);
            return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." }] } as GraphQLResponse<null>;
        }) as GraphQLResponse<AllBookingsAdminQueryData>;

        rawEl.textContent = JSON.stringify(responseData, null, 2);
        const bookingsDataContainer = responseData.data?.allBookingsForAdmin;

        if (response.ok && bookingsDataContainer?.nodes) {
            const bookings: Booking[] = bookingsDataContainer.nodes;
            if (bookings.length === 0) {
                listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych rezerwacji w systemie.</p>';
                return;
            }

            let html = `<h4 style="text-align:center;">Znaleziono rezerwacji: ${bookingsDataContainer.totalCount ?? bookings.length}</h4>`;
            bookings.forEach((booking: Booking) => {
                // ... (logika generowania HTML bez większych zmian, poza null-checkami i opcjonalnym chainingiem)
                const userName = booking.user?.name || 'Użytkownik nieznany';
                const userEmail = booking.user?.email || 'brak emaila';
                const apartmentName = booking.apartment?.name || 'Mieszkanie nieznane';
                const apartmentLocation = booking.apartment?.location || 'brak lokalizacji';
                const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'Brak';
                const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'Brak';
                const totalPrice = typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A';
                const bookingGuidForDelete = String(booking.databaseId || booking.id); // Preferuj databaseId jeśli istnieje

                const bookingDescription = `rezerwację dla ${userName} w ${apartmentName} (od ${checkIn} do ${checkOut})`;
                const safeBookingDescription = bookingDescription.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                const safeBookingGuid = bookingGuidForDelete.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                // Użyj databaseId jeśli dostępne i unikalne, inaczej globalne id
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

        } else if (responseData.errors) {
            // ... (obsługa błędów GraphQL bez zmian, poza upewnieniem się, że err.path istnieje)
            const errorMessages = responseData.errors.map(err => {
                let msg = err.message;
                if (err.path) msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                return msg;
            }).join('<br>');
            listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił błąd po stronie serwera podczas pobierania rezerwacji:<br>${errorMessages}</p>`;
            if (responseData.errors.some(e => e.extensions?.code === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")))) {
                alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                logoutUser();
            }
        } else {
            // ... (obsługa innych błędów bez zmian)
            listEl.innerHTML = `<p style="color:orange; text-align:center;">Otrzymano odpowiedź z serwera, ale dane rezerwacji są w nieoczekiwanym formacie lub ich brakuje. Status: ${response.status}</p>`;
        }
    } catch (error: any) {
        console.error('Krytyczny błąd sieciowy lub JavaScript w fetchAndDisplayAllAdminBookings:', error);
        if(rawEl) rawEl.textContent = 'Błąd krytyczny: ' + (error instanceof Error ? error.message : String(error));
        if(listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił krytyczny błąd podczas próby pobrania rezerwacji: ${error instanceof Error ? error.message : String(error)}.</p>`;
    }
}

export function confirmDeleteBooking(bookingLocalGuid: string, bookingDescription: string): void {
    console.log("confirmDeleteBooking CALLED for Local GUID:", bookingLocalGuid);
    if (confirm(`Czy na pewno chcesz usunąć ${bookingDescription} (ID: ${bookingLocalGuid})?`)) {
        deleteBooking(bookingLocalGuid); // ID przekazywane to databaseId (UUID)
    }
}

export async function deleteBooking(bookingLocalGuid: string): Promise<void> { // bookingLocalGuid to databaseId (UUID)
    console.log("deleteBooking CALLED for Local GUID:", bookingLocalGuid);
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Musisz być zalogowany jako Administrator, aby usunąć rezerwację.');
        return;
    }
    if (!bookingLocalGuid) {
        alert('Błąd wewnętrzny: Brak ID rezerwacji (GUID) do wysłania.');
        return;
    }

    const graphqlMutation = {
        query: `mutation UsunRezerwacje($id: UUID!) { deleteBooking(id: $id) }`, // $id to UUID
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

        if (response.ok && contentType && contentType.includes("application/json")) {
            responseData = await response.json() as GraphQLResponse<DeleteBookingMutationPayload>;
        } else if (response.ok) {
            const textResponse = await response.text();
            if (response.status === 204 || textResponse.trim().toLowerCase() === "true" || textResponse.trim() === "") {
                responseData = { data: { deleteBooking: true } };
            } else {
                try {
                    responseData = JSON.parse(textResponse) as GraphQLResponse<DeleteBookingMutationPayload>;
                    // Sprawdź, czy sparsowany obiekt ma strukturę błędu, jeśli tak, zachowaj
                    if (responseData && !(responseData as any).data && !(responseData as any).errors) {
                        responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}): ${textResponse}` }] };
                    }
                } catch (e) {
                    responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}), nie JSON: ${textResponse}` }] };
                }
            }
        } else {
            const errorText = await response.text();
            try {
                responseData = JSON.parse(errorText) as GraphQLResponse<DeleteBookingMutationPayload>;
                if (!responseData.errors) {
                    responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}): ${errorText}` }] };
                }
            } catch (e) {
                responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}), nie JSON: ${errorText}` }] };
            }
        }
    } catch (error: any) {
        console.error('Błąd sieciowy lub JavaScript w deleteBooking:', error);
        alert(`Wystąpił błąd sieciowy podczas usuwania rezerwacji: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }

    console.log("Odpowiedź serwera (deleteBooking) po przetworzeniu:", responseData);

    if (responseData?.data?.deleteBooking === true) {
        alert('Rezerwacja została pomyślnie usunięta!');
        handleRouteChange();
    } else {
        const errorMsg = responseData?.errors?.map(e => e.message).join('; ') || 'Nie udało się usunąć rezerwacji.';
        alert(`Błąd usuwania rezerwacji: ${errorMsg}`);
    }
}