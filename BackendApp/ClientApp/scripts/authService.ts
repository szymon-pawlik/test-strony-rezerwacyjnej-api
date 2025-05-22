
import { backendAppUrl } from './config.js';
import { updateLoginState } from './uiService.js';
import { setAuthState, clearAuthState, loadStateFromStorage, getJwtToken, getUserRole } from './state.js';
import { LoginSuccessResponse, ApiErrorResponse, RegistrationSuccessResponse } from './types.js'; // Importujemy nowe typy

export async function loginUser(): Promise<void> {
    console.log("loginUser function CALLED");

    // Typowanie elementów DOM i pobieranie ich wartości
    const emailEl = document.getElementById('loginEmail') as HTMLInputElement | null;
    const passwordEl = document.getElementById('loginPassword') as HTMLInputElement | null;
    const loginResponseRawEl = document.getElementById('loginResponseRaw') as HTMLPreElement | null;

    if (!loginResponseRawEl || !emailEl || !passwordEl) {
        console.error("Element loginEmail, loginPassword lub loginResponseRaw nie został znaleziony!");
        return;
    }
    const email = emailEl.value;
    const password = passwordEl.value;

    loginResponseRawEl.textContent = 'Logowanie...';

    clearAuthState(); // Wyczyść stary stan przed próbą logowania

    try {
        const response = await fetch(`${backendAppUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const responseData = await response.json() as LoginSuccessResponse; // Typujemy odpowiedź sukcesu
            loginResponseRawEl.textContent = JSON.stringify(responseData, null, 2);
            if (responseData.token) {
                setAuthState(responseData.token);
                updateLoginState();
                window.location.hash = '#/mieszkania';
            } else {
                loginResponseRawEl.textContent += '\nBłąd logowania lub brak tokenu.';
                updateLoginState();
            }
        } else {
            let errorMessage = `Błąd logowania. Status: ${response.status}`;
            try {
                const errorBodyText = await response.text();
                if (errorBodyText) {
                    try {
                        const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse; // Typujemy odpowiedź błędu
                        if (errorJson.message) errorMessage += `: ${errorJson.message}`;
                        else if (errorJson.Message) errorMessage += `: ${errorJson.Message}`;
                        else if (errorJson.title && errorJson.errors) {
                            const validationErrors = Object.entries(errorJson.errors)
                                .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                                .join('\n');
                            errorMessage = `${errorJson.title}:\n${validationErrors}`;
                        } else errorMessage += `. Odpowiedź serwera: ${errorBodyText}`;
                    } catch (e) {
                        errorMessage += `. Odpowiedź serwera (nie JSON): ${errorBodyText}`;
                    }
                }
            } catch (e) {
                console.error("Nie można odczytać ciała odpowiedzi błędu", e);
            }
            loginResponseRawEl.textContent = errorMessage;
            updateLoginState();
            console.error('Błąd logowania, status:', response.status, errorMessage);
        }
    } catch (error: any) { // Można użyć 'unknown' i sprawdzić typ error
        loginResponseRawEl.textContent = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
        updateLoginState();
        console.error('Błąd fetch/sieciowy logowania:', error);
    }
}

export function logoutUser(): void {
    console.log("logoutUser function CALLED");
    clearAuthState();
    updateLoginState();
    window.location.hash = '#/';
    const loginResponseRawEl = document.getElementById('loginResponseRaw') as HTMLPreElement | null;
    if (loginResponseRawEl) {
        loginResponseRawEl.textContent = 'Wylogowano. Przekierowywanie na stronę logowania...';
    }
}

export function checkLoginOnLoad(): void {
    console.log("checkLoginOnLoad function CALLED");
    loadStateFromStorage(); // Ładuje token i rolę z localStorage do stanu aplikacji
    updateLoginState();    // Aktualizuje UI na podstawie załadowanego stanu

    // Usunięto: const userRole = localStorage.getItem('currentUserRole');
    // Ta zmienna nie była używana, a getUserRole() dostarcza aktualną rolę ze stanu.

    if (getJwtToken()) {
        console.log("Użytkownik jest zalogowany na podstawie zapisanego tokenu. Rola:", getUserRole());
    } else {
        console.log("Brak ważnego tokenu, użytkownik niezalogowany.");
    }
}

export async function submitRegistration(): Promise<void> {
    console.log("submitRegistration function CALLED");
    const registerResponseEl = document.getElementById('registerResponse') as HTMLPreElement | null;
    if (!registerResponseEl) {
        console.error("Element registerResponse nie znaleziony!");
        return;
    }
    registerResponseEl.textContent = 'Rejestrowanie...';

    // Typowanie elementów DOM i pobieranie ich wartości
    const nameEl = document.getElementById('registerName') as HTMLInputElement | null;
    const emailEl = document.getElementById('registerEmail') as HTMLInputElement | null;
    const passwordEl = document.getElementById('registerPassword') as HTMLInputElement | null;
    const confirmPasswordEl = document.getElementById('registerConfirmPassword') as HTMLInputElement | null;
    const registerFormEl = document.getElementById('registerForm') as HTMLFormElement | null;


    if (!nameEl || !emailEl || !passwordEl || !confirmPasswordEl) {
        console.error("Brakuje jednego lub więcej pól formularza rejestracji!");
        if(registerResponseEl) registerResponseEl.textContent = 'Błąd wewnętrzny: brakuje pól formularza.';
        return;
    }
    const name = nameEl.value;
    const email = emailEl.value;
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;


    if (password !== confirmPassword) {
        const msg = 'Błąd: Hasła nie pasują do siebie.';
        registerResponseEl.textContent = msg;
        alert(msg);
        return;
    }

    try {
        const response = await fetch(`${backendAppUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword }),
        });

        const responseBodyText = await response.text();
        let responseData: RegistrationSuccessResponse | ApiErrorResponse | null = null;

        if (responseBodyText) {
            try {
                responseData = JSON.parse(responseBodyText);
            } catch (e) {
                console.warn("Odpowiedź rejestracji nie była poprawnym JSON:", responseBodyText);
                // Jeśli nie JSON, ale status OK, to może być problem, ale na razie zostawiamy responseData jako null
            }
        }

        if (response.status === 201 && responseData && !(responseData as ApiErrorResponse).errors && !(responseData as ApiErrorResponse).title) {
            registerResponseEl.textContent = JSON.stringify(responseData, null, 2);
            alert('Rejestracja pomyślna! Możesz się teraz zalogować.');
            if (registerFormEl) {
                registerFormEl.reset();
            }
            window.location.hash = '#/';
        } else {
            let errorMessage = `Błąd rejestracji. Status: ${response.status}`;
            const errorDetails = responseData as ApiErrorResponse; // Rzutujemy, aby spróbować odczytać błędy

            if (errorDetails && errorDetails.errors) { // Dla struktury ProblemDetails
                errorMessage = "Błędy walidacji:\n" + Object.entries(errorDetails.errors)
                    .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
            } else if (errorDetails && (errorDetails.message || errorDetails.Message)) { // Dla ogólnych błędów
                errorMessage = errorDetails.message || errorDetails.Message || errorMessage;
            } else if (responseBodyText) { // Jeśli nie udało się sparsować JSON lub nie pasuje do ApiErrorResponse
                errorMessage += `. Odpowiedź serwera: ${responseBodyText}`;
            }
            registerResponseEl.textContent = errorMessage;
            alert(errorMessage);
        }
    } catch (error: any) {
        const errorMsg = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
        registerResponseEl.textContent = errorMsg;
        console.error('Błąd rejestracji:', error);
        alert('Wystąpił błąd sieciowy podczas rejestracji.');
    }
}