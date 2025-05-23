var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getJwtToken } from './state.js';
const TICKET_SERVICE_APP_URL = 'http://localhost:5211';
export function submitNewTicket(ticketData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[INFO] ticketApiService: Attempting to submit new ticket:', ticketData);
        const token = getJwtToken();
        if (!token) {
            console.error('[ERROR] ticketApiService: User not logged in. Cannot submit ticket.');
            alert("Musisz być zalogowany, aby wysłać zgłoszenie.");
            return null;
        }
        const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets`;
        console.log('[DEBUG] ticketApiService: Request URL for submitNewTicket:', requestUrl);
        try {
            const response = yield fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ticketData)
            });
            if (response.status === 201) {
                const createdTicket = yield response.json();
                console.log('[INFO] ticketApiService: Ticket submitted successfully:', createdTicket);
                return createdTicket;
            }
            else {
                let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        errorResponseMessage = errorBodyText;
                        const errorJson = JSON.parse(errorBodyText);
                        if (errorJson.title && errorJson.errors) {
                            errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                        }
                        else if (errorJson.message) {
                            errorResponseMessage = errorJson.message;
                        }
                        else if (errorJson.Message) {
                            errorResponseMessage = errorJson.Message;
                        }
                        else if (errorJson.title) {
                            errorResponseMessage = errorJson.title;
                        }
                    }
                }
                catch (e) {
                    console.warn("[WARN] ticketApiService: Could not parse error response as JSON for submitNewTicket, using raw text.");
                }
                console.error(`[ERROR] ticketApiService: Error submitting ticket. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
                alert(`Błąd wysyłania zgłoszenia: ${response.status} - ${errorResponseMessage}`);
                return null;
            }
        }
        catch (error) {
            console.error(`[ERROR] ticketApiService: Network error while submitting ticket to ${requestUrl}:`, error);
            alert(`Błąd sieciowy podczas wysyłania zgłoszenia: ${error.message || "Nie można połączyć się z serwerem"}`);
            return null;
        }
    });
}
export function fetchAllTicketsForAdmin() {
    return __awaiter(this, arguments, void 0, function* (pageNumber = 1, pageSize = 10) {
        console.log(`[INFO] ticketApiService: Attempting to fetch all tickets for admin. Page: ${pageNumber}, Size: ${pageSize}`);
        const token = getJwtToken();
        if (!token) {
            console.error('[ERROR] ticketApiService: Admin not logged in. Cannot fetch tickets.');
            throw new Error("Brak autoryzacji. Zaloguj się jako administrator.");
        }
        const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        console.log('[DEBUG] ticketApiService: Request URL for fetchAllTicketsForAdmin:', requestUrl);
        try {
            const response = yield fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const responseData = yield response.json();
                if (responseData && Array.isArray(responseData.items) && typeof responseData.totalCount === 'number') {
                    return {
                        items: responseData.items,
                        totalCount: responseData.totalCount,
                        pageNumber: responseData.pageNumber || pageNumber,
                        pageSize: responseData.pageSize || pageSize
                    };
                }
                else {
                    console.error('[ERROR] ticketApiService: Unexpected response structure for admin tickets. Expected { items: [], totalCount: X, ... } but got:', responseData);
                    throw new Error("Otrzymano nieoczekiwaną strukturę danych dla listy ticketów.");
                }
            }
            else {
                let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        errorResponseMessage = errorBodyText;
                        const errorJson = JSON.parse(errorBodyText);
                        if (errorJson.title && errorJson.errors) {
                            errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                        }
                        else if (errorJson.message) {
                            errorResponseMessage = errorJson.message;
                        }
                        else if (errorJson.Message) {
                            errorResponseMessage = errorJson.Message;
                        }
                        else if (errorJson.title) {
                            errorResponseMessage = errorJson.title;
                        }
                    }
                }
                catch (e) {
                    console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchAllTicketsForAdmin, using raw text.");
                }
                console.error(`[ERROR] ticketApiService: Error fetching admin tickets. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
                throw new Error(`Nie udało się pobrać ticketów: ${response.status} - ${errorResponseMessage}`);
            }
        }
        catch (error) {
            console.error(`[ERROR] ticketApiService: Network error while fetching admin tickets from ${requestUrl}:`, error);
            throw new Error(`Błąd sieciowy podczas pobierania ticketów: ${error.message || "Nie można połączyć się z serwerem ticketów"}`);
        }
    });
}
export function fetchTicketById(ticketId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[INFO] ticketApiService: Attempting to fetch ticket by ID:', ticketId);
        const token = getJwtToken();
        if (!token) {
            console.error('[ERROR] ticketApiService: User not logged in. Cannot fetch ticket details.');
            throw new Error("Brak autoryzacji. Zaloguj się.");
        }
        const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/${ticketId}`;
        console.log('[DEBUG] ticketApiService: Request URL for fetchTicketById:', requestUrl);
        try {
            const response = yield fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const ticket = yield response.json();
                console.log(`[INFO] ticketApiService: Fetched ticket details for ID ${ticketId}:`, ticket);
                return ticket;
            }
            else {
                let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        errorResponseMessage = errorBodyText;
                        const errorJson = JSON.parse(errorBodyText);
                        if (errorJson.title && errorJson.errors) {
                            errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                        }
                        else if (errorJson.message) {
                            errorResponseMessage = errorJson.message;
                        }
                        else if (errorJson.Message) {
                            errorResponseMessage = errorJson.Message;
                        }
                        else if (errorJson.title) {
                            errorResponseMessage = errorJson.title;
                        }
                    }
                }
                catch (e) {
                    console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchTicketById, using raw text.");
                }
                console.error(`[ERROR] ticketApiService: Error fetching ticket details for ID ${ticketId}. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
                throw new Error(`Nie udało się pobrać szczegółów ticketu: ${response.status} - ${errorResponseMessage}`);
            }
        }
        catch (error) {
            console.error(`[ERROR] ticketApiService: Network error while fetching ticket details from ${requestUrl}:`, error);
            throw new Error(`Błąd sieciowy podczas pobierania szczegółów ticketu: ${error.message || "Nie można połączyć się z serwerem ticketów"}`);
        }
    });
}
export function submitTicketReply(ticketId, replyData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[INFO] ticketApiService: Attempting to submit reply for ticket ID:', ticketId, 'Data:', replyData);
        const token = getJwtToken();
        if (!token) {
            console.error('[ERROR] ticketApiService: User not logged in. Cannot submit reply.');
            alert("Musisz być zalogowany, aby wysłać odpowiedź.");
            return null;
        }
        const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/${ticketId}/replies`;
        console.log('[DEBUG] ticketApiService: Request URL for submitTicketReply:', requestUrl);
        try {
            const response = yield fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(replyData)
            });
            if (response.status === 201) {
                const createdReply = yield response.json();
                console.log('[INFO] ticketApiService: Reply submitted successfully:', createdReply);
                return createdReply;
            }
            else {
                let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        errorResponseMessage = errorBodyText;
                        const errorJson = JSON.parse(errorBodyText);
                        if (errorJson.title && errorJson.errors) {
                            errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                        }
                        else if (errorJson.message) {
                            errorResponseMessage = errorJson.message;
                        }
                        else if (errorJson.Message) {
                            errorResponseMessage = errorJson.Message;
                        }
                        else if (errorJson.title) {
                            errorResponseMessage = errorJson.title;
                        }
                    }
                }
                catch (e) {
                    console.warn("[WARN] ticketApiService: Could not parse error response as JSON for submitTicketReply, using raw text.");
                }
                console.error(`[ERROR] ticketApiService: Error submitting reply. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
                alert(`Błąd wysyłania odpowiedzi: ${response.status} - ${errorResponseMessage}`);
                return null;
            }
        }
        catch (error) {
            console.error(`[ERROR] ticketApiService: Network error while submitting reply to ${requestUrl}:`, error);
            alert(`Błąd sieciowy podczas wysyłania odpowiedzi: ${error.message || "Nie można połączyć się z serwerem"}`);
            return null;
        }
    });
}
export function fetchMyTickets() {
    return __awaiter(this, arguments, void 0, function* (pageNumber = 1, pageSize = 10) {
        console.log(`[INFO] ticketApiService: Attempting to fetch my tickets. Page: ${pageNumber}, Size: ${pageSize}`);
        const token = getJwtToken();
        if (!token) {
            console.error('[ERROR] ticketApiService: User not logged in. Cannot fetch my tickets.');
            throw new Error("Musisz być zalogowany, aby zobaczyć swoje zgłoszenia.");
        }
        const requestUrl = `${TICKET_SERVICE_APP_URL}/api/tickets/my-tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        console.log('[DEBUG] ticketApiService: Request URL for fetchMyTickets:', requestUrl);
        try {
            const response = yield fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = yield response.json();
                if (data && Array.isArray(data.items) && typeof data.totalCount === 'number') {
                    return {
                        items: data.items,
                        totalCount: data.totalCount,
                        pageNumber: data.pageNumber || pageNumber,
                        pageSize: data.pageSize || pageSize
                    };
                }
                else {
                    console.error('[ERROR] ticketApiService: Unexpected response structure for my tickets.', data);
                    throw new Error("Otrzymano nieoczekiwaną strukturę danych dla Twoich zgłoszeń.");
                }
            }
            else {
                let errorResponseMessage = `Nieznany błąd serwera (status: ${response.status})`;
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        errorResponseMessage = errorBodyText;
                        const errorJson = JSON.parse(errorBodyText);
                        if (errorJson.title && errorJson.errors) {
                            errorResponseMessage = `${errorJson.title}: ${Object.values(errorJson.errors).flat().join('; ')}`;
                        }
                        else if (errorJson.message) {
                            errorResponseMessage = errorJson.message;
                        }
                        else if (errorJson.Message) {
                            errorResponseMessage = errorJson.Message;
                        }
                        else if (errorJson.title) {
                            errorResponseMessage = errorJson.title;
                        }
                    }
                }
                catch (e) {
                    console.warn("[WARN] ticketApiService: Could not parse error response as JSON for fetchMyTickets, using raw text.");
                }
                console.error(`[ERROR] ticketApiService: Error fetching my tickets. Status: ${response.status}. URL: ${requestUrl}`, errorResponseMessage);
                throw new Error(`Nie udało się pobrać Twoich zgłoszeń: ${response.status} - ${errorResponseMessage}`);
            }
        }
        catch (error) {
            console.error(`[ERROR] ticketApiService: Network error while fetching my tickets from ${requestUrl}:`, error);
            throw new Error(`Błąd sieciowy podczas pobierania Twoich zgłoszeń: ${error.message || "Nie można połączyć się z serwerem"}`);
        }
    });
}
//# sourceMappingURL=ticketApiService.js.map