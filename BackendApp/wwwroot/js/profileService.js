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
export function fetchMyProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("fetchMyProfile function CALLED");
        const rawEl = document.getElementById('myProfileResponseRaw');
        const formattedEl = document.getElementById('myProfileFormatted');
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
            rawEl.textContent = 'Użytkownik niezalogowany.';
            return;
        }
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
            const res = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentJwtToken}`
                },
                body: JSON.stringify(query)
            });
            const resData = yield res.json();
            rawEl.textContent = JSON.stringify(resData, null, 2);
            if ((_a = resData.data) === null || _a === void 0 ? void 0 : _a.myProfile) {
                const userProfile = resData.data.myProfile;
                let html = `<div class="data-card"><h4>Profil: ${userProfile.name || 'N/A'}</h4><p><strong>ID (GraphQL):</strong> ${userProfile.id || 'N/A'}</p><p><strong>Email:</strong> ${userProfile.email || 'N/A'}</p></div>`;
                if ((_b = userProfile.bookings) === null || _b === void 0 ? void 0 : _b.nodes) {
                    html += `<div class="data-card"><h4>Moje Rezerwacje (${userProfile.bookings.totalCount || 0})</h4>`;
                    if (userProfile.bookings.nodes.length > 0) {
                        html += '<ul class="reviews-list">';
                        userProfile.bookings.nodes.forEach((booking) => {
                            var _a, _b, _c;
                            const bookingHtmlIdBase = booking.databaseId || booking.id;
                            const bookingHtmlId = `booking-item-${bookingHtmlIdBase.replace(/[^a-zA-Z0-9_-]/g, "")}`;
                            html += `<li class="review-item" id="${bookingHtmlId}">`;
                            html += `<p><strong>Rezerwacja ID (GraphQL):</strong> ${booking.id}</p>
                                 <p><strong>Mieszkanie:</strong> ${((_a = booking.apartment) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'} (${((_b = booking.apartment) === null || _b === void 0 ? void 0 : _b.location) || 'N/A'})</p>
                                 <p><strong>Od:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Do:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('pl-PL') : 'N/A'}</p>
                                 <p><strong>Cena:</strong> ${typeof booking.totalPrice === 'number' ? booking.totalPrice.toFixed(2) : 'N/A'} PLN</p>`;
                            if (currentUserRole === 'Admin' && booking.databaseId) {
                                const bookingLocalGuidString = String(booking.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                                const bookingDescription = ('rezerwację mieszkania ' + (((_c = booking.apartment) === null || _c === void 0 ? void 0 : _c.name) || 'N/A'))
                                    .replace(/\\/g, '\\\\')
                                    .replace(/'/g, "\\'")
                                    .replace(/"/g, '\\"');
                                html += `<button onclick="confirmDeleteBooking('${bookingLocalGuidString}', '${bookingDescription}')" class="action-button-secondary" style="font-size:0.8em; padding:3px 6px; background-color: #e67e22; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń rezerwację</button>`;
                            }
                            html += `</li>`;
                        });
                        html += '</ul>';
                    }
                    else {
                        html += '<p>Brak rezerwacji.</p>';
                    }
                    html += `</div>`;
                }
                formattedEl.innerHTML = html;
            }
            else if (resData.errors && resData.errors.length > 0) {
                const errorMessages = resData.errors.map((err) => {
                    let msg = err.message;
                    if (err.path)
                        msg += ` (Ścieżka: ${err.path.join(' > ')})`;
                    return msg;
                }).join('\n');
                formattedEl.innerHTML = `<p style="color:red;">Wystąpił błąd przy pobieraniu profilu:<br>${errorMessages.replace(/\n/g, '<br>')}</p>`;
                console.error("GraphQL errors (fetchMyProfile):", resData.errors);
                if (resData.errors.some(e => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === 'AUTH_NOT_AUTHORIZED' || (e.message && e.message.toLowerCase().includes("auth")); })) {
                    alert("Sesja wygasła lub brak uprawnień. Zostaniesz wylogowany.");
                    logoutUser();
                }
            }
            else {
                formattedEl.innerHTML = '<p>Nie udało się pobrać profilu lub profil nie istnieje.</p>';
                console.warn("Dane profilu nie zostały znalezione w odpowiedzi:", resData);
            }
        }
        catch (error) {
            if (rawEl)
                rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
            if (formattedEl)
                formattedEl.innerHTML = '<p style="color:red;">Błąd sieci.</p>';
            console.error("Błąd sieciowy (fetchMyProfile):", error);
        }
    });
}
//# sourceMappingURL=profileService.js.map