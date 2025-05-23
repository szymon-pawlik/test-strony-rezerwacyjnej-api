import { parseJwt } from './utils.js';
let currentJwtToken = null;
let currentUserRole = null;
export function getJwtToken() {
    return currentJwtToken;
}
export function getUserRole() {
    return currentUserRole;
}
export function setAuthState(token) {
    if (!token) {
        currentJwtToken = null;
        currentUserRole = null;
        try {
            sessionStorage.removeItem('jwtToken');
        }
        catch (e) {
            console.error("Błąd podczas usuwania tokenu z sessionStorage w setAuthState:", e);
        }
        return;
    }
    currentJwtToken = token;
    const decodedToken = parseJwt(token);
    if (decodedToken) {
        let roleFromToken = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
        if (Array.isArray(roleFromToken) && roleFromToken.length > 0) {
            currentUserRole = roleFromToken[0];
        }
        else if (typeof roleFromToken === 'string' && roleFromToken.trim() !== '') {
            currentUserRole = roleFromToken;
        }
        else {
            currentUserRole = 'User';
        }
    }
    else {
        currentUserRole = 'User';
        console.warn("Nie udało się zdekodować tokenu JWT w setAuthState. Ustawiono domyślną rolę 'User'.");
    }
    try {
        sessionStorage.setItem('jwtToken', token);
    }
    catch (e) {
        console.error("Błąd podczas ustawiania tokenu w sessionStorage w setAuthState:", e);
    }
}
export function clearAuthState() {
    currentJwtToken = null;
    currentUserRole = null;
    try {
        sessionStorage.removeItem('jwtToken');
    }
    catch (e) {
        console.error("Błąd podczas usuwania tokenu z sessionStorage w clearAuthState:", e);
    }
}
export function loadStateFromStorage() {
    let storedToken = null;
    try {
        storedToken = sessionStorage.getItem('jwtToken');
    }
    catch (e) {
        console.error("Błąd odczytu tokenu z sessionStorage w loadStateFromStorage:", e);
        return false;
    }
    if (storedToken) {
        const decodedToken = parseJwt(storedToken);
        if (decodedToken && typeof decodedToken.exp === 'number' && decodedToken.exp * 1000 > Date.now()) {
            currentJwtToken = storedToken;
            let roleFromToken = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
            if (Array.isArray(roleFromToken) && roleFromToken.length > 0) {
                currentUserRole = roleFromToken[0];
            }
            else if (typeof roleFromToken === 'string' && roleFromToken.trim() !== '') {
                currentUserRole = roleFromToken;
            }
            else {
                currentUserRole = 'User';
            }
            return true;
        }
        else {
            try {
                sessionStorage.removeItem('jwtToken');
            }
            catch (e) {
                console.error("Błąd usunięcia wygasłego/nieprawidłowego tokenu z sessionStorage:", e);
            }
            currentJwtToken = null;
            currentUserRole = null;
        }
    }
    return false;
}
//# sourceMappingURL=state.js.map