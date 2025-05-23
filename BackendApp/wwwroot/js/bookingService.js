var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { logoutUser } from './authService.js';
import { handleRouteChange } from './router.js';
export function calculateTotalPrice() {
    console.log("calculateTotalPrice function CALLED");
    const apartmentSelectEl = document.getElementById('bookingApartmentSelect');
    const checkInDateEl = document.getElementById('bookingCheckInDate');
    const checkOutDateEl = document.getElementById('bookingCheckOutDate');
    const totalPriceEl = document.getElementById('bookingTotalPrice');
    if (!apartmentSelectEl || !checkInDateEl || !checkOutDateEl || !totalPriceEl) {
        if (totalPriceEl)
            totalPriceEl.value = "";
        return;
    }
    const selectedOption = apartmentSelectEl.options[apartmentSelectEl.selectedIndex];
    const pricePerNightStr = selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.dataset.pricePerNight;
    if (pricePerNightStr && checkInDateEl.value && checkOutDateEl.value) {
        const pricePerNight = parseFloat(pricePerNightStr);
        const checkIn = new Date(checkInDateEl.value);
        const checkOut = new Date(checkOutDateEl.value);
        if (!isNaN(pricePerNight) && pricePerNight > 0 && checkIn < checkOut) {
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (nights > 0) {
                totalPriceEl.value = (nights * pricePerNight).toFixed(2);
            }
            else {
                totalPriceEl.value = "0.00";
            }
        }
        else {
            totalPriceEl.value = "";
        }
    }
    else {
        totalPriceEl.value = "";
    }
}
export function submitBooking() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("submitBooking function CALLED");
        const responseEl = document.getElementById('addBookingResponse');
        if (!responseEl) {
            console.error("Element addBookingResponse nie został znaleziony.");
            return;
        }
        responseEl.textContent = 'Przetwarzanie rezerwacji...';
        const currentJwtToken = getJwtToken();
        if (!currentJwtToken) {
            alert('Musisz być zalogowany, aby dokonać rezerwacji.');
            responseEl.textContent = 'Brak autoryzacji.';
            window.location.hash = '#/';
            return;
        }
        const apartmentIdEl = document.getElementById('bookingApartmentSelect');
        const checkInDateEl = document.getElementById('bookingCheckInDate');
        const checkOutDateEl = document.getElementById('bookingCheckOutDate');
        const totalPriceEl = document.getElementById('bookingTotalPrice');
        const addBookingFormEl = document.getElementById('addBookingForm');
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
        const bookingData = { apartmentId, checkInDate, checkOutDate, totalPrice };
        try {
            const res = yield fetch(`${backendAppUrl}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(bookingData)
            });
            const bodyText = yield res.text();
            let resData = null;
            if (bodyText) {
                try {
                    resData = JSON.parse(bodyText);
                }
                catch (e) {
                    console.warn("Odpowiedź z API /api/bookings nie była poprawnym JSON:", bodyText);
                }
            }
            responseEl.textContent = resData ? JSON.stringify(resData, null, 2) : `Status: ${res.status}. Odpowiedź: ${bodyText || '(pusta)'}`;
            if (res.ok && (resData === null || resData === void 0 ? void 0 : resData.id)) {
                alert('Rezerwacja utworzona pomyślnie!');
                if (addBookingFormEl)
                    addBookingFormEl.reset();
                if (totalPriceEl)
                    totalPriceEl.value = "";
            }
            else {
                let errMsg = `Błąd tworzenia rezerwacji (Status: ${res.status}).`;
                const errorDetails = resData;
                if (errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.message)
                    errMsg = errorDetails.message;
                else if (errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.Message)
                    errMsg = errorDetails.Message;
                else if ((errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.title) && (errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.errors)) {
                    const validationErrors = Object.entries(errorDetails.errors)
                        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                        .join('\n');
                    errMsg = `${errorDetails.title}:\n${validationErrors}`;
                }
                else if (bodyText && !resData) {
                    errMsg += ` Odpowiedź serwera: ${bodyText}`;
                }
                alert(errMsg);
            }
        }
        catch (error) {
            responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
            console.error('Błąd podczas tworzenia rezerwacji:', error);
            alert('Wystąpił błąd sieciowy podczas próby utworzenia rezerwacji.');
        }
    });
}
export function fetchAndDisplayAllAdminBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("fetchAndDisplayAllAdminBookings function CALLED");
        const rawEl = document.getElementById('adminBookingsResponseRaw');
        const listEl = document.getElementById('adminBookingsListFormatted');
        const currentJwtToken = getJwtToken();
        const currentUserRole = getUserRole();
        if (!rawEl) {
            console.error("Element adminBookingsResponseRaw nie został znaleziony w DOM.");
            if (listEl)
                listEl.innerHTML = '<p style="color:red; text-align:center;">Błąd wewnętrzny strony: Nie można wyświetlić surowych danych.</p>';
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
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(graphqlQuery)
            });
            const responseData = yield response.json().catch(e => {
                console.error("Błąd parsowania JSON w fetchAndDisplayAllAdminBookings:", e);
                return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." }] };
            });
            rawEl.textContent = JSON.stringify(responseData, null, 2);
            const bookingsDataContainer = (_a = responseData.data) === null || _a === void 0 ? void 0 : _a.allBookingsForAdmin;
            if (response.ok && (bookingsDataContainer === null || bookingsDataContainer === void 0 ? void 0 : bookingsDataContainer.nodes)) {
                const bookings = bookingsDataContainer.nodes;
                if (bookings.length === 0) {
                    listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych rezerwacji w systemie.</p>';
                    return;
                }
                let html = `<h4 style="text-align:center;">Znaleziono rezerwacji: ${(_b = bookingsDataContainer.totalCount) !== null && _b !== void 0 ? _b : bookings.length}</h4>`;
                bookings.forEach((booking) => {
                    var _a, _b, _c, _d;
                    const userName = ((_a = booking.user) === null || _a === void 0 ? void 0 : _a.name) || 'Użytkownik nieznany';
                    const userEmail = ((_b = booking.user) === null || _b === void 0 ? void 0 : _b.email) || 'brak emaila';
                    const apartmentName = ((_c = booking.apartment) === null || _c === void 0 ? void 0 : _c.name) || 'Mieszkanie nieznane';
                    const apartmentLocation = ((_d = booking.apartment) === null || _d === void 0 ? void 0 : _d.location) || 'brak lokalizacji';
                    const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'Brak';
                    const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'Brak';
                    const totalPrice = typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A';
                    const bookingGuidForDelete = String(booking.databaseId || booking.id);
                    const bookingDescription = `rezerwację dla ${userName} w ${apartmentName} (od ${checkIn} do ${checkOut})`;
                    const safeBookingDescription = bookingDescription.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                    const safeBookingGuid = bookingGuidForDelete.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                    const bookingHtmlIdBase = booking.databaseId || booking.id || Math.random().toString(36).substring(2, 9);
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
            }
            else if (responseData.errors) {
                const errorMessages = responseData.errors.map(err => {
                    let msg = err.message;
                    if (err.path)
                        msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                    return msg;
                }).join('<br>');
                listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił błąd po stronie serwera podczas pobierania rezerwacji:<br>${errorMessages}</p>`;
                if (responseData.errors.some(e => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")); })) {
                    alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                    logoutUser();
                }
            }
            else {
                listEl.innerHTML = `<p style="color:orange; text-align:center;">Otrzymano odpowiedź z serwera, ale dane rezerwacji są w nieoczekiwanym formacie lub ich brakuje. Status: ${response.status}</p>`;
            }
        }
        catch (error) {
            console.error('Krytyczny błąd sieciowy lub JavaScript w fetchAndDisplayAllAdminBookings:', error);
            if (rawEl)
                rawEl.textContent = 'Błąd krytyczny: ' + (error instanceof Error ? error.message : String(error));
            if (listEl)
                listEl.innerHTML = `<p style="color:red; text-align:center;">Wystąpił krytyczny błąd podczas próby pobrania rezerwacji: ${error instanceof Error ? error.message : String(error)}.</p>`;
        }
    });
}
export function confirmDeleteBooking(bookingLocalGuid, bookingDescription) {
    console.log("confirmDeleteBooking CALLED for Local GUID:", bookingLocalGuid);
    if (confirm(`Czy na pewno chcesz usunąć ${bookingDescription} (ID: ${bookingLocalGuid})?`)) {
        deleteBooking(bookingLocalGuid);
    }
}
export function deleteBooking(bookingLocalGuid) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
            query: `mutation UsunRezerwacje($id: UUID!) { deleteBooking(id: $id) }`,
            variables: { id: bookingLocalGuid }
        };
        let responseData;
        try {
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(graphqlMutation),
            });
            const contentType = response.headers.get("content-type");
            if (response.ok && contentType && contentType.includes("application/json")) {
                responseData = (yield response.json());
            }
            else if (response.ok) {
                const textResponse = yield response.text();
                if (response.status === 204 || textResponse.trim().toLowerCase() === "true" || textResponse.trim() === "") {
                    responseData = { data: { deleteBooking: true } };
                }
                else {
                    try {
                        responseData = JSON.parse(textResponse);
                        if (responseData && !responseData.data && !responseData.errors) {
                            responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}): ${textResponse}` }] };
                        }
                    }
                    catch (e) {
                        responseData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa (status ${response.status}), nie JSON: ${textResponse}` }] };
                    }
                }
            }
            else {
                const errorText = yield response.text();
                try {
                    responseData = JSON.parse(errorText);
                    if (!responseData.errors) {
                        responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}): ${errorText}` }] };
                    }
                }
                catch (e) {
                    responseData = { errors: [{ message: `Błąd serwera HTTP (status ${response.status}), nie JSON: ${errorText}` }] };
                }
            }
        }
        catch (error) {
            console.error('Błąd sieciowy lub JavaScript w deleteBooking:', error);
            alert(`Wystąpił błąd sieciowy podczas usuwania rezerwacji: ${error instanceof Error ? error.message : String(error)}`);
            return;
        }
        console.log("Odpowiedź serwera (deleteBooking) po przetworzeniu:", responseData);
        if (((_a = responseData === null || responseData === void 0 ? void 0 : responseData.data) === null || _a === void 0 ? void 0 : _a.deleteBooking) === true) {
            alert('Rezerwacja została pomyślnie usunięta!');
            handleRouteChange();
        }
        else {
            const errorMsg = ((_b = responseData === null || responseData === void 0 ? void 0 : responseData.errors) === null || _b === void 0 ? void 0 : _b.map(e => e.message).join('; ')) || 'Nie udało się usunąć rezerwacji.';
            alert(`Błąd usuwania rezerwacji: ${errorMsg}`);
        }
    });
}
//# sourceMappingURL=bookingService.js.map