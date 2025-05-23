// Import funkcji do pobierania tokenu JWT ze stanu aplikacji
import { getJwtToken } from './state.js';

// Adres URL serwisu (lub mikroserwisu) odpowiedzialnego za obsługę zgłoszeń (ticketów)
const ticketServiceAppUrl = 'http://localhost:5211';

// Interfejs definiujący strukturę danych potrzebnych do utworzenia nowego zgłoszenia (Data Transfer Object)
interface CreateTicketDto {
    subject: string;     // Temat zgłoszenia
    description: string; // Opis problemu lub zapytania w zgłoszeniu
}

// Interfejs definiujący strukturę obiektu zgłoszenia (Ticket) zwracanego przez API
interface Ticket {
    id: string;          // Unikalny identyfikator zgłoszenia
    subject: string;     // Temat zgłoszenia
    description: string; // Opis zgłoszenia
    status: string;      // Aktualny status zgłoszenia (np. "Open", "Closed", "InProgress")
    createdAt: string;   // Data utworzenia zgłoszenia (w formacie string, np. ISO 8601)
}

/**
 * Wysyła nowe zgłoszenie (ticket) do serwisu zgłoszeń.
 * Wymaga, aby użytkownik był zalogowany.
 * @param ticketData Obiekt CreateTicketDto zawierający dane nowego zgłoszenia.
 * @returns Obiekt Ticket reprezentujący utworzone zgłoszenie w przypadku sukcesu, lub null w przypadku błędu.
 */
export async function submitTicket(ticketData: CreateTicketDto): Promise<Ticket | null> {
    const token = getJwtToken(); // Pobranie tokenu JWT aktualnie zalogowanego użytkownika

    // Sprawdzenie, czy użytkownik jest zalogowany
    if (!token) {
        alert("Musisz być zalogowany, aby wysłać ticket."); // Komunikat dla użytkownika
        return null; // Zakończenie funkcji, jeśli brak tokenu
    }

    try {
        // Wysłanie żądania POST do endpointu API tworzącego nowe zgłoszenia
        const response = await fetch(`${ticketServiceAppUrl}/api/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Określenie typu zawartości jako JSON
                'Authorization': `Bearer ${token}`  // Dołączenie tokenu JWT do nagłówka autoryzacji
            },
            body: JSON.stringify(ticketData) // Przekształcenie danych zgłoszenia na string JSON
        });

        // Sprawdzenie statusu odpowiedzi serwera
        if (response.status === 201) { // Status 201 Created oznacza pomyślne utworzenie zasobu
            const createdTicket: Ticket = await response.json(); // Sparsowanie odpowiedzi JSON na obiekt Ticket
            alert('Ticket wysłany pomyślnie!'); // Potwierdzenie dla użytkownika
            return createdTicket; // Zwrócenie utworzonego zgłoszenia
        } else {
            // Jeśli status odpowiedzi wskazuje na błąd
            const errorResponse = await response.text(); // Odczytanie ciała odpowiedzi błędu jako tekst
            alert(`Błąd wysyłania ticketu: ${response.status} - ${errorResponse}`); // Wyświetlenie błędu użytkownikowi
            console.error("Błąd wysyłania ticketu:", response.status, errorResponse); // Zalogowanie błędu w konsoli
            return null; // Zwrócenie null w przypadku błędu
        }
    } catch (error: any) { // Obsługa błędów sieciowych lub innych nieprzewidzianych problemów
        alert('Błąd sieciowy podczas wysyłania ticketu.'); // Komunikat dla użytkownika
        console.error("Błąd sieciowy (submitTicket):", error); // Zalogowanie błędu w konsoli
        return null; // Zwrócenie null w przypadku błędu sieciowego
    }
}