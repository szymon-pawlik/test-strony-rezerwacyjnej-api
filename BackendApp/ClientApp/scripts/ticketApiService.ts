// Importy funkcji do pobierania stanu autoryzacji oraz typów danych
import { getJwtToken } from './state.js';
import { Ticket, CreateTicketDto, CreatedTicketResponse, TicketReply, CreateTicketReplyDto, ApiErrorResponse, MyTicketsResponse } from './types.js';

// Podstawowy adres URL dla serwisu obsługującego zgłoszenia (tickety)
const TICKET_SERVICE_APP_URL = 'http://localhost:5211'; // Prawdopodobnie inny port niż główny backend

/**
 * Wysyła nowe zgłoszenie (ticket) do serwisu zgłoszeń.
 * Wymaga zalogowanego użytkownika.
 * @param ticketData Dane nowego zgłoszenia (temat, opis).
 * @returns Obiekt CreatedTicketResponse w przypadku sukcesu, lub null w przypadku błędu.
 */
export async function submitNewTicket(ticketData: CreateTicketDto): Promise<CreatedTicketResponse | null> {
    console.log('[INFO] ticketApiService: Attempting to submit new ticket:', ticketData);
    const token = getJwtToken(); // Pobranie tokenu JWT do autoryzacji

    // Sprawdzenie, czy użytkownik jest zalogowany
    if (!token) {
        console.error('[ERROR] ticketApiService: User not logged in. Cannot submit ticket.');
        alert("Musisz być zalogowany, aby wysłać zgłoszenie.");
        return null;
    }

    const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets`; // Endpoint API do tworzenia zgłoszeń
    console.log('[DEBUG] ticketApiService: Request URL for submitNewTicket:', requestUrl);

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Dołączenie tokenu do nagłówka
            },
            body: JSON.stringify(ticketData)
        });

        if (response.status === 201) { // Status 201 Created oznacza pomyślne utworzenie
            const createdTicket: CreatedTicketResponse = await response.json();
            console.log('[INFO] ticketApiService: Ticket submitted successfully:', createdTicket);
            return createdTicket;
        } else { // Obsługa błędów odpowiedzi serwera
            let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
            try {
                const errorBodyText = await response.text(); // Próba odczytania ciała błędu
                if (errorBodyText) {
                    errorResponseMessage = errorBodyText; // Domyślnie użyj surowego tekstu
                    const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse; // Spróbuj sparsować jako JSON
                    // Formatowanie komunikatu błędu na podstawie struktury JSON
                    if (errorJson.title && errorJson.errors) {
                        errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                    } else if (errorJson.message) {
                        errorResponseMessage = errorJson.message;
                    } else if (errorJson.Message) { // Alternatywna nazwa pola
                        errorResponseMessage = errorJson.Message;
                    } else if (errorJson.title) {
                        errorResponseMessage = errorJson.title;
                    }
                }
            } catch (e) {
                console.warn("[WARN] ticketApiService: Could not parse error response as JSON for submitNewTicket, using raw text.");
            }
            console.error(`[ERROR] ticketApiService: Error submitting ticket. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
            alert(`Błąd wysyłania zgłoszenia: ${response.status} - ${errorResponseMessage}`);
            return null;
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error(`[ERROR] ticketApiService: Network error while submitting ticket to ${requestUrl}:`, error);
        alert(`Błąd sieciowy podczas wysyłania zgłoszenia: ${error.message || "Nie można połączyć się z serwerem"}`);
        return null;
    }
}

/**
 * Pobiera wszystkie zgłoszenia dla administratora z paginacją.
 * Wymaga zalogowanego administratora.
 * @param pageNumber Numer strony (domyślnie 1).
 * @param pageSize Rozmiar strony (domyślnie 10).
 * @returns Obiekt MyTicketsResponse zawierający listę zgłoszeń i informacje o paginacji.
 * @throws Error w przypadku błędu autoryzacji lub błędu serwera/sieci.
 */
export async function fetchAllTicketsForAdmin(pageNumber: number = 1, pageSize: number = 10): Promise<MyTicketsResponse> {
    console.log(`[INFO] ticketApiService: Attempting to fetch all tickets for admin. Page: ${pageNumber}, Size: ${pageSize}`);
    const token = getJwtToken();

    if (!token) { // Sprawdzenie autoryzacji
        console.error('[ERROR] ticketApiService: Admin not logged in. Cannot fetch tickets.');
        throw new Error("Brak autoryzacji. Zaloguj się jako administrator.");
    }

    const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`; // Endpoint API z parametrami paginacji
    console.log('[DEBUG] ticketApiService: Request URL for fetchAllTicketsForAdmin:', requestUrl);

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) { // Jeśli odpowiedź jest pomyślna (status 2xx)
            const responseData = await response.json();
            // Sprawdzenie, czy struktura odpowiedzi jest zgodna z oczekiwaniami
            if (responseData && Array.isArray(responseData.items) && typeof responseData.totalCount === 'number') {
                return {
                    items: responseData.items as Ticket[],
                    totalCount: responseData.totalCount,
                    pageNumber: responseData.pageNumber || pageNumber, // Użyj zwróconych wartości lub domyślnych
                    pageSize: responseData.pageSize || pageSize
                };
            } else {
                console.error('[ERROR] ticketApiService: Unexpected response structure for admin tickets. Expected { items: [], totalCount: X, ... } but got:', responseData);
                throw new Error("Otrzymano nieoczekiwaną strukturę danych dla listy ticketów.");
            }
        } else { // Obsługa błędów odpowiedzi serwera
            let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
            try {
                const errorBodyText = await response.text();
                if (errorBodyText) {
                    errorResponseMessage = errorBodyText;
                    const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
                    if (errorJson.title && errorJson.errors) {  errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`; }
                    else if (errorJson.message) { errorResponseMessage = errorJson.message; }
                    else if (errorJson.Message) { errorResponseMessage = errorJson.Message; }
                    else if (errorJson.title) { errorResponseMessage = errorJson.title; }
                }
            } catch (e) {
                console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchAllTicketsForAdmin, using raw text.");
            }
            console.error(`[ERROR] ticketApiService: Error fetching admin tickets. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
            throw new Error(`Nie udało się pobrać ticketów: ${response.status} - ${errorResponseMessage}`);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error(`[ERROR] ticketApiService: Network error while fetching admin tickets from ${requestUrl}:`, error);
        throw new Error(`Błąd sieciowy podczas pobierania ticketów: ${error.message || "Nie można połączyć się z serwerem ticketów"}`);
    }
}

/**
 * Pobiera szczegóły konkretnego zgłoszenia na podstawie jego ID.
 * Wymaga zalogowanego użytkownika (uprawnienia sprawdzane po stronie serwera).
 * @param ticketId ID zgłoszenia do pobrania.
 * @returns Obiekt Ticket w przypadku sukcesu, lub null w przypadku błędu.
 * @throws Error w przypadku błędu autoryzacji lub błędu serwera/sieci.
 */
export async function fetchTicketById(ticketId: string): Promise<Ticket | null> {
    console.log('[INFO] ticketApiService: Attempting to fetch ticket by ID:', ticketId);
    const token = getJwtToken();
    if (!token) { // Sprawdzenie autoryzacji
        console.error('[ERROR] ticketApiService: User not logged in. Cannot fetch ticket details.');
        throw new Error("Brak autoryzacji. Zaloguj się.");
    }

    const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/${ticketId}`; // Endpoint API do pobierania zgłoszenia po ID
    console.log('[DEBUG] ticketApiService: Request URL for fetchTicketById:', requestUrl);

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const ticket: Ticket = await response.json();
            console.log(`[INFO] ticketApiService: Fetched ticket details for ID ${ticketId}:`, ticket);
            return ticket;
        } else { // Obsługa błędów odpowiedzi serwera
            let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
            try {
                const errorBodyText = await response.text();
                if (errorBodyText) {
                    errorResponseMessage = errorBodyText;
                    const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
                    if (errorJson.title && errorJson.errors) { errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`; }
                    else if (errorJson.message) { errorResponseMessage = errorJson.message; }
                    else if (errorJson.Message) { errorResponseMessage = errorJson.Message; }
                    else if (errorJson.title) { errorResponseMessage = errorJson.title; }
                }
            } catch (e) {
                console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchTicketById, using raw text.");
            }
            console.error(`[ERROR] ticketApiService: Error fetching ticket details for ID ${ticketId}. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
            throw new Error(`Nie udało się pobrać szczegółów ticketu: ${response.status} - ${errorResponseMessage}`);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error(`[ERROR] ticketApiService: Network error while fetching ticket details from ${requestUrl}:`, error);
        throw new Error(`Błąd sieciowy podczas pobierania szczegółów ticketu: ${error.message || "Nie można połączyć się z serwerem ticketów"}`);
    }
}

/**
 * Wysyła odpowiedź na zgłoszenie.
 * Wymaga zalogowanego użytkownika (uprawnienia do odpowiedzi sprawdzane po stronie serwera).
 * @param ticketId ID zgłoszenia, na które jest wysyłana odpowiedź.
 * @param replyData Dane odpowiedzi (wiadomość).
 * @returns Obiekt TicketReply w przypadku sukcesu, lub null w przypadku błędu.
 */
export async function submitTicketReply(ticketId: string, replyData: CreateTicketReplyDto): Promise<TicketReply | null> {
    console.log('[INFO] ticketApiService: Attempting to submit reply for ticket ID:', ticketId, 'Data:', replyData);
    const token = getJwtToken();
    if (!token) { // Sprawdzenie autoryzacji
        console.error('[ERROR] ticketApiService: User not logged in. Cannot submit reply.');
        alert("Musisz być zalogowany, aby wysłać odpowiedź.");
        return null;
    }

    const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/${ticketId}/replies`; // Endpoint API do dodawania odpowiedzi
    console.log('[DEBUG] ticketApiService: Request URL for submitTicketReply:', requestUrl);

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(replyData)
        });

        if (response.status === 201) { // Status 201 Created dla pomyślnie dodanej odpowiedzi
            const createdReply: TicketReply = await response.json();
            console.log('[INFO] ticketApiService: Reply submitted successfully:', createdReply);
            return createdReply;
        } else { // Obsługa błędów odpowiedzi serwera
            let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
            try {
                const errorBodyText = await response.text();
                if (errorBodyText) {
                    errorResponseMessage = errorBodyText;
                    const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
                    if (errorJson.title && errorJson.errors) { errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`; }
                    else if (errorJson.message) { errorResponseMessage = errorJson.message; }
                    else if (errorJson.Message) { errorResponseMessage = errorJson.Message; }
                    else if (errorJson.title) { errorResponseMessage = errorJson.title; }
                }
            } catch (e) {
                console.warn("[WARN] ticketApiService: Could not parse error response as JSON for submitTicketReply, using raw text.");
            }
            console.error(`[ERROR] ticketApiService: Error submitting reply. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
            alert(`Błąd wysyłania odpowiedzi: ${response.status} - ${errorResponseMessage}`);
            return null;
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error(`[ERROR] ticketApiService: Network error while submitting reply to ${requestUrl}:`, error);
        alert(`Błąd sieciowy podczas wysyłania odpowiedzi: ${error.message || "Nie można połączyć się z serwerem"}`);
        return null;
    }
}

/**
 * Pobiera zgłoszenia (tickety) utworzone przez aktualnie zalogowanego użytkownika, z paginacją.
 * Wymaga zalogowanego użytkownika.
 * @param pageNumber Numer strony (domyślnie 1).
 * @param pageSize Rozmiar strony (domyślnie 10).
 * @returns Obiekt MyTicketsResponse zawierający listę zgłoszeń użytkownika i informacje o paginacji.
 * @throws Error w przypadku błędu autoryzacji lub błędu serwera/sieci.
 */
export async function fetchMyTickets(pageNumber: number = 1, pageSize: number = 10): Promise<MyTicketsResponse> {
    console.log(`[INFO] ticketApiService: Attempting to fetch my tickets. Page: ${pageNumber}, Size: ${pageSize}`);
    const token = getJwtToken();
    if (!token) { // Sprawdzenie autoryzacji
        console.error('[ERROR] ticketApiService: User not logged in. Cannot fetch my tickets.');
        throw new Error("Musisz być zalogowany, aby zobaczyć swoje zgłoszenia.");
    }

    const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/my-tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`; // Endpoint API dla "moich zgłoszeń"
    console.log('[DEBUG] ticketApiService: Request URL for fetchMyTickets:', requestUrl);

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) { // Jeśli odpowiedź jest pomyślna
            const data = await response.json();
            // Sprawdzenie struktury odpowiedzi
            if (data && Array.isArray(data.items) && typeof data.totalCount === 'number') {
                return {
                    items: data.items as Ticket[],
                    totalCount: data.totalCount,
                    pageNumber: data.pageNumber || pageNumber,
                    pageSize: data.pageSize || pageSize
                };
            } else {
                console.error('[ERROR] ticketApiService: Unexpected response structure for my tickets.', data);
                throw new Error("Otrzymano nieoczekiwaną strukturę danych dla Twoich zgłoszeń.");
            }
        } else { // Obsługa błędów odpowiedzi serwera
            let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
            try {
                const errorBodyText = await response.text();
                if (errorBodyText) {
                    errorResponseMessage = errorBodyText;
                    const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
                    if (errorJson.title && errorJson.errors) {  errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`; }
                    else if (errorJson.message) { errorResponseMessage = errorJson.message; }
                    else if (errorJson.Message) { errorResponseMessage = errorJson.Message; }
                    else if (errorJson.title) { errorResponseMessage = errorJson.title; }
                }
            } catch (e) {
                console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchMyTickets, using raw text.");
            }
            console.error(`[ERROR] ticketApiService: Error fetching my tickets. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
            throw new Error(`Nie udało się pobrać Twoich zgłoszeń: ${response.status} - ${errorResponseMessage}`);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error(`[ERROR] ticketApiService: Network error while fetching my tickets from ${requestUrl}:`, error);
        throw new Error(`Błąd sieciowy podczas pobierania Twoich zgłoszeń: ${error.message || "Nie można połączyć się z serwerem"}`);
    }
}