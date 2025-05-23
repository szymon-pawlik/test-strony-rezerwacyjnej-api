// Import typu dla zdekodowanego tokenu JWT
import { DecodedJwtToken } from './types.js';

/**
 * Parsuje token JWT (JSON Web Token) w celu odczytania jego zawartości (payload).
 * Funkcja ta nie weryfikuje podpisu tokenu, jedynie dekoduje jego środkową część.
 * @param token Ciąg znaków reprezentujący token JWT, lub null/undefined.
 * @returns Obiekt DecodedJwtToken zawierający zdekodowane oświadczenia (claims) z tokenu,
 * lub null, jeśli token jest nieprawidłowy lub wystąpił błąd podczas parsowania.
 */
export function parseJwt(token: string | null | undefined): DecodedJwtToken | null {
    // Jeśli token nie istnieje (jest null lub undefined), zwróć null
    if (!token) {
        return null;
    }

    try {
        // Token JWT składa się z trzech części oddzielonych kropkami: Nagłówek.Payload.Podpis
        const parts = token.split('.');
        if (parts.length !== 3) {
            // Jeśli token nie ma dokładnie trzech części, jest nieprawidłowy
            console.error("Invalid JWT format: token does not have 3 parts.");
            return null;
        }

        const base64Url = parts[1]; // Druga część to zakodowany w Base64URL payload
        if (!base64Url) {
            // Jeśli brakuje części payloadu
            console.error("Invalid JWT format: payload part is missing.");
            return null;
        }

        // Konwersja z formatu Base64URL na standardowy Base64
        // (zamiana '-' na '+', '_' na '/')
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Dekodowanie payloadu z Base64 na string JSON
        // Użycie decodeURIComponent do poprawnego odczytania znaków UTF-8
        const jsonPayload = decodeURIComponent(
            atob(base64) // Dekodowanie Base64 do binarnego stringa
                .split('')
                .map(function (c: string) {
                    // Konwersja każdego znaku na jego reprezentację procentową w UTF-8
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        // Parsowanie stringa JSON na obiekt JavaScript
        return JSON.parse(jsonPayload) as DecodedJwtToken;
    } catch (e: any) {
        // Obsługa błędów, które mogą wystąpić podczas parsowania
        // (np. nieprawidłowy format Base64, nieprawidłowy JSON)
        console.error("Error parsing JWT token:", e.message || e);

        // Próba usunięcia potencjalnie nieprawidłowego tokenu z localStorage
        // UWAGA: W state.js używany jest sessionStorage. Warto upewnić się, że to zamierzone.
        try {
            localStorage.removeItem('jwtToken');
        } catch (storageError) {
            console.error("Error removing token from localStorage:", storageError);
        }
        return null; // Zwrócenie null w przypadku błędu parsowania
    }
}