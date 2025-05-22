// profileService.ts
import { backendAppUrl } from './config.js'; // Poprawiony import
import { getJwtToken, getUserRole } from './state.js';
import { logoutUser } from './authService.js'; // Poprawiony import

// Importy typów
import {
    UserProfile,
    Booking,
    GraphQLResponse,
    MyProfileQueryData,
    ApiError // Upewnij się, że ApiError jest zdefiniowany w types.ts
} from './types.js';

// Funkcja confirmDeleteBooking jest wywoływana z HTML (onclick).
// Zakładamy, że będzie dostępna globalnie (np. przypisana do window w main.ts)
// lub obsłużona przez delegację zdarzeń. Nie ma potrzeby jej tu importować,
// chyba że chcielibyśmy programistycznie dodawać event listenery.

export async function fetchMyProfile(): Promise<void> {
    console.log("fetchMyProfile function CALLED");
    const rawEl = document.getElementById('myProfileResponseRaw') as HTMLPreElement | null;
    const formattedEl = document.getElementById('myProfileFormatted') as HTMLElement | null;
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!rawEl || !formattedEl) {
        console.error("Brakuje elementów DOM: myProfileResponseRaw lub myProfileFormatted.");
        return;
    }
    rawEl.textContent = 'Pobieranie profilu...';
    formattedEl.innerHTML = '<p>Ładowanie...</p>';

    if (!currentJwtToken) {
        formattedEl.innerHTML = '<p style="color:orange;">Nie jesteś zalogowany.</p>';
        return;
    }

    const query = { // Zapytanie GraphQL bez zmian
        query: `
            query MojeDane { 
              myProfile { 
                id 
                name 
                email 
                bookings { 
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
                  } 
                  totalCount 
                } 
              } 
            }`
    };

    try {
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(query)
        });

        const resData = await res.json() as GraphQLResponse<MyProfileQueryData>;
        rawEl.textContent = JSON.stringify(resData, null, 2);

        if (resData.data?.myProfile) {
            const userProfile: UserProfile = resData.data.myProfile; // Silne typowanie profilu
            let html = `<div class="data-card"><h4>Profil: ${userProfile.name || 'N/A'}</h4><p><strong>ID (GraphQL):</strong> ${userProfile.id || 'N/A'}</p><p><strong>Email:</strong> ${userProfile.email || 'N/A'}</p></div>`;

            if (userProfile.bookings?.nodes) {
                html += `<div class="data-card"><h4>Moje Rezerwacje (${userProfile.bookings.totalCount || 0})</h4>`;
                if (userProfile.bookings.nodes.length > 0) {
                    html += '<ul class="reviews-list">';
                    userProfile.bookings.nodes.forEach((booking: Booking) => {
                        // Bezpieczne generowanie ID dla elementu HTML
                        const bookingHtmlIdBase = booking.databaseId || booking.id; // Preferuj databaseId
                        const bookingHtmlId = `booking-item-${bookingHtmlIdBase.replace(/[^a-zA-Z0-9_-]/g, "")}`;

                        html += `<li class="review-item" id="${bookingHtmlId}">`;
                        html += `<p><strong>Rezerwacja ID (GraphQL):</strong> ${booking.id}</p>
                                 <p><strong>Mieszkanie:</strong> ${booking.apartment?.name || 'N/A'} (${booking.apartment?.location || 'N/A'})</p>
                                 <p><strong>Od:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Do:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Cena:</strong> ${typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A'} PLN</p>`;

                        if (currentUserRole === 'Admin' && booking.databaseId) {
                            const bookingLocalGuidString = String(booking.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            const bookingDescription = ('rezerwację mieszkania ' + (booking.apartment?.name || 'N/A'))
                                .replace(/\\/g, '\\\\')
                                .replace(/'/g, "\\'")
                                .replace(/"/g, '\\"');
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
            formattedEl.innerHTML = html;
        } else if (resData.errors && resData.errors.length > 0) {
            const errorMessages = resData.errors.map((err: ApiError) => {
                let msg = err.message;
                if (err.path) msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                return msg;
            }).join('\n');
            formattedEl.innerHTML = `<p style="color:red;">Wystąpił błąd przy pobieraniu profilu:<br>${errorMessages.replace(/\n/g, '<br>')}</p>`;
            console.error("GraphQL errors (fetchMyProfile):", resData.errors);

            if (resData.errors.some(e => e.extensions?.code === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")))) {
                alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                logoutUser();
            }
        } else {
            // Przypadek, gdy resData.data jest puste lub resData.data.myProfile jest null
            formattedEl.innerHTML = '<p>Nie udało się pobrać profilu lub profil nie istnieje.</p>';
            console.warn("Dane profilu nie zostały znalezione w odpowiedzi:", resData);
        }
    } catch (error: any) {
        if (rawEl) rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
        if (formattedEl) formattedEl.innerHTML = '<p style="color:red;">Błąd sieci.</p>';
        console.error("Błąd sieciowy (fetchMyProfile):", error);
    }
}