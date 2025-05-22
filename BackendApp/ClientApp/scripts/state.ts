// state.ts
import { parseJwt } from './utils.js'; // Zakładamy, że utils.ts jest w tym samym folderze
import { DecodedJwtToken } from './types.js'; // Importujemy interfejs z types.ts

let currentJwtToken: string | null = null;
let currentUserRole: string | null = null; // Rola będzie stringiem lub null

export function getJwtToken(): string | null {
    return currentJwtToken;
}

export function getUserRole(): string | null {
    return currentUserRole;
}

export function setAuthState(token: string | null): void {
    if (!token) {
        currentJwtToken = null;
        currentUserRole = null;
        try {
            localStorage.removeItem('jwtToken');
        } catch (e) {
            console.error("Error removing token from localStorage in setAuthState:", e);
        }
        return;
    }

    currentJwtToken = token;
    const decodedToken: DecodedJwtToken | null = parseJwt(token);

    if (decodedToken) {
        // Próba odczytania roli - standardowe pole JWT dla ról lub pole 'role'
        let roleFromToken: string | string[] | undefined | null =
            decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;

        if (Array.isArray(roleFromToken) && roleFromToken.length > 0) {
            currentUserRole = roleFromToken[0]; // Bierzemy pierwszą rolę z tablicy
        } else if (typeof roleFromToken === 'string' && roleFromToken.trim() !== '') {
            currentUserRole = roleFromToken;
        } else {
            currentUserRole = 'User'; // Domyślna rola, jeśli nie znaleziono lub jest pusta
        }
    } else {
        currentUserRole = 'User'; // Domyślna rola w przypadku problemu z dekodowaniem tokenu
    }

    try {
        localStorage.setItem('jwtToken', token);
    } catch (e) {
        console.error("Error setting token in localStorage in setAuthState:", e);
    }
}

export function clearAuthState(): void {
    currentJwtToken = null;
    currentUserRole = null;
    try {
        localStorage.removeItem('jwtToken');
    } catch (e) {
        console.error("Error removing token from localStorage in clearAuthState:", e);
    }
}

export function loadStateFromStorage(): boolean {
    let storedToken: string | null = null;
    try {
        storedToken = localStorage.getItem('jwtToken');
    } catch (e) {
        console.error("Error getting token from localStorage in loadStateFromStorage:", e);
        return false;
    }

    if (storedToken) {
        const decodedToken: DecodedJwtToken | null = parseJwt(storedToken);

        // Sprawdzamy, czy token istnieje, ma pole 'exp' i czy nie wygasł
        if (decodedToken && typeof decodedToken.exp === 'number' && decodedToken.exp * 1000 > Date.now()) {
            setAuthState(storedToken); // Ustawia token i rolę
            return true; // Zalogowany
        } else {
            // Token wygasł, jest nieprawidłowy, lub brakuje pola 'exp'
            try {
                localStorage.removeItem('jwtToken');
            } catch (e) {
                console.error("Error removing expired/invalid token from localStorage:", e);
            }
            clearAuthState(); // Wyczyść stan, jeśli token jest nieprawidłowy
        }
    }
    return false; // Niezalogowany
}