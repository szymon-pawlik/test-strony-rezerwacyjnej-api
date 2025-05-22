// utils.ts
import { DecodedJwtToken } from './types.js'; // Zaimportuj zdefiniowany interfejs

export function parseJwt(token: string | null | undefined): DecodedJwtToken | null {
    if (!token) { // Sprawdzenie, czy token jest null, undefined lub pustym stringiem
        return null;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            // Poprawny JWT składa się z 3 części (header, payload, signature)
            console.error("Invalid JWT format: token does not have 3 parts.");
            return null;
        }

        const base64Url = parts[1]; // Payload to druga część
        if (!base64Url) {
            console.error("Invalid JWT format: payload part is missing.");
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c: string) { // Dodajemy typ dla 'c'
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        // Używamy asercji typu, ponieważ JSON.parse zwraca 'any'
        return JSON.parse(jsonPayload) as DecodedJwtToken;
    } catch (e: any) { // Typujemy błąd jako 'any' lub 'unknown'
        console.error("Error parsing JWT token:", e.message || e); // Lepiej logować e.message, jeśli istnieje

        // Usunięcie tokenu z localStorage w przypadku błędu parsowania.
        // To jest efekt uboczny tej funkcji. Czasem logikę taką przenosi się
        // do miejsca wywołania parseJwt, ale zostawiam zgodnie z oryginałem.
        try {
            localStorage.removeItem('jwtToken');
        } catch (storageError) {
            console.error("Error removing token from localStorage:", storageError);
        }
        return null;
    }
}