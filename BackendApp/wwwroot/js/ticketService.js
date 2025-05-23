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
const ticketServiceAppUrl = 'http://localhost:5211';
export function submitTicket(ticketData) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = getJwtToken();
        if (!token) {
            alert("Musisz być zalogowany, aby wysłać ticket.");
            return null;
        }
        try {
            const response = yield fetch(`${ticketServiceAppUrl}/api/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ticketData)
            });
            if (response.status === 201) {
                const createdTicket = yield response.json();
                alert('Ticket wysłany pomyślnie!');
                return createdTicket;
            }
            else {
                const errorResponse = yield response.text();
                alert(`Błąd wysyłania ticketu: ${response.status} - ${errorResponse}`);
                console.error("Błąd wysyłania ticketu:", response.status, errorResponse);
                return null;
            }
        }
        catch (error) {
            alert('Błąd sieciowy podczas wysyłania ticketu.');
            console.error("Błąd sieciowy (submitTicket):", error);
            return null;
        }
    });
}
//# sourceMappingURL=ticketService.js.map