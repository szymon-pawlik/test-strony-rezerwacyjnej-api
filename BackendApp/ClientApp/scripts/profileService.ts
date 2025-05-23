// Importy konfiguracji, stanu, funkcji autoryzacji oraz typów
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { logoutUser } from './authService.js'; // Używane do wylogowania przy błędach autoryzacji

import {
    UserProfile,
    Booking,
    GraphQLResponse,
    MyProfileQueryData, // Typ dla danych odpowiedzi zapytania o profil
    ApiError
} from './types.js';

/**
 * Pobiera i wyświetla dane profilu zalogowanego użytkownika,
 * w tym jego dane osobowe oraz listę dokonanych rezerwacji.
 * Wymaga, aby użytkownik był zalogowany (posiadał ważny token JWT).
 */
export async function fetchMyProfile(): Promise<void> {
    console.log("fetchMyProfile function CALLED");
    // Pobranie elementów DOM do wyświetlania surowej odpowiedzi JSON i sformatowanych danych
    const rawEl = document.getElementById('myProfileResponseRaw') as HTMLPreElement | null;
    const formattedEl = document.getElementById('myProfileFormatted') as HTMLElement | null;
    const currentJwtToken = getJwtToken(); // Pobranie tokenu JWT aktualnie zalogowanego użytkownika
    const currentUserRole = getUserRole(); // Pobranie roli aktualnie zalogowanego użytkownika

    // Sprawdzenie, czy elementy DOM istnieją
    if (!rawEl || !formattedEl) {
        console.error("Brakuje elementów DOM: myProfileResponseRaw lub myProfileFormatted.");
        return;
    }
    // Ustawienie początkowych komunikatów "ładowanie"
    rawEl.textContent = 'Pobieranie profilu...';
    formattedEl.innerHTML = '<p>Ładowanie...</p>';

    // Jeśli użytkownik nie jest zalogowany, wyświetl odpowiedni komunikat
    if (!currentJwtToken) {
        formattedEl.innerHTML = '<p style="color:orange;">Nie jesteś zalogowany.</p>';
        rawEl.textContent = 'Użytkownik niezalogowany.';
        return;
    }

    // Zapytanie GraphQL do pobrania danych profilu użytkownika oraz jego rezerwacji
    const query = {
        query: `
            query MojeDane { 
              myProfile { 
                id          # Globalne ID GraphQL użytkownika
                name 
                email 
                bookings {  # Lista rezerwacji użytkownika
                  nodes { 
                    id          # Globalne ID GraphQL rezerwacji
                    databaseId  # UUID rezerwacji z bazy danych (używane do operacji CRUD)
                    checkInDate 
                    checkOutDate 
                    totalPrice 
                    apartment { # Dane mieszkania powiązanego z rezerwacją
                      id 
                      name 
                      location 
                    } 
                  } 
                  totalCount # Całkowita liczba rezerwacji
                } 
              } 
            }`
    };

    try {
        // Wysłanie żądania do endpointu GraphQL
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentJwtToken}` // Dołączenie tokenu JWT do nagłówka autoryzacji
            },
            body: JSON.stringify(query)
        });

        const resData = await res.json() as GraphQLResponse<MyProfileQueryData>;
        rawEl.textContent = JSON.stringify(resData, null, 2); // Wyświetlenie surowej odpowiedzi JSON

        // Jeśli dane profilu zostały pomyślnie pobrane
        if (resData.data?.myProfile) {
            const userProfile: UserProfile = resData.data.myProfile;
            // Budowanie HTML do wyświetlenia danych profilu
            let html = `<div class="data-card"><h4>Profil: ${userProfile.name || 'N/A'}</h4><p><strong>ID (GraphQL):</strong> ${userProfile.id || 'N/A'}</p><p><strong>Email:</strong> ${userProfile.email || 'N/A'}</p></div>`;

            // Wyświetlanie rezerwacji użytkownika, jeśli istnieją
            if (userProfile.bookings?.nodes) {
                html += `<div class="data-card"><h4>Moje Rezerwacje (${userProfile.bookings.totalCount || 0})</h4>`;
                if (userProfile.bookings.nodes.length > 0) {
                    html += '<ul class="reviews-list">'; // Użycie klas zdefiniowanych dla list (np. recenzji) dla spójności wyglądu
                    userProfile.bookings.nodes.forEach((booking: Booking) => {
                        // Generowanie bezpiecznego ID dla elementu HTML
                        const bookingHtmlIdBase = booking.databaseId || booking.id;
                        const bookingHtmlId = `booking-item-${bookingHtmlIdBase.replace(/[^a-zA-Z0-9_-]/g, "")}`;

                        html += `<li class="review-item" id="${bookingHtmlId}">`; // Stylizacja elementu listy jak elementu recenzji
                        html += `<p><strong>Rezerwacja ID (GraphQL):</strong> ${booking.id}</p>
                                 <p><strong>Mieszkanie:</strong> ${booking.apartment?.name || 'N/A'} (${booking.apartment?.location || 'N/A'})</p>
                                 <p><strong>Od:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Do:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Cena:</strong> ${typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A'} PLN</p>`;

                        // Dodanie przycisku usuwania rezerwacji dla administratora
                        if (currentUserRole === 'Admin' && booking.databaseId) {
                            // Przygotowanie parametrów dla funkcji confirmDeleteBooking, zabezpieczając je
                            const bookingLocalGuidString = String(booking.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            const bookingDescription = ('rezerwację mieszkania ' + (booking.apartment?.name || 'N/A'))
                                .replace(/\\/g, '\\\\') // escape backslashes
                                .replace(/'/g, "\\'")   // escape single quotes
                                .replace(/"/g, '\\"');  // escape double quotes
                            html += `<button onclick="confirmDeleteBooking('${bookingLocalGuidString}', '${bookingDescription}')" class="action-button-secondary" style="font-size:0.8em; padding:3px 6px; background-color: #e67e22; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń rezerwację</button>`;
                        }
                        html += `</li>`;
                    });
                    html += '</ul>';
                } else {
                    html += '<p>Brak rezerwacji.</p>';
                }
                html += `</div>`;
            }
            formattedEl.innerHTML = html; // Wstawienie wygenerowanego HTML do elementu na stronie
        } else if (resData.errors && resData.errors.length > 0) { // Obsługa błędów GraphQL
            const errorMessages = resData.errors.map((err: ApiError) => {
                let msg = err.message;
                if (err.path) msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                return msg;
            }).join('\n');
            formattedEl.innerHTML = `<p style="color:red;">Wystąpił błąd przy pobieraniu profilu:<br>${errorMessages.replace(/\n/g, '<br>')}</p>`;
            console.error("GraphQL errors (fetchMyProfile):", resData.errors);

            // Automatyczne wylogowanie, jeśli błąd jest związany z autoryzacją
            if (resData.errors.some(e => e.extensions?.code === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")))) {
                alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                logoutUser(); // Wylogowanie użytkownika
            }
        } else { // Jeśli nie ma danych ani błędów (nieoczekiwana odpowiedź)
            formattedEl.innerHTML = '<p>Nie udało się pobrać profilu lub profil nie istnieje.</p>';
            console.warn("Dane profilu nie zostały znalezione w odpowiedzi:", resData);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        if (rawEl) rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
        if (formattedEl) formattedEl.innerHTML = '<p style="color:red;">Błąd sieci.</p>';
        console.error("Błąd sieciowy (fetchMyProfile):", error);
    }
}