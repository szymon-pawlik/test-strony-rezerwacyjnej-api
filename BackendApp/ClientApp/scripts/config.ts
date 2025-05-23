// Konfiguracja globalna aplikacji

// Adres URL backendu aplikacji.
export const backendAppUrl: string = 'http://localhost:5235';

// Lista identyfikatorów wszystkich sekcji (kontenerów) na stronie,
// używana prawdopodobnie do zarządzania widocznością poszczególnych widoków w aplikacji jednostronicowej (SPA).
export const allPageSections: string[] = [
    'loginSectionContainer',     // Sekcja logowania
    'registerSection',           // Sekcja rejestracji
    'addApartmentSection',       // Sekcja dodawania mieszkania (admin)
    'addReviewSection',          // Sekcja dodawania recenzji
    'addBookingSection',         // Sekcja tworzenia rezerwacji
    'myProfileSection',          // Sekcja profilu użytkownika
    'apartmentsViewSection',     // Sekcja przeglądania mieszkań
    'adminManageBookingsSection',// Sekcja zarządzania rezerwacjami (admin)
    'adminManageUsersSection',   // Sekcja zarządzania użytkownikami (admin)
    'editApartmentSection',      // Sekcja edycji mieszkania (admin)
    'submitTicketSection',       // Sekcja zgłaszania problemu (tworzenie ticketu)
    'adminManageTicketsSection', // Sekcja zarządzania zgłoszeniami (admin)
    'adminTicketDetailSection',  // Sekcja szczegółów zgłoszenia (admin)
    'myTicketsSection',          // Sekcja "Moje zgłoszenia" (użytkownik)
    'myTicketDetailSection'      // Sekcja szczegółów "Mojego zgłoszenia" (użytkownik)
];