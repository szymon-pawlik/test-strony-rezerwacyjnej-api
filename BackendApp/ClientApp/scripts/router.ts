// router.ts
import { getJwtToken, getUserRole } from './state.js'; // Usunięto .ts
import { showSection } from './uiService.js';       // Usunięto .ts
import { fetchApartments } from './apartmentService.js'; // Usunięto .ts
import { fetchMyProfile } from './profileService.js';   // Usunięto .ts
import { fetchAndDisplayAllAdminBookings } from './bookingService.js'; // Usunięto .ts
// import { fetchAndDisplayAllUsers } from './adminService'; // Poprawiony komentarz i potencjalny import

export function handleRouteChange(): void {
    const hash: string = window.location.hash.substring(1) || '/';
    console.log("Zmiana ścieżki na:", hash);

    const currentJwtToken: string | null = getJwtToken();
    const currentUserRole: string | null = getUserRole();

    // Aktywne linki nawigacyjne
    const navLinks = document.querySelectorAll('nav a'); // Zwraca NodeListOf<Element>
    navLinks.forEach((linkNode: Node) => { // Iterujemy po Node
        if (linkNode instanceof HTMLAnchorElement) { // Sprawdzamy, czy to na pewno <a>
            const link = linkNode as HTMLAnchorElement; // Teraz link jest typu HTMLAnchorElement
            link.classList.remove('active-nav-link');

            let linkHref: string | null = link.getAttribute('href');
            let linkHash: string = "";

            if (linkHref) {
                linkHash = linkHref.substring(1);
                if (linkHash === "") linkHash = "/"; // Dla linku do strony głównej href="#" lub href="#/"
            }

            if (linkHash === hash) {
                link.classList.add('active-nav-link');
            }
        }
    });

    switch (hash) {
        case '/':
            if (currentJwtToken) window.location.hash = '#/mieszkania';
            else showSection('loginSectionContainer');
            break;
        case '/rejestracja':
            if (currentJwtToken) window.location.hash = '#/mieszkania';
            else showSection('registerSection');
            break;
        case '/mieszkania':
            showSection('apartmentsViewSection');
            fetchApartments(); // Zakładamy, że zwraca Promise<void>
            break;
        case '/profil':
            if (currentJwtToken) {
                showSection('myProfileSection');
                fetchMyProfile(); // Zakładamy, że zwraca Promise<void>
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/dodaj-mieszkanie':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('addApartmentSection');
            } else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/dodaj-recenzje':
            if (currentJwtToken) {
                showSection('addReviewSection');
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/rezerwuj':
            if (currentJwtToken) {
                showSection('addBookingSection');
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/rezerwacje':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('adminManageBookingsSection');
                fetchAndDisplayAllAdminBookings(); // Zakładamy, że zwraca Promise<void>
            } else if (currentJwtToken) {
                window.location.hash = '#/mieszkania';
            } else {
                window.location.hash = '#/';
            }
            break;
        case '/admin/uzytkownicy':
            if (currentJwtToken && currentUserRole === 'Admin') {
                showSection('adminManageUsersSection');
                // fetchAndDisplayAllUsers(); // Jeśli/gdy zaimplementowane
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
        default:
            // Obsługa nieznanej ścieżki, np. przekierowanie na stronę główną lub stronę 404
            console.warn(`Nieznana ścieżka: ${hash}. Przekierowywanie na stronę główną.`);
            window.location.hash = '#/';
            // Alternatywnie: showSection('notFoundSection'); jeśli masz taką sekcję
            break;
    }
}