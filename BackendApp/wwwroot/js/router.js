import { getJwtToken, getUserRole } from './state.js';
import { showSection, } from './uiService.js';
import { fetchApartments } from './apartmentService.js';
import { fetchMyProfile } from './profileService.js';
import { fetchAndDisplayAllAdminBookings } from './bookingService.js';
import { fetchAllTicketsForAdmin, fetchTicketById, fetchMyTickets } from './ticketApiService.js';
import { renderAdminTicketsList, renderAdminTicketDetail, renderMyTicketsList, renderMyTicketDetail } from './uiService.js';
export function handleRouteChange() {
    const rawHash = window.location.hash.substring(1) || '/';
    console.log("[INFO] router.ts: Zmiana ścieżki na (rawHash):", rawHash);
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();
    let routePath = '/';
    let routeParams = [];
    const processedHash = rawHash.startsWith('/') ? rawHash.substring(1) : rawHash;
    const hashParts = processedHash.split('/').filter(part => part !== '');
    if (hashParts.length === 0) {
        routePath = '/';
    }
    else if (hashParts.length === 1) {
        routePath = `/${hashParts[0]}`;
    }
    else if (hashParts.length === 2) {
        if (hashParts[0] === 'admin' && (hashParts[1] === 'tickety' || hashParts[1] === 'rezerwacje' || hashParts[1] === 'uzytkownicy')) {
            routePath = `/${hashParts[0]}/${hashParts[1]}`;
        }
        else if (hashParts[0] === 'moje-zgloszenia') {
            routePath = '/moje-zgloszenia/:id';
            routeParams.push(hashParts[1]);
        }
        else {
            routePath = `/${hashParts[0]}/${hashParts[1]}`;
        }
    }
    else if (hashParts.length === 3 && hashParts[0] === 'admin' && hashParts[1] === 'tickety') {
        routePath = '/admin/tickety/:id';
        routeParams.push(hashParts[2]);
    }
    else {
        routePath = `/${hashParts[0]}`;
        console.warn(`[WARN] router.ts: Nierozpoznany format wielosegmentowej ścieżki dla ${rawHash}, używam ${routePath} jako bazy.`);
    }
    console.log(`[DEBUG] router.ts: Przetworzona routePath: ${routePath}, Parametry: ${JSON.stringify(routeParams)}`);
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((linkNode) => {
        if (linkNode instanceof HTMLAnchorElement) {
            const link = linkNode;
            link.classList.remove('active-nav-link');
            let linkHref = link.getAttribute('href');
            if (linkHref) {
                const linkNavPath = linkHref.substring(1) || '/';
                let currentBaseRoutePath = routePath;
                if (routePath.includes('/:id')) {
                    currentBaseRoutePath = routePath.substring(0, routePath.indexOf('/:id'));
                }
                if (linkNavPath === currentBaseRoutePath || (linkNavPath === '/' && routePath === '/')) {
                    link.classList.add('active-nav-link');
                }
            }
        }
    });
    switch (routePath) {
        case '/':
            if (currentJwtToken)
                window.location.hash = '#/mieszkania';
            else
                showSection('loginSectionContainer');
            break;
        case '/rejestracja':
            if (currentJwtToken)
                window.location.hash = '#/mieszkania';
            else
                showSection('registerSection');
            break;
        case '/mieszkania':
            showSection('apartmentsViewSection');
            fetchApartments('first');
            break;
        case '/profil':
            if (currentJwtToken) {
                showSection('myProfileSection');
                fetchMyProfile();
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/zglos-problem':
            if (currentJwtToken) {
                showSection('submitTicketSection');
                const ticketForm = document.getElementById('submitTicketForm');
                ticketForm === null || ticketForm === void 0 ? void 0 : ticketForm.reset();
                const ticketResponseEl = document.getElementById('submitTicketResponse');
                if (ticketResponseEl)
                    ticketResponseEl.innerHTML = '';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/tickety':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('adminManageTicketsSection');
                fetchAllTicketsForAdmin()
                    .then((ticketData) => {
                    renderAdminTicketsList(ticketData.items, ticketData.totalCount, ticketData.pageNumber, ticketData.pageSize);
                })
                    .catch((error) => {
                    console.error("[ERROR] router.ts: Błąd podczas pobierania/renderowania listy ticketów admina:", error);
                    const adminTicketsListEl = document.getElementById('adminTicketsListFormatted');
                    if (adminTicketsListEl) {
                        adminTicketsListEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania zgłoszeń: ${error.message}</p>`;
                    }
                });
            }
            else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/tickety/:id':
            if (currentJwtToken && currentUserRole === 'Admin') {
                const ticketId = routeParams[0];
                if (ticketId) {
                    showSection('adminTicketDetailSection');
                    const detailEl = document.getElementById('adminTicketDetailFormatted');
                    const replyForm = document.getElementById('adminReplyToTicketForm');
                    const replyResponseEl = document.getElementById('adminReplyTicketResponse');
                    if (detailEl)
                        detailEl.innerHTML = '<p style="text-align:center;">Ładowanie szczegółów zgłoszenia...</p>';
                    replyForm === null || replyForm === void 0 ? void 0 : replyForm.reset();
                    if (replyResponseEl)
                        replyResponseEl.innerHTML = '';
                    fetchTicketById(ticketId)
                        .then((ticket) => renderAdminTicketDetail(ticket))
                        .catch((error) => {
                        console.error(`[ERROR] router.ts: Błąd pobierania szczegółów ticketu ${ticketId}:`, error);
                        if (detailEl)
                            detailEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania szczegółów zgłoszenia: ${error.message}</p>`;
                    });
                }
                else {
                    console.warn("[WARN] router.ts: Brak ID ticketu w ścieżce /admin/tickety/:id. Oryginalny hash:", rawHash);
                    window.location.hash = '#/admin/tickety';
                }
            }
            else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/moje-zgloszenia':
            if (currentJwtToken) {
                showSection('myTicketsSection');
                fetchMyTickets()
                    .then((ticketData) => {
                    renderMyTicketsList(ticketData, 'myTicketsListFormatted', 'myTicketsPaginationControls');
                })
                    .catch((error) => {
                    console.error("[ERROR] router.ts: Błąd podczas pobierania/renderowania listy 'moich ticketów':", error);
                    const myTicketsListEl = document.getElementById('myTicketsListFormatted');
                    if (myTicketsListEl) {
                        myTicketsListEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania Twoich zgłoszeń: ${error.message}</p>`;
                    }
                });
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/moje-zgloszenia/:id':
            if (currentJwtToken) {
                const ticketId = routeParams[0];
                if (ticketId) {
                    showSection('myTicketDetailSection');
                    const detailEl = document.getElementById('myTicketDetailFormatted');
                    const replyForm = document.getElementById('userReplyToTicketForm');
                    const replyResponseEl = document.getElementById('userReplyTicketResponse');
                    if (detailEl)
                        detailEl.innerHTML = '<p style="text-align:center;">Ładowanie szczegółów zgłoszenia...</p>';
                    replyForm === null || replyForm === void 0 ? void 0 : replyForm.reset();
                    if (replyResponseEl)
                        replyResponseEl.innerHTML = '';
                    fetchTicketById(ticketId)
                        .then((ticket) => renderMyTicketDetail(ticket))
                        .catch((error) => {
                        console.error(`[ERROR] router.ts: Błąd pobierania szczegółów ticketu ${ticketId} dla użytkownika:`, error);
                        if (detailEl)
                            detailEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania szczegółów zgłoszenia: ${error.message}</p>`;
                    });
                }
                else {
                    console.warn("[WARN] router.ts: Brak ID ticketu w ścieżce /moje-zgloszenia/:id. Oryginalny hash:", rawHash);
                    window.location.hash = '#/moje-zgloszenia';
                }
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/dodaj-mieszkanie':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('addApartmentSection');
            }
            else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/dodaj-recenzje':
            if (currentJwtToken) {
                showSection('addReviewSection');
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/rezerwuj':
            if (currentJwtToken) {
                showSection('addBookingSection');
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/rezerwacje':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('adminManageBookingsSection');
                fetchAndDisplayAllAdminBookings();
            }
            else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/uzytkownicy':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('adminManageUsersSection');
                console.warn("Sekcja /admin/uzytkownicy - fetchAndDisplayAllUsers nie jest jeszcze zaimplementowana.");
                const adminUsersListEl = document.getElementById('adminUsersListFormatted');
                if (adminUsersListEl) {
                    adminUsersListEl.innerHTML = "<p style='text-align:center;'>Zarządzanie użytkownikami - wkrótce.</p>";
                }
            }
            else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            }
            else {
                window.location.hash = '#/';
            }
            break;
        default:
            console.warn(`[WARN] router.ts: Nieznana ścieżka po przetworzeniu: ${routePath} (oryginalny hash: ${rawHash}). Przekierowywanie na stronę główną.`);
            window.location.hash = '#/';
            break;
    }
}
//# sourceMappingURL=router.js.map