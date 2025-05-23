// Importy funkcji do zarządzania stanem, UI, oraz serwisów do pobierania danych
import { getJwtToken, getUserRole } from './state.js';
import { showSection,  } from './uiService.js';
import { fetchApartments } from './apartmentService.js';
import { fetchMyProfile } from './profileService.js';
import { fetchAndDisplayAllAdminBookings } from './bookingService.js';
// Importy funkcji API dla zgłoszeń (ticketów) oraz funkcji renderujących UI
import { fetchAllTicketsForAdmin, fetchTicketById, fetchMyTickets } from './ticketApiService.js';
import { renderAdminTicketsList, renderAdminTicketDetail, renderMyTicketsList, renderMyTicketDetail } from './uiService.js';
// Import typów
import { Ticket, MyTicketsResponse } from './types.js';

/**
 * Główna funkcja routera. Odpowiada za obsługę zmian w URL (hash),
 * wyświetlanie odpowiednich sekcji strony oraz inicjowanie pobierania danych.
 */
export function handleRouteChange(): void {
    // Pobranie aktualnego hasha z URL, usunięcie znaku '#' i ustawienie domyślnej ścieżki '/'
    const rawHash: string = window.location.hash.substring(1) || '/';
    console.log("[INFO] router.ts: Zmiana ścieżki na (rawHash):", rawHash);

    // Pobranie informacji o zalogowanym użytkowniku
    const currentJwtToken: string | null = getJwtToken();
    const currentUserRole: string | null = getUserRole();

    // --- Przetwarzanie hasha na ścieżkę i parametry ---
    let routePath: string = '/'; // Domyślna ścieżka bazowa
    let routeParams: string[] = []; // Tablica na parametry ze ścieżki (np. ID)
    // Normalizacja hasha (usunięcie ewentualnego początkowego '/')
    const processedHash = rawHash.startsWith('/') ? rawHash.substring(1) : rawHash;
    // Podział hasha na segmenty, odfiltrowanie pustych segmentów (np. przy wielokrotnych '/')
    const hashParts: string[] = processedHash.split('/').filter(part => part !== '');

    // Logika rozpoznawania ścieżki i parametrów na podstawie liczby segmentów
    if (hashParts.length === 0) { // np. # lub #/
        routePath = '/';
    } else if (hashParts.length === 1) { // np. #/mieszkania
        routePath = `/${hashParts[0]}`;
    } else if (hashParts.length === 2) { // np. #/admin/tickety lub #/moje-zgloszenia/123
        // Specjalne przypadki dla ścieżek dwusegmentowych
        if (hashParts[0] === 'admin' && (hashParts[1] === 'tickety' || hashParts[1] === 'rezerwacje' || hashParts[1] === 'uzytkownicy')) {
            routePath = `/${hashParts[0]}/${hashParts[1]}`; // Ścieżka admina bez parametru
        } else if (hashParts[0] === 'moje-zgloszenia') { // np. #/moje-zgloszenia/ticketId
            routePath = '/moje-zgloszenia/:id'; // Definicja ścieżki z parametrem
            routeParams.push(hashParts[1]);    // Zapisanie ID ticketu jako parametru
        } else {
            // Domyślne traktowanie jako np. /kategoria/element - obecnie nieużywane w ten sposób
            routePath = `/${hashParts[0]}/${hashParts[1]}`;
        }
    } else if (hashParts.length === 3 && hashParts[0] === 'admin' && hashParts[1] === 'tickety') {
        // np. #/admin/tickety/ticketId
        routePath = '/admin/tickety/:id'; // Definicja ścieżki admina z parametrem ID ticketu
        routeParams.push(hashParts[2]);   // Zapisanie ID ticketu jako parametru
    } else {
        // Jeśli format jest bardziej złożony i nierozpoznany, użyj pierwszego segmentu jako bazę
        routePath = `/${hashParts[0]}`;
        console.warn(`[WARN] router.ts: Nierozpoznany format wielosegmentowej ścieżki dla ${rawHash}, używam ${routePath} jako bazy.`);
    }

    console.log(`[DEBUG] router.ts: Przetworzona routePath: ${routePath}, Parametry: ${JSON.stringify(routeParams)}`);

    // --- Aktualizacja aktywnego linku w nawigacji ---
    const navLinks = document.querySelectorAll('nav a'); // Pobranie wszystkich linków nawigacyjnych
    navLinks.forEach((linkNode: Node) => {
        if (linkNode instanceof HTMLAnchorElement) {
            const link = linkNode as HTMLAnchorElement;
            link.classList.remove('active-nav-link'); // Usunięcie klasy aktywnej ze wszystkich linków
            let linkHref: string | null = link.getAttribute('href');
            if (linkHref) {
                const linkNavPath = linkHref.substring(1) || '/'; // Pobranie ścieżki z atrybutu href

                // Dopasowanie ścieżki linku do bieżącej ścieżki routera (z uwzględnieniem parametrów)
                let currentBaseRoutePath = routePath;
                if (routePath.includes('/:id')) { // Jeśli ścieżka zawiera parametr, weź bazę
                    currentBaseRoutePath = routePath.substring(0, routePath.indexOf('/:id'));
                }

                // Dodanie klasy aktywnej do pasującego linku
                if (linkNavPath === currentBaseRoutePath || (linkNavPath === '/' && routePath === '/')) {
                    link.classList.add('active-nav-link');
                }
            }
        }
    });

    // --- Logika routingu na podstawie przetworzonej ścieżki ---
    switch (routePath) {
        case '/': // Strona główna/logowania
            if (currentJwtToken) window.location.hash = '#/mieszkania'; // Jeśli zalogowany, przekieruj na mieszkania
            else showSection('loginSectionContainer'); // Pokaż sekcję logowania
            break;
        case '/rejestracja':
            if (currentJwtToken) window.location.hash = '#/mieszkania'; // Jeśli zalogowany, przekieruj
            else showSection('registerSection'); // Pokaż sekcję rejestracji
            break;
        case '/mieszkania':
            showSection('apartmentsViewSection'); // Pokaż listę mieszkań
            fetchApartments('first');             // Pobierz pierwszą stronę mieszkań
            break;
        case '/profil':
            if (currentJwtToken) { // Tylko dla zalogowanych
                showSection('myProfileSection');
                fetchMyProfile(); // Pobierz dane profilu
            } else {
                window.location.hash = '#/'; // Przekieruj do logowania
            }
            break;
        case '/zglos-problem': // Formularz zgłaszania nowego problemu (ticketu)
            if (currentJwtToken) { // Tylko dla zalogowanych
                showSection('submitTicketSection');
                // Resetowanie formularza i komunikatów przy wejściu na stronę
                const ticketForm = document.getElementById('submitTicketForm') as HTMLFormElement | null;
                ticketForm?.reset();
                const ticketResponseEl = document.getElementById('submitTicketResponse') as HTMLElement | null;
                if (ticketResponseEl) ticketResponseEl.innerHTML = '';
            } else {
                window.location.hash = '#/'; // Przekieruj do logowania
            }
            break;
        case '/admin/tickety': // Lista wszystkich zgłoszeń dla admina
            if (currentJwtToken && currentUserRole === 'Admin') { // Tylko dla admina
                showSection('adminManageTicketsSection');
                fetchAllTicketsForAdmin() // Pobierz wszystkie zgłoszenia
                    .then((ticketData: { items: Ticket[], totalCount: number, pageNumber: number, pageSize: number }) => {
                        renderAdminTicketsList(ticketData.items, ticketData.totalCount, ticketData.pageNumber, ticketData.pageSize); // Wyrenderuj listę
                    })
                    .catch((error: Error) => {
                        console.error("[ERROR] router.ts: Błąd podczas pobierania/renderowania listy ticketów admina:", error);
                        const adminTicketsListEl = document.getElementById('adminTicketsListFormatted') as HTMLElement | null;
                        if (adminTicketsListEl) { // Wyświetl komunikat o błędzie w odpowiednim kontenerze
                            adminTicketsListEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania zgłoszeń: ${error.message}</p>`;
                        }
                    });
            } else if (currentJwtToken) { // Jeśli zalogowany, ale nie admin
                window.location.hash = '#/mieszkania';
            } else { // Jeśli niezalogowany
                window.location.hash = '#/';
            }
            break;
        case '/admin/tickety/:id': // Szczegóły konkretnego zgłoszenia dla admina
            if (currentJwtToken && currentUserRole === 'Admin') { // Tylko dla admina
                const ticketId = routeParams[0]; // Pobranie ID ticketu z parametrów ścieżki
                if (ticketId) {
                    showSection('adminTicketDetailSection'); // Pokaż sekcję szczegółów
                    // Przygotowanie UI przed załadowaniem danych
                    const detailEl = document.getElementById('adminTicketDetailFormatted') as HTMLElement | null;
                    const replyForm = document.getElementById('adminReplyToTicketForm') as HTMLFormElement | null;
                    const replyResponseEl = document.getElementById('adminReplyTicketResponse') as HTMLElement | null;
                    if (detailEl) detailEl.innerHTML = '<p style="text-align:center;">Ładowanie szczegółów zgłoszenia...</p>';
                    replyForm?.reset();
                    if (replyResponseEl) replyResponseEl.innerHTML = '';

                    fetchTicketById(ticketId) // Pobierz szczegóły zgłoszenia
                        .then((ticket: Ticket | null) => renderAdminTicketDetail(ticket)) // Wyrenderuj szczegóły
                        .catch((error: Error) => {
                            console.error(`[ERROR] router.ts: Błąd pobierania szczegółów ticketu ${ticketId}:`, error);
                            if (detailEl) detailEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania szczegółów zgłoszenia: ${error.message}</p>`;
                        });
                } else { // Jeśli ID ticketu brakuje w URL
                    console.warn("[WARN] router.ts: Brak ID ticketu w ścieżce /admin/tickety/:id. Oryginalny hash:", rawHash);
                    window.location.hash = '#/admin/tickety'; // Wróć do listy ticketów admina
                }
            } else if (currentJwtToken) { // Zalogowany, ale nie admin
                window.location.hash = '#/mieszkania';
            } else { // Niezalogowany
                window.location.hash = '#/';
            }
            break;
        case '/moje-zgloszenia': // Lista zgłoszeń zalogowanego użytkownika
            if (currentJwtToken) { // Tylko dla zalogowanych
                showSection('myTicketsSection');
                fetchMyTickets() // Pobierz zgłoszenia użytkownika
                    .then((ticketData) => { // Typ `ticketData` jest tutaj inferowany lub powinien być jawnie określony
                        renderMyTicketsList(ticketData, 'myTicketsListFormatted', 'myTicketsPaginationControls'); // Wyrenderuj listę
                    })
                    .catch((error: Error) => {
                        console.error("[ERROR] router.ts: Błąd podczas pobierania/renderowania listy 'moich ticketów':", error);
                        const myTicketsListEl = document.getElementById('myTicketsListFormatted') as HTMLElement | null;
                        if (myTicketsListEl) {
                            myTicketsListEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania Twoich zgłoszeń: ${error.message}</p>`;
                        }
                    });
            } else { window.location.hash = '#/'; } // Przekieruj do logowania
            break;
        case '/moje-zgloszenia/:id': // Szczegóły konkretnego zgłoszenia użytkownika
            if (currentJwtToken) { // Tylko dla zalogowanych
                const ticketId = routeParams[0]; // Pobranie ID ticketu z parametrów
                if (ticketId) {
                    showSection('myTicketDetailSection'); // Pokaż sekcję szczegółów
                    // Przygotowanie UI
                    const detailEl = document.getElementById('myTicketDetailFormatted') as HTMLElement | null;
                    const replyForm = document.getElementById('userReplyToTicketForm') as HTMLFormElement | null;
                    const replyResponseEl = document.getElementById('userReplyTicketResponse') as HTMLElement | null;

                    if (detailEl) detailEl.innerHTML = '<p style="text-align:center;">Ładowanie szczegółów zgłoszenia...</p>';
                    replyForm?.reset();
                    if (replyResponseEl) replyResponseEl.innerHTML = '';

                    fetchTicketById(ticketId) // Pobierz szczegóły zgłoszenia
                        .then((ticket: Ticket | null) => renderMyTicketDetail(ticket)) // Wyrenderuj szczegóły
                        .catch((error: Error) => {
                            console.error(`[ERROR] router.ts: Błąd pobierania szczegółów ticketu ${ticketId} dla użytkownika:`, error);
                            if (detailEl) detailEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania szczegółów zgłoszenia: ${error.message}</p>`;
                        });
                } else { // Brak ID w URL
                    console.warn("[WARN] router.ts: Brak ID ticketu w ścieżce /moje-zgloszenia/:id. Oryginalny hash:", rawHash);
                    window.location.hash = '#/moje-zgloszenia'; // Wróć do listy "moich zgłoszeń"
                }
            } else { window.location.hash = '#/'; } // Przekieruj do logowania
            break;
        case '/dodaj-mieszkanie': // Formularz dodawania mieszkania
            if (currentJwtToken && currentUserRole === 'Admin') { // Tylko dla admina
                showSection('addApartmentSection');
            } else if (currentJwtToken) { // Zalogowany, nie admin
                window.location.hash = '#/mieszkania';
            } else { // Niezalogowany
                window.location.hash = '#/';
            }
            break;
        case '/dodaj-recenzje': // Formularz dodawania recenzji
            if (currentJwtToken) { // Tylko dla zalogowanych
                showSection('addReviewSection');
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/rezerwuj': // Formularz rezerwacji
            if (currentJwtToken) { // Tylko dla zalogowanych
                showSection('addBookingSection');
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/rezerwacje': // Zarządzanie rezerwacjami (admin)
            if (currentJwtToken && currentUserRole === 'Admin') { // Tylko dla admina
                showSection('adminManageBookingsSection');
                fetchAndDisplayAllAdminBookings(); // Pobierz i wyświetl wszystkie rezerwacje
            } else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/uzytkownicy': // Zarządzanie użytkownikami (admin) - placeholder
            if (currentJwtToken && currentUserRole === 'Admin') { // Tylko dla admina
                showSection('adminManageUsersSection');
                console.warn("Sekcja /admin/uzytkownicy - fetchAndDisplayAllUsers nie jest jeszcze zaimplementowana.");
                const adminUsersListEl = document.getElementById('adminUsersListFormatted') as HTMLElement | null;
                if (adminUsersListEl) {
                    adminUsersListEl.innerHTML = "<p style='text-align:center;'>Zarządzanie użytkownikami - wkrótce.</p>";
                }
            } else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            } else {
                window.location.hash = '#/';
            }
            break;
        default: // Nieznana ścieżka
            console.warn(`[WARN] router.ts: Nieznana ścieżka po przetworzeniu: ${routePath} (oryginalny hash: ${rawHash}). Przekierowywanie na stronę główną.`);
            window.location.hash = '#/'; // Przekieruj na stronę główną
            break;
    }
}