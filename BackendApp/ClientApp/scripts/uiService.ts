// uiService.ts
import { allPageSections } from './config.js'; // Usunięto .ts, TypeScript sobie poradzi
import { getUserRole, getJwtToken } from './state.js'; // Usunięto .ts
import { fetchApartmentsForSelect } from './apartmentService.js'; // Usunięto .ts

export function showSection(sectionIdToShow: string): void {
    allPageSections.forEach((id: string) => {
        const section = document.getElementById(id) as HTMLElement | null; // Typujemy jako HTMLElement lub null
        if (section) {
            if (id === sectionIdToShow) {
                section.classList.remove('hidden-section');
            } else {
                section.classList.add('hidden-section');
            }
        }
    });
}

export function updateLoginState(): void {
    const isLoggedIn: boolean = !!getJwtToken(); // Wynik konwersji na boolean
    const currentUserRole: string | null = getUserRole();

    // Typowanie elementów DOM
    const loginStatusEl = document.getElementById('loginStatus') as HTMLElement | null;
    const userRoleDisplayEl = document.getElementById('userRoleDisplay') as HTMLElement | null;
    const logoutButtonEl = document.getElementById('logoutButton') as HTMLButtonElement | null;

    const navLogin = document.getElementById('navLogin') as HTMLAnchorElement | null;
    const navRegister = document.getElementById('navRegister') as HTMLAnchorElement | null;
    const navMyProfile = document.getElementById('navMyProfile') as HTMLAnchorElement | null;
    const navAddReview = document.getElementById('navAddReview') as HTMLAnchorElement | null;
    const navBookApartment = document.getElementById('navBookApartment') as HTMLAnchorElement | null;
    const navAddApartment = document.getElementById('navAddApartment') as HTMLAnchorElement | null;
    const navAdminBookings = document.getElementById('navAdminBookings') as HTMLAnchorElement | null;
    const navAdminUsers = document.getElementById('navAdminUsers') as HTMLAnchorElement | null;

    const reviewApartmentSelectEl = document.getElementById('reviewApartmentSelect') as HTMLSelectElement | null;
    const bookingApartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
    const totalPriceEl = document.getElementById('bookingTotalPrice') as HTMLInputElement | null;
    const myProfileFormattedEl = document.getElementById('myProfileFormatted') as HTMLElement | null;

    if (isLoggedIn && currentUserRole) {
        if (loginStatusEl) loginStatusEl.textContent = 'Zalogowany';
        if (userRoleDisplayEl) userRoleDisplayEl.textContent = currentUserRole; // currentUserRole to string | null, textContent akceptuje null
        if (logoutButtonEl) logoutButtonEl.classList.remove('hidden-section');

        if (navLogin) navLogin.classList.add('hidden-section');
        if (navRegister) navRegister.classList.add('hidden-section');
        if (navMyProfile) navMyProfile.classList.remove('hidden-section');
        if (navAddReview) navAddReview.classList.remove('hidden-section');
        if (navBookApartment) navBookApartment.classList.remove('hidden-section');

        if (currentUserRole === 'Admin') {
            if (navAddApartment) navAddApartment.classList.remove('hidden-section');
            if (navAdminBookings) navAdminBookings.classList.remove('hidden-section');
            if (navAdminUsers) navAdminUsers.classList.remove('hidden-section');
        } else {
            if (navAddApartment) navAddApartment.classList.add('hidden-section');
            if (navAdminBookings) navAdminBookings.classList.add('hidden-section');
            if (navAdminUsers) navAdminUsers.classList.add('hidden-section');
        }
        fetchApartmentsForSelect(); // Ta funkcja powinna zwracać Promise<void> lub void
    } else {
        // Użytkownik niezalogowany
        if (loginStatusEl) loginStatusEl.textContent = 'Niezalogowany';
        if (userRoleDisplayEl) userRoleDisplayEl.textContent = '-';
        if (logoutButtonEl) logoutButtonEl.classList.add('hidden-section');

        if (navLogin) navLogin.classList.remove('hidden-section');
        if (navRegister) navRegister.classList.remove('hidden-section');
        if (navMyProfile) navMyProfile.classList.add('hidden-section');
        if (navAddReview) navAddReview.classList.add('hidden-section');
        if (navBookApartment) navBookApartment.classList.add('hidden-section');
        if (navAddApartment) navAddApartment.classList.add('hidden-section');
        if (navAdminBookings) navAdminBookings.classList.add('hidden-section');
        if (navAdminUsers) navAdminUsers.classList.add('hidden-section');

        if (reviewApartmentSelectEl) reviewApartmentSelectEl.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (bookingApartmentSelectEl) bookingApartmentSelectEl.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (totalPriceEl) totalPriceEl.value = ""; // value oczekuje stringa
        if (myProfileFormattedEl) myProfileFormattedEl.innerHTML = '';
    }

    const adminJsonContainers = document.querySelectorAll('.admin-json-container');
    adminJsonContainers.forEach((containerNode: Node) => { // NodeListOf zwraca Node
        // Aby uzyskać dostęp do .style, musimy sprawdzić, czy to HTMLElement
        if (containerNode instanceof HTMLElement) {
            containerNode.style.display = (currentUserRole === 'Admin') ? 'block' : 'none';
        }
    });
}