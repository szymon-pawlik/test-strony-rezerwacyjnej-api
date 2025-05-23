// Importy konfiguracji, funkcji stanu, serwisów API oraz typów
import { allPageSections } from './config.js';
import { getUserRole, getJwtToken } from './state.js';
import { fetchApartmentsForSelect } from './apartmentService.js';
import { Ticket, TicketReply, MyTicketsResponse, DecodedJwtToken } from './types.js'; // DecodedJwtToken nie jest tu bezpośrednio używany, ale parseJwt jest
import { fetchAllTicketsForAdmin, fetchMyTickets } from './ticketApiService.js';
import { parseJwt } from './utils.js'; // Używane do weryfikacji tokena (choć tu nie widać bezpośredniego użycia, może być w przyszłości)

// Prosty, prywatny obiekt loggera do spójnego formatowania komunikatów w konsoli
const _logger = {
    LogInformation: (...args: any[]) => console.log('[INFO] uiService:', ...args),
    LogWarning: (...args: any[]) => console.warn('[WARN] uiService:', ...args),
    LogError: (...args: any[]) => console.error('[ERROR] uiService:', ...args),
};

/**
 * Pokazuje wybraną sekcję strony, ukrywając wszystkie inne.
 * @param sectionIdToShow ID elementu HTML sekcji, która ma zostać pokazana.
 */
export function showSection(sectionIdToShow: string): void {
    // Iteracja przez wszystkie zdefiniowane sekcje strony
    allPageSections.forEach((id: string) => {
        const section = document.getElementById(id) as HTMLElement | null;
        if (section) {
            // Dodanie lub usunięcie klasy 'hidden-section' w zależności od tego, czy ID pasuje do sectionIdToShow
            section.classList.toggle('hidden-section', id !== sectionIdToShow);
        }
    });
}

/**
 * Aktualizuje interfejs użytkownika (np. nawigację, status logowania)
 * w zależności od tego, czy użytkownik jest zalogowany i jaką ma rolę.
 */
export function updateLoginState(): void {
    const isLoggedIn: boolean = !!getJwtToken(); // Sprawdzenie, czy istnieje token JWT (czy użytkownik jest zalogowany)
    const currentUserRole: string | null = getUserRole(); // Pobranie roli zalogowanego użytkownika

    // Zebranie referencji do kluczowych elementów UI, które będą modyfikowane
    const elements: { [key: string]: HTMLElement | null } = {
        loginStatusEl: document.getElementById('loginStatus'),
        userRoleDisplayEl: document.getElementById('userRoleDisplay'),
        logoutButtonEl: document.getElementById('logoutButton'),
        navLogin: document.getElementById('navLogin'),
        navRegister: document.getElementById('navRegister'),
        navMyProfile: document.getElementById('navMyProfile'),
        navAddReview: document.getElementById('navAddReview'),
        navBookApartment: document.getElementById('navBookApartment'),
        navSubmitTicket: document.getElementById('navSubmitTicket'),
        navMyTickets: document.getElementById('navMyTickets'),
        navAddApartment: document.getElementById('navAddApartment'), // Link dla admina
        navAdminBookings: document.getElementById('navAdminBookings'), // Link dla admina
        navAdminUsers: document.getElementById('navAdminUsers'),       // Link dla admina
        navAdminTickets: document.getElementById('navAdminTickets'),   // Link dla admina
        reviewApartmentSelectEl: document.getElementById('reviewApartmentSelect'), // Select mieszkania w formularzu recenzji
        bookingApartmentSelectEl: document.getElementById('bookingApartmentSelect'),// Select mieszkania w formularzu rezerwacji
        totalPriceEl: document.getElementById('bookingTotalPrice'),       // Pole z całkowitą ceną rezerwacji
        myProfileFormattedEl: document.getElementById('myProfileFormatted') // Kontener na dane profilu
    };

    if (isLoggedIn && currentUserRole) { // Jeśli użytkownik jest zalogowany
        if (elements.loginStatusEl) elements.loginStatusEl.textContent = 'Zalogowany';
        if (elements.userRoleDisplayEl) elements.userRoleDisplayEl.textContent = currentUserRole;
        if (elements.logoutButtonEl) elements.logoutButtonEl.classList.remove('hidden-section'); // Pokaż przycisk wylogowania

        // Ukryj linki logowania i rejestracji
        elements.navLogin?.classList.add('hidden-section');
        elements.navRegister?.classList.add('hidden-section');
        // Pokaż linki dostępne dla zalogowanych użytkowników
        elements.navMyProfile?.classList.remove('hidden-section');
        elements.navAddReview?.classList.remove('hidden-section');
        elements.navBookApartment?.classList.remove('hidden-section');
        elements.navSubmitTicket?.classList.remove('hidden-section');
        elements.navMyTickets?.classList.remove('hidden-section');

        // Pokaż/ukryj linki administracyjne w zależności od roli
        if (currentUserRole === 'Admin') {
            elements.navAddApartment?.classList.remove('hidden-section');
            elements.navAdminBookings?.classList.remove('hidden-section');
            elements.navAdminUsers?.classList.remove('hidden-section');
            elements.navAdminTickets?.classList.remove('hidden-section');
        } else {
            elements.navAddApartment?.classList.add('hidden-section');
            elements.navAdminBookings?.classList.add('hidden-section');
            elements.navAdminUsers?.classList.add('hidden-section');
            elements.navAdminTickets?.classList.add('hidden-section');
        }
        fetchApartmentsForSelect(); // Załaduj mieszkania do list wyboru (np. w formularzu recenzji/rezerwacji)
    } else { // Jeśli użytkownik nie jest zalogowany
        if (elements.loginStatusEl) elements.loginStatusEl.textContent = 'Niezalogowany';
        if (elements.userRoleDisplayEl) elements.userRoleDisplayEl.textContent = '-';
        if (elements.logoutButtonEl) elements.logoutButtonEl.classList.add('hidden-section'); // Ukryj przycisk wylogowania

        // Pokaż linki logowania i rejestracji
        elements.navLogin?.classList.remove('hidden-section');
        elements.navRegister?.classList.remove('hidden-section');
        // Ukryj linki dla zalogowanych użytkowników
        elements.navMyProfile?.classList.add('hidden-section');
        elements.navAddReview?.classList.add('hidden-section');
        elements.navBookApartment?.classList.add('hidden-section');
        elements.navSubmitTicket?.classList.add('hidden-section');
        elements.navMyTickets?.classList.add('hidden-section');
        elements.navAddApartment?.classList.add('hidden-section');
        elements.navAdminBookings?.classList.add('hidden-section');
        elements.navAdminUsers?.classList.add('hidden-section');
        elements.navAdminTickets?.classList.add('hidden-section');

        // Wyczyść/zresetuj elementy formularzy, które wymagają zalogowania
        const reviewSelect = elements.reviewApartmentSelectEl as HTMLSelectElement | null;
        const bookingSelect = elements.bookingApartmentSelectEl as HTMLSelectElement | null;
        if (reviewSelect) reviewSelect.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (bookingSelect) bookingSelect.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (elements.totalPriceEl) (elements.totalPriceEl as HTMLInputElement).value = "";
        if (elements.myProfileFormattedEl) elements.myProfileFormattedEl.innerHTML = ''; // Wyczyść wyświetlane dane profilu
    }

    // Pokaż/ukryj kontenery z surowymi danymi JSON w zależności od tego, czy użytkownik jest adminem
    const adminJsonContainers = document.querySelectorAll('.admin-json-container');
    adminJsonContainers.forEach((containerNode: Node) => {
        if (containerNode instanceof HTMLElement) {
            containerNode.style.display = (currentUserRole === 'Admin') ? 'block' : 'none';
        }
    });
}

/**
 * Funkcja pomocnicza do "uciekania" znaków specjalnych HTML,
 * aby zapobiec atakom XSS przy wyświetlaniu danych pochodzących od użytkownika.
 * @param unsafeInput Dowolna wartość, która zostanie przekonwertowana na string.
 * @returns Bezpieczny string HTML.
 */
function escapeHtml(unsafeInput: any): string {
    if (unsafeInput === null || typeof unsafeInput === 'undefined') {
        return ''; // Zwróć pusty string dla null/undefined
    }
    const unsafeString = String(unsafeInput); // Konwersja na string
    return unsafeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Renderuje listę zgłoszeń (ticketów) w panelu administratora.
 * @param tickets Tablica obiektów Ticket.
 * @param totalCount Całkowita liczba zgłoszeń (dla paginacji).
 * @param currentPage Numer bieżącej strony (dla paginacji).
 * @param pageSize Rozmiar strony (dla paginacji).
 */
export function renderAdminTicketsList(
    tickets: Ticket[],
    totalCount: number,
    currentPage: number,
    pageSize: number
): void {
    const listEl = document.getElementById('adminTicketsListFormatted') as HTMLElement | null;
    const paginationControlsEl = document.getElementById('adminTicketsPaginationControls') as HTMLElement | null;

    if (!listEl) {
        _logger.LogError("Element adminTicketsListFormatted nie został znaleziony w DOM.");
        return;
    }

    if (!tickets || tickets.length === 0) { // Jeśli brak zgłoszeń
        listEl.innerHTML = '<p style="text-align:center;">Brak zgłoszeń do wyświetlenia.</p>';
        if (paginationControlsEl) paginationControlsEl.innerHTML = ''; // Wyczyść kontrolki paginacji
        return;
    }

    // Budowanie tabeli HTML z listą zgłoszeń
    let html = `<h4 style="text-align:center;">Znaleziono zgłoszeń: ${totalCount}</h4>`;
    html += `<table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Temat</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Utworzenia</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Akcje</th></tr></thead><tbody>`;

    tickets.forEach(ticket => {
        const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Brak danych';
        html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;" title="${ticket.id}">${ticket.id ? ticket.id.substring(0,8) + '...' : 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.subject)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.userEmail)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.status)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${createdAtDate}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button class="action-button-secondary" style="font-size: 0.8em; padding: 3px 6px;" onclick="window.viewTicketDetails('${ticket.id}')">Zobacz</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    listEl.innerHTML = html; // Wstawienie wygenerowanego HTML do kontenera

    // Renderowanie kontrolek paginacji, jeśli są potrzebne
    if (paginationControlsEl) {
        renderGenericPagination(paginationControlsEl, currentPage, Math.ceil(totalCount / pageSize),
            // Callback wywoływany przy zmianie strony w paginacji
            (page) => {
                fetchAllTicketsForAdmin(page, pageSize) // Pobierz zgłoszenia dla nowej strony
                    .then(ticketData => {
                        // Ponowne renderowanie listy z nowymi danymi
                        if (ticketData) renderAdminTicketsList(ticketData.items, ticketData.totalCount, ticketData.pageNumber, ticketData.pageSize);
                    })
                    .catch(error => { // Obsługa błędu pobierania danych
                        if (listEl) listEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania zgłoszeń: ${error.message}</p>`;
                    });
            }
        );
    }
}

/**
 * Renderuje szczegóły pojedynczego zgłoszenia w panelu administratora.
 * @param ticket Obiekt Ticket zawierający dane zgłoszenia, lub null jeśli błąd.
 */
export function renderAdminTicketDetail(ticket: Ticket | null): void {
    const detailEl = document.getElementById('adminTicketDetailFormatted') as HTMLElement | null;
    const replyFormTicketIdEl = document.getElementById('replyTicketId') as HTMLInputElement | null; // Ukryte pole w formularzu odpowiedzi

    if (!detailEl) {
        _logger.LogError("Element adminTicketDetailFormatted nie został znaleziony w DOM.");
        return;
    }
    if (!ticket) { // Jeśli nie udało się załadować danych zgłoszenia
        detailEl.innerHTML = '<p style="color: red; text-align:center;">Nie udało się załadować szczegółów zgłoszenia lub zgłoszenie nie istnieje.</p>';
        if (replyFormTicketIdEl) replyFormTicketIdEl.value = ''; // Wyczyść ID w formularzu odpowiedzi
        return;
    }
    // Ustawienie ID zgłoszenia w formularzu odpowiedzi
    if (replyFormTicketIdEl) replyFormTicketIdEl.value = ticket.id;

    // Formatowanie dat
    const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
    const lastUpdatedAtDate = ticket.lastUpdatedAt ? new Date(ticket.lastUpdatedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak aktualizacji';

    // Budowanie HTML dla szczegółów zgłoszenia
    let html = `<h4>Temat: ${escapeHtml(ticket.subject)}</h4>
        <p><strong>ID Zgłoszenia:</strong> ${escapeHtml(ticket.id)}</p>
        <p><strong>Zgłaszający (Email):</strong> ${escapeHtml(ticket.userEmail)}</p>
        <p><strong>ID Zgłaszającego:</strong> ${escapeHtml(ticket.userId)}</p>
        <p><strong>Status:</strong> ${escapeHtml(ticket.status)}</p>
        <p><strong>Data Utworzenia:</strong> ${createdAtDate}</p>
        <p><strong>Ostatnia Aktualizacja:</strong> ${lastUpdatedAtDate}</p>
        <div style="margin-top: 15px; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Opis:</strong><p style="white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>`;

    // Dodawanie sekcji z odpowiedziami, jeśli istnieją
    if (ticket.replies && ticket.replies.length > 0) {
        html += `<div style="margin-top: 30px;"><h5>Odpowiedzi:</h5>`;
        // Sortowanie odpowiedzi chronologicznie
        ticket.replies.sort((a: TicketReply, b: TicketReply) => new Date(a.repliedAt).getTime() - new Date(b.repliedAt).getTime())
            .forEach((reply: TicketReply) => {
                const repliedAtDate = reply.repliedAt ? new Date(reply.repliedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
                html += `<div class="ticket-reply" style="border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px;">
                    <p><strong>${escapeHtml(reply.replierUserEmail || reply.replierUserId)}</strong> (${repliedAtDate}):</p>
                    <p style="white-space: pre-wrap; background-color: #f0f0f0; padding: 8px; border-radius: 4px;">${escapeHtml(reply.message)}</p>
                </div>`;
            });
        html += `</div>`;
    } else {
        html += `<p style="margin-top: 20px;"><i>Brak odpowiedzi.</i></p>`;
    }
    detailEl.innerHTML = html; // Wstawienie HTML do kontenera
}

/**
 * Renderuje listę zgłoszeń (ticketów) dla zalogowanego użytkownika ("Moje zgłoszenia").
 * @param ticketData Obiekt MyTicketsResponse zawierający dane zgłoszeń i paginacji, lub null.
 * @param listContainerId ID elementu HTML, gdzie ma być renderowana lista.
 * @param paginationContainerId ID elementu HTML, gdzie mają być renderowane kontrolki paginacji.
 */
export function renderMyTicketsList(
    ticketData: MyTicketsResponse | null, // Może być null, jeśli np. błąd API
    listContainerId: string,
    paginationContainerId: string
): void {
    const listEl = document.getElementById(listContainerId) as HTMLElement | null;
    const paginationControlsEl = document.getElementById(paginationContainerId) as HTMLElement | null;

    if (!listEl) { _logger.LogError(`Element ${listContainerId} nie znaleziony.`); return; }

    if (!ticketData || !ticketData.items || ticketData.items.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;">Nie masz żadnych zgłoszeń.</p>';
        if (paginationControlsEl) paginationControlsEl.innerHTML = '';
        return;
    }

    const { items, totalCount, pageNumber, pageSize } = ticketData;
    // Budowanie tabeli HTML (podobnie jak dla admina, ale z linkiem do window.viewMyTicketDetails)
    let html = `<h4 style="text-align:center;">Twoje zgłoszenia (Znaleziono: ${totalCount})</h4>`;
    html += `<table class="user-table" style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Temat</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Utworzenia</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Akcje</th></tr></thead><tbody>`;

    items.forEach((ticket: Ticket) => {
        const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Brak danych';
        html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;" title="${ticket.id}">${ticket.id ? ticket.id.substring(0,8) + '...' : 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.subject)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.status)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${createdAtDate}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button class="action-button-secondary" style="font-size: 0.8em; padding: 3px 6px;" onclick="window.viewMyTicketDetails('${ticket.id}')">Zobacz</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    listEl.innerHTML = html;

    // Renderowanie paginacji
    if (paginationControlsEl) {
        renderGenericPagination(paginationControlsEl, pageNumber, Math.ceil(totalCount / pageSize),
            // Callback dla paginacji
            (page) => {
                fetchMyTickets(page, pageSize).then(newData => {
                    if (newData) renderMyTicketsList(newData, listContainerId, paginationContainerId);
                }).catch(err => { // Obsługa błędu pobierania danych dla nowej strony
                    if (listEl) listEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania Twoich zgłoszeń: ${err.message}</p>`;
                });
            }
        );
    }
}

/**
 * Renderuje szczegóły pojedynczego zgłoszenia dla zalogowanego użytkownika.
 * @param ticket Obiekt Ticket zawierający dane zgłoszenia, lub null.
 */
export function renderMyTicketDetail(ticket: Ticket | null): void {
    const detailEl = document.getElementById('myTicketDetailFormatted') as HTMLElement | null;
    const replyFormTicketIdEl = document.getElementById('userReplyTicketId') as HTMLInputElement | null; // Ukryte pole w formularzu odpowiedzi użytkownika

    if (!detailEl) { _logger.LogError("Element myTicketDetailFormatted nie został znaleziony."); return; }

    if (!ticket) { // Jeśli nie udało się załadować zgłoszenia
        detailEl.innerHTML = '<p style="color: red; text-align:center;">Nie udało się załadować szczegółów zgłoszenia lub zgłoszenie nie istnieje.</p>';
        if (replyFormTicketIdEl) replyFormTicketIdEl.value = '';
        return;
    }

    // Ustawienie ID zgłoszenia w formularzu odpowiedzi
    if (replyFormTicketIdEl) replyFormTicketIdEl.value = ticket.id;

    // Formatowanie dat
    const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
    const lastUpdatedAtDate = ticket.lastUpdatedAt ? new Date(ticket.lastUpdatedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak aktualizacji';

    // Budowanie HTML dla szczegółów zgłoszenia
    let html = `<h4>Temat: ${escapeHtml(ticket.subject)}</h4>
        <p><strong>ID Zgłoszenia:</strong> ${escapeHtml(ticket.id)}</p>
        <p><strong>Status:</strong> ${escapeHtml(ticket.status)}</p>
        <p><strong>Data Utworzenia:</strong> ${createdAtDate}</p>
        <p><strong>Ostatnia Aktualizacja:</strong> ${lastUpdatedAtDate}</p>
        <div style="margin-top: 15px; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Twój Opis:</strong><p style="white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>`;

    // Dodawanie sekcji z historią korespondencji
    if (ticket.replies && ticket.replies.length > 0) {
        html += `<div style="margin-top: 30px;"><h5>Historia Korespondencji:</h5>`;
        // Sortowanie odpowiedzi chronologicznie
        ticket.replies.sort((a: TicketReply, b: TicketReply) => new Date(a.repliedAt).getTime() - new Date(b.repliedAt).getTime())
            .forEach((reply: TicketReply) => {
                const repliedAtDate = reply.repliedAt ? new Date(reply.repliedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';

                // Sprawdzenie, czy odpowiedź pochodzi od klienta (zalogowanego użytkownika) czy od supportu/admina
                const isClientReply = reply.replierUserId === ticket.userId; // Porównanie ID odpowiadającego z ID twórcy ticketu
                const replierDisplayName = escapeHtml(reply.replierUserEmail || reply.replierUserId);
                // Różne style dla odpowiedzi klienta i supportu
                const alignStyle = isClientReply
                    ? "text-align: left; background-color: #e6f7ff; border-left: 3px solid #1890ff;" // Odpowiedź klienta
                    : "text-align: right; background-color: #f0f0f0; border-right: 3px solid #555;"; // Odpowiedź supportu/admina

                // Ustalenie wyświetlanej nazwy autora odpowiedzi
                const authorPrefix = isClientReply ? (ticket.userEmail === reply.replierUserEmail ? "Ty" : replierDisplayName) : "Support (Admin)";

                html += `
                    <div class="ticket-reply" style="border: 1px solid #ddd; padding: 10px; margin-top: 10px; border-radius: 4px; ${alignStyle}"> 
                        <p style="margin-bottom: 5px;"><strong>${authorPrefix}</strong> (${repliedAtDate}):</p>
                        <p style="white-space: pre-wrap; margin-top:0;">${escapeHtml(reply.message)}</p>
                    </div>`;
            });
        html += `</div>`;
    } else {
        html += `<p style="margin-top: 20px;"><i>Brak odpowiedzi w tym zgłoszeniu.</i></p>`;
    }
    detailEl.innerHTML = html; // Wstawienie HTML do kontenera
}

/**
 * Renderuje generyczny komponent paginacji.
 * @param container Element HTML, w którym ma być renderowana paginacja.
 * @param currentPage Numer bieżącej strony.
 * @param totalPages Całkowita liczba stron.
 * @param onPageChange Callback wywoływany przy zmianie strony, przekazuje numer nowej strony.
 */
export function renderGenericPagination(
    container: HTMLElement,
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void // Funkcja zwrotna do obsługi zmiany strony
): void {
    if (!container) return; // Jeśli kontener nie istnieje, zakończ
    if (totalPages <= 1) { // Jeśli jest tylko jedna strona lub mniej, nie renderuj paginacji
        container.innerHTML = "";
        return;
    }

    let paginationHtml = `<div style="margin-top: 20px; text-align: center; padding-bottom: 20px;">`;

    // Przycisk "Poprzednia"
    paginationHtml += `<button class="action-button-secondary" style="margin-right: 5px;" 
                        ${currentPage <= 1 ? 'disabled' : ''} 
                        onclick="window.handleGenericPageChange(${currentPage - 1}, '${container.id}')">
                       &laquo; Poprzednia
                       </button>`;

    // Logika wyświetlania numerów stron (z kropkami, jeśli jest dużo stron)
    const maxPagesToShow = 5; // Maksymalna liczba przycisków stron do wyświetlenia (nie licząc "..." i skrajnych)
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Korekta, aby zawsze pokazywać `maxPagesToShow` jeśli to możliwe
    if ((endPage - startPage + 1 < maxPagesToShow) && totalPages > maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    } else if (totalPages < maxPagesToShow) { // Jeśli wszystkich stron jest mniej niż `maxPagesToShow`
        startPage = 1;
        endPage = totalPages;
    }

    // Przycisk "1" i "..." na początku, jeśli potrzebne
    if (startPage > 1) {
        paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(1, '${container.id}')">1</button>`;
        if (startPage > 2) paginationHtml += `<span style="margin: 0 2px;">...</span>`;
    }

    // Przyciski dla stron w zakresie startPage - endPage
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) { // Wyróżnienie bieżącej strony
            paginationHtml += `<button style="margin: 0 2px; font-weight: bold; background-color: #ddd;" disabled>${i}</button>`;
        } else {
            paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(${i}, '${container.id}')">${i}</button>`;
        }
    }

    // Przycisk ostatniej strony i "..." na końcu, jeśli potrzebne
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHtml += `<span style="margin: 0 2px;">...</span>`;
        paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(${totalPages}, '${container.id}')">${totalPages}</button>`;
    }

    // Przycisk "Następna"
    paginationHtml += `<button class="action-button-secondary" style="margin-left: 5px;" 
                        ${currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="window.handleGenericPageChange(${currentPage + 1}, '${container.id}')">
                       Następna &raquo;
                       </button>`;
    paginationHtml += `</div>`;
    container.innerHTML = paginationHtml; // Wstawienie HTML paginacji do kontenera

    // Zapisanie callbacku onPageChange na elemencie kontenera, aby był dostępny dla globalnej funkcji handleGenericPageChange
    (container as any)._onPageChangeCallback = onPageChange;
}