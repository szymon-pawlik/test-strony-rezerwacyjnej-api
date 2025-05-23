// --- Ogólne typy błędów i odpowiedzi API ---

/**
 * Definiuje strukturę pojedynczego błędu zwracanego przez API,
 * często używane w odpowiedziach GraphQL.
 */
export interface ApiError {
    message: string;     // Komunikat błędu
    code?: string;       // Opcjonalny kod błędu
    path?: string[];     // Ścieżka w zapytaniu GraphQL, gdzie wystąpił błąd
    extensions?: any;    // Dodatkowe informacje o błędzie
    locations?: any[];   // Lokalizacje w zapytaniu, gdzie wystąpił błąd
}

/**
 * Definiuje ogólną strukturę odpowiedzi błędu z API (np. REST).
 * Może zawierać różne pola w zależności od implementacji serwera.
 */
export interface ApiErrorResponse {
    message?: string; // Główny komunikat błędu (często używane)
    Message?: string; // Alternatywna nazwa dla komunikatu błędu (np. z .NET)
    title?: string;   // Tytuł błędu (np. dla błędów walidacji)
    errors?: { [key: string]: string[] }; // Słownik błędów walidacji (klucz to nazwa pola)
    [key: string]: any; // Umożliwia inne, niestandardowe pola
}

/**
 * Generyczny interfejs dla odpowiedzi z serwera GraphQL.
 * @template T Typ danych zawartych w polu `data`.
 */
export interface GraphQLResponse<T> {
    data?: T;           // Dane odpowiedzi, jeśli operacja się powiodła
    errors?: ApiError[]; // Tablica błędów, jeśli operacja się nie powiodła
}

// --- Typy związane z autoryzacją i użytkownikiem ---

/**
 * Definiuje strukturę zdekodowanego tokenu JWT.
 * Zawiera standardowe oświadczenia (claims) oraz potencjalnie niestandardowe.
 */
export interface DecodedJwtToken {
    exp?: number;        // Data wygaśnięcia tokenu (timestamp)
    iat?: number;        // Data wystawienia tokenu (timestamp)
    sub?: string;        // Podmiot (zazwyczaj ID użytkownika)
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[]; // Rola użytkownika (standardowy claim .NET Identity)
    role?: string | string[]; // Alternatywne pole dla roli
    nameid?: string;     // ID użytkownika (często używane)
    unique_name?: string;// Unikalna nazwa użytkownika (często email lub login)
    email?: string;      // Adres email użytkownika
    [key: string]: any;  // Inne, niestandardowe oświadczenia
}

/**
 * Struktura odpowiedzi po pomyślnym zalogowaniu użytkownika.
 */
export interface LoginSuccessResponse {
    token: string;       // Token JWT
    [key: string]: any;  // Inne potencjalne dane
}

/**
 * Struktura odpowiedzi po pomyślnej rejestracji użytkownika.
 * Może być rozszerzona o konkretne pola zwracane przez API.
 */
export interface RegistrationSuccessResponse {
    [key: string]: any; // Ogólna struktura, może być doprecyzowana
}

/**
 * Definiuje strukturę profilu użytkownika.
 */
export interface UserProfile {
    id: string;          // ID użytkownika (zazwyczaj GraphQL ID)
    name: string;        // Imię/nazwa użytkownika
    email: string;       // Adres email użytkownika
    bookings?: {         // Opcjonalna lista rezerwacji użytkownika (z paginacją)
        nodes: Booking[];
        totalCount: number;
        pageInfo: PageInfo; // Informacje o paginacji dla rezerwacji
    } | null;
}

/**
 * Struktura danych odpowiedzi dla zapytania GraphQL o profil użytkownika (`myProfile`).
 */
export interface MyProfileQueryData {
    myProfile: UserProfile | null; // Dane profilu lub null, jeśli nie znaleziono/błąd
}

// --- Typy związane z mieszkaniami (Apartments) ---

/**
 * Definiuje strukturę recenzji mieszkania.
 */
export interface Review {
    id: string;                   // ID recenzji (GraphQL ID)
    comment: string;              // Treść komentarza
    rating: number;               // Ocena (np. 1-5)
    user?: { name: string };      // Opcjonalne dane autora recenzji
    apartmentId?: string;         // Opcjonalne ID mieszkania, którego dotyczy recenzja
    userId?: string;              // Opcjonalne ID użytkownika, który napisał recenzję
    reviewDate?: string;          // Opcjonalna data wystawienia recenzji
}

/**
 * Definiuje szczegółową strukturę obiektu mieszkania.
 */
export interface Apartment {
    id: string;                 // Globalne ID GraphQL mieszkania
    databaseId: string;         // ID mieszkania z bazy danych (np. UUID), używane do operacji CRUD
    name: string;               // Nazwa mieszkania
    description: string;        // Opis mieszkania
    location: string;           // Lokalizacja
    numberOfBedrooms: number;   // Liczba sypialni
    numberOfBathrooms: number;  // Liczba łazienek
    amenities: string[];        // Lista udogodnień
    isAvailable: boolean;       // Czy mieszkanie jest aktualnie dostępne
    pricePerNight: number;      // Cena za noc
    reviews?: {                 // Opcjonalna lista recenzji (z paginacją)
        nodes: Review[];
        totalCount: number;
    };
    imageUrls?: string[];       // Opcjonalna lista URL-i do zdjęć mieszkania
}

/**
 * Informacje o paginacji w odpowiedziach GraphQL (zgodne ze specyfikacją Relay Cursor Connections).
 */
export interface PageInfo {
    hasNextPage: boolean;        // Czy istnieje następna strona wyników
    hasPreviousPage: boolean;    // Czy istnieje poprzednia strona wyników
    startCursor?: string | null;  // Kursor do pierwszego elementu na bieżącej stronie
    endCursor?: string | null;    // Kursor do ostatniego elementu na bieżącej stronie
}

/**
 * Reprezentuje krawędź (edge) w połączeniu GraphQL dla mieszkań.
 * Zawiera kursor i węzeł (node) z danymi mieszkania.
 */
export interface ApartmentEdge {
    cursor: string;    // Kursor do tego konkretnego elementu
    node: Apartment;   // Dane mieszkania
}

/**
 * Reprezentuje połączenie (connection) GraphQL dla listy mieszkań.
 * Umożliwia paginację opartą na kursorach.
 */
export interface ApartmentsConnection {
    nodes?: Apartment[];      // Lista mieszkań (jeśli nie używa się krawędzi)
    edges?: ApartmentEdge[];  // Lista krawędzi (zawierających mieszkania i kursory)
    pageInfo: PageInfo;       // Informacje o paginacji
    totalCount: number;       // Całkowita liczba mieszkań pasujących do zapytania
}

/**
 * Struktura danych odpowiedzi dla zapytania GraphQL o listę mieszkań.
 */
export interface ApartmentsQueryData {
    apartments: ApartmentsConnection; // Połączenie z listą mieszkań
}

/**
 * Dane wejściowe dla mutacji GraphQL dodającej nowe mieszkanie.
 */
export interface AddApartmentInput {
    name: string;
    description: string;
    location: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    amenities: string[];
    isAvailable: boolean;
    pricePerNight: number;
    // ownerId?: string; // Opcjonalne, jeśli przypisanie właściciela odbywa się inaczej
}

/**
 * Dane wejściowe dla mutacji GraphQL aktualizującej istniejące mieszkanie.
 * Rozszerza `AddApartmentInput` (wszystkie pola są opcjonalne) i wymaga `id`.
 */
export interface UpdateApartmentInput extends Partial<AddApartmentInput> {
    id: string; // ID mieszkania (GraphQL ID) do zaktualizowania
    // `Partial<AddApartmentInput>` oznacza, że wszystkie pola z AddApartmentInput są opcjonalne
}

/**
 * Ładunek (payload) odpowiedzi dla mutacji `addApartment`.
 */
export interface AddApartmentMutationPayload {
    addApartment: {
        id: string;   // ID nowo dodanego mieszkania
        name: string; // Nazwa nowo dodanego mieszkania
        // Można dodać więcej pól, jeśli są zwracane przez mutację
    };
}

/**
 * Ładunek odpowiedzi dla mutacji `updateApartment`.
 */
export interface UpdateApartmentMutationPayload {
    updateApartment: Apartment; // Zaktualizowane dane mieszkania
}

/**
 * Ładunek odpowiedzi dla mutacji `deleteApartment`.
 */
export interface DeleteApartmentMutationPayload {
    deleteApartment: boolean; // `true` jeśli usunięcie się powiodło, `false` w przeciwnym razie
}

/**
 * Uproszczona struktura mieszkania na potrzeby list wyboru (np. w formularzach).
 */
export interface ApartmentForSelect {
    databaseId: string;            // ID z bazy danych (do identyfikacji)
    name: string;                  // Nazwa mieszkania
    pricePerNight: number | null;  // Cena za noc (może być null)
}

/**
 * Struktura danych odpowiedzi dla zapytania GraphQL o listę mieszkań do selectów.
 */
export interface ApartmentsForSelectQueryData {
    apartments: {
        nodes: ApartmentForSelect[]; // Lista uproszczonych danych mieszkań
    };
}

// --- Typy związane z rezerwacjami (Bookings) ---

/**
 * Uproszczone informacje o mieszkaniu, używane w kontekście rezerwacji.
 */
export interface BookingApartmentInfo {
    id: string;         // ID mieszkania (GraphQL ID)
    name: string;       // Nazwa mieszkania
    location?: string; // Opcjonalna lokalizacja
}

/**
 * Uproszczone informacje o użytkowniku, używane w kontekście rezerwacji.
 */
export interface BookingUserMiniInfo {
    id: string;       // ID użytkownika (GraphQL ID)
    name: string;     // Imię/nazwa użytkownika
    email?: string;   // Opcjonalny email
}

/**
 * Definiuje szczegółową strukturę obiektu rezerwacji.
 */
export interface Booking {
    id: string;                             // Globalne ID GraphQL rezerwacji
    databaseId: string;                     // ID rezerwacji z bazy danych (np. UUID)
    checkInDate: string;                    // Data zameldowania (ISO string)
    checkOutDate: string;                   // Data wymeldowania (ISO string)
    totalPrice: number;                     // Całkowita cena rezerwacji
    bookingDate: string;                    // Data dokonania rezerwacji (ISO string)
    apartmentId: string;                    // ID mieszkania (może być GraphQL ID lub databaseId, zależnie od API)
    userId: string;                         // ID użytkownika
    apartment?: BookingApartmentInfo | null; // Opcjonalne, zagnieżdżone dane mieszkania
    user?: BookingUserMiniInfo | null;       // Opcjonalne, zagnieżdżone dane użytkownika
}

/**
 * Dane wejściowe (DTO) dla żądania REST API tworzącego nową rezerwację.
 */
export interface NewBookingRESTInput {
    apartmentId: string; // ID mieszkania (prawdopodobnie databaseId)
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
}

/**
 * Struktura odpowiedzi z REST API po pomyślnym utworzeniu rezerwacji.
 */
export interface NewBookingRESTSuccessResponse {
    id: string;                   // ID nowo utworzonej rezerwacji (z bazy danych)
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    bookingDate: string;
    apartmentId: string;          // ID powiązanego mieszkania
    apartmentName?: string | null;// Opcjonalna nazwa mieszkania
    userId: string;               // ID użytkownika, który dokonał rezerwacji
    userName?: string | null;    // Opcjonalna nazwa użytkownika
}

/**
 * Struktura danych odpowiedzi dla zapytania GraphQL o wszystkie rezerwacje (dla admina).
 */
export interface AllBookingsAdminQueryData {
    allBookingsForAdmin: { // Klucz główny w odpowiedzi
        nodes: Booking[];      // Lista rezerwacji
        totalCount: number;    // Całkowita liczba rezerwacji
    };
}

/**
 * Ładunek odpowiedzi dla mutacji GraphQL usuwającej rezerwację.
 */
export interface DeleteBookingMutationPayload {
    deleteBooking: boolean; // `true` jeśli usunięcie się powiodło
}

// --- Typy związane ze zgłoszeniami (Tickets) ---

/**
 * Dane wejściowe (DTO) dla utworzenia nowego zgłoszenia (ticketu).
 * Używane prawdopodobnie z REST API serwisu zgłoszeń.
 */
export interface CreateTicketDto {
    subject: string;     // Temat zgłoszenia
    description: string; // Opis problemu/pytania
}

/**
 * Definiuje strukturę odpowiedzi na zgłoszenie (ticket reply).
 */
export interface TicketReply {
    id: string;                     // ID odpowiedzi
    ticketId: string;               // ID zgłoszenia, którego dotyczy odpowiedź
    replierUserId: string;          // ID użytkownika odpowiadającego
    replierUserEmail?: string | null;// Opcjonalny email odpowiadającego
    message: string;                // Treść odpowiedzi
    repliedAt: string;              // Data odpowiedzi (ISO string)
}

/**
 * Definiuje strukturę odpowiedzi dla listy zgłoszeń (np. "moje zgłoszenia" lub lista dla admina).
 * Zawiera elementy (zgłoszenia) oraz informacje o paginacji.
 */
export interface MyTicketsResponse { // Nazwa może być myląca, jeśli używana też dla admina
    items: Ticket[];         // Lista zgłoszeń na bieżącej stronie
    totalCount: number;      // Całkowita liczba zgłoszeń pasujących do kryteriów
    pageNumber: number;      // Numer bieżącej strony
    pageSize: number;        // Liczba elementów na stronie
}

/**
 * Definiuje szczegółową strukturę obiektu zgłoszenia (ticketu).
 */
export interface Ticket {
    id: string;                     // ID zgłoszenia
    userId: string;                 // ID użytkownika, który utworzył zgłoszenie
    userEmail: string;              // Email użytkownika, który utworzył zgłoszenie
    subject: string;                // Temat zgłoszenia
    description: string;            // Opis zgłoszenia
    status: string;                 // Status zgłoszenia (np. "Open", "Closed", "PendingUserReply")
    createdAt: string;              // Data utworzenia (ISO string)
    lastUpdatedAt?: string | null;   // Data ostatniej aktualizacji (ISO string, opcjonalna)
    replies?: TicketReply[];         // Opcjonalna lista odpowiedzi na zgłoszenie
}

/**
 * Alias typu dla odpowiedzi po utworzeniu zgłoszenia. Odpowiedź zawiera pełny obiekt Ticket.
 */
export type CreatedTicketResponse = Ticket;

/**
 * Dane wejściowe (DTO) dla utworzenia nowej odpowiedzi na zgłoszenie.
 */
export interface CreateTicketReplyDto {
    message: string; // Treść odpowiedzi
}

// --- Typy związane z recenzjami (ponownie, dla mutacji GraphQL) ---

/**
 * Dane wejściowe dla mutacji GraphQL dodającej nową recenzję.
 */
export interface AddReviewInput {
    apartmentId: string; // ID mieszkania, którego dotyczy recenzja (GraphQL ID lub databaseId)
    rating: number;      // Ocena
    comment: string;     // Komentarz
}

/**
 * Ładunek (payload) wewnątrz odpowiedzi mutacji `addReview`.
 * Może zawierać utworzoną recenzję lub listę błędów.
 */
export interface AddReviewPayload {
    review?: Review | null;   // Utworzona recenzja lub null/undefined w przypadku błędu
    errors?: ApiError[] | null; // Lista błędów specyficznych dla tej operacji
}

/**
 * Struktura danych odpowiedzi dla mutacji GraphQL `addReview`.
 */
export interface AddReviewMutationData {
    addReview: AddReviewPayload; // Główny obiekt odpowiedzi mutacji
}

/**
 * Ładunek odpowiedzi dla mutacji GraphQL usuwającej recenzję.
 */
export interface DeleteReviewMutationData {
    deleteReview: boolean | null; // `true` jeśli usunięcie się powiodło, `false` lub `null` w przeciwnym razie
}