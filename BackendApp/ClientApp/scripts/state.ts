// Import funkcji pomocniczej do parsowania tokenu JWT oraz typu dla zdekodowanego tokenu
import { parseJwt } from './utils.js';
import { DecodedJwtToken } from './types.js';

// Zmienne modułu przechowujące aktualny stan autoryzacji w pamięci
let currentJwtToken: string | null = null; // Przechowuje aktualny token JWT
let currentUserRole: string | null = null; // Przechowuje rolę aktualnie zalogowanego użytkownika

/**
 * Zwraca aktualnie przechowywany token JWT.
 * @returns {string | null} Token JWT lub null, jeśli użytkownik nie jest zalogowany.
 */
export function getJwtToken(): string | null {
    return currentJwtToken;
}

/**
 * Zwraca rolę aktualnie zalogowanego użytkownika.
 * @returns {string | null} Rola użytkownika (np. 'Admin', 'User') lub null.
 */
export function getUserRole(): string | null {
    return currentUserRole;
}

/**
 * Ustawia stan autoryzacji aplikacji na podstawie podanego tokenu.
 * Dekoduje token, aby uzyskać rolę użytkownika i zapisuje token w sessionStorage.
 * @param {string | null} token Token JWT do ustawienia, lub null do wyczyszczenia stanu.
 */
export function setAuthState(token: string | null): void {
    if (!token) { // Jeśli token jest null, czyścimy stan autoryzacji
        currentJwtToken = null;
        currentUserRole = null;
        try {
            sessionStorage.removeItem('jwtToken'); // Usuń token z sessionStorage
        } catch (e) {
            console.error("Błąd podczas usuwania tokenu z sessionStorage w setAuthState:", e);
        }
        return;
    }

    currentJwtToken = token; // Zapisz token w pamięci
    const decodedToken: DecodedJwtToken | null = parseJwt(token); // Zdekoduj token

    if (decodedToken) {
        // Próba odczytania roli z różnych możliwych pól w tokenie
        let roleFromToken: string | string[] | undefined | null =
            decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;

        // Obsługa przypadku, gdy rola jest tablicą (częste w .NET Identity)
        if (Array.isArray(roleFromToken) && roleFromToken.length > 0) {
            currentUserRole = roleFromToken[0]; // Użyj pierwszej roli z tablicy
        } else if (typeof roleFromToken === 'string' && roleFromToken.trim() !== '') {
            currentUserRole = roleFromToken; // Użyj roli jako string
        } else {
            currentUserRole = 'User'; // Domyślna rola, jeśli nie znaleziono
        }
    } else {
        currentUserRole = 'User'; // Domyślna rola, jeśli token jest nieprawidłowy
        console.warn("Nie udało się zdekodować tokenu JWT w setAuthState. Ustawiono domyślną rolę 'User'.");
    }

    try {
        sessionStorage.setItem('jwtToken', token); // Zapisz token w sessionStorage
    } catch (e) {
        console.error("Błąd podczas ustawiania tokenu w sessionStorage w setAuthState:", e);
    }
}

/**
 * Czyści stan autoryzacji aplikacji.
 * Usuwa token i rolę z pamięci oraz token z sessionStorage.
 */
export function clearAuthState(): void {
    currentJwtToken = null;
    currentUserRole = null;
    try {
        sessionStorage.removeItem('jwtToken'); // Usuń token z sessionStorage
    } catch (e) {
        console.error("Błąd podczas usuwania tokenu z sessionStorage w clearAuthState:", e);
    }
}

/**
 * Ładuje stan autoryzacji (token i rolę) z sessionStorage przy starcie aplikacji.
 * Sprawdza ważność tokenu (datę wygaśnięcia).
 * @returns {boolean} True, jeśli załadowano ważny token; false w przeciwnym razie.
 */
export function loadStateFromStorage(): boolean {
    let storedToken: string | null = null;
    try {
        storedToken = sessionStorage.getItem('jwtToken'); // Odczytaj token z sessionStorage
    } catch (e) {
        console.error("Błąd odczytu tokenu z sessionStorage w loadStateFromStorage:", e);
        // W przypadku błędu odczytu (np. brak dostępu do sessionStorage), traktuj jako brak tokenu.
        return false;
    }

    if (storedToken) {
        const decodedToken: DecodedJwtToken | null = parseJwt(storedToken);
        // Sprawdź, czy token został poprawnie zdekodowany i czy nie wygasł
        if (decodedToken && typeof decodedToken.exp === 'number' && decodedToken.exp * 1000 > Date.now()) {
            // Jeśli token jest ważny, ustaw stan autoryzacji w pamięci
            currentJwtToken = storedToken;

            // Logika ekstrakcji roli, taka sama jak w setAuthState
            let roleFromToken: string | string[] | undefined | null =
                decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;

            if (Array.isArray(roleFromToken) && roleFromToken.length > 0) {
                currentUserRole = roleFromToken[0];
            } else if (typeof roleFromToken === 'string' && roleFromToken.trim() !== '') {
                currentUserRole = roleFromToken;
            } else {
                currentUserRole = 'User'; // Domyślna rola
            }
            return true; // Pomyślnie załadowano stan
        } else {
            // Jeśli token wygasł lub jest nieprawidłowy, usuń go z sessionStorage
            try {
                sessionStorage.removeItem('jwtToken');
            } catch (e) {
                console.error("Błąd usunięcia wygasłego/nieprawidłowego tokenu z sessionStorage:", e);
            }
            // Wyczyść stan w pamięci
            currentJwtToken = null;
            currentUserRole = null;
        }
    }
    return false; // Nie załadowano ważnego tokenu
}