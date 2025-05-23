// Importy modułów, funkcji pomocniczych i typów
import { backendAppUrl } from './config.js';
import { updateLoginState } from './uiService.js';
import { setAuthState, clearAuthState, loadStateFromStorage, getJwtToken, getUserRole } from './state.js';
import { LoginSuccessResponse, ApiErrorResponse, RegistrationSuccessResponse } from './types.js';

/**
 * Loguje użytkownika do systemu.
 * Pobiera dane z formularza logowania, wysyła żądanie do API,
 * obsługuje odpowiedź i aktualizuje stan aplikacji.
 */
export async function loginUser(): Promise<void> {
    console.log("loginUser function CALLED");
    // Pobranie elementów DOM
    const emailEl = document.getElementById('loginEmail') as HTMLInputElement | null;
    const passwordEl = document.getElementById('loginPassword') as HTMLInputElement | null;
    const loginResponseRawEl = document.getElementById('loginResponseRaw') as HTMLPreElement | null;
    const loginUserMessageEl = document.getElementById('loginUserMessage') as HTMLElement | null; // Element na komunikaty dla użytkownika

    // Sprawdzenie, czy kluczowe elementy DOM istnieją
    if (!loginResponseRawEl || !emailEl || !passwordEl) {
        console.error("Element loginEmail, loginPassword lub loginResponseRaw nie został znaleziony!");
        const errorMsg = 'Błąd wewnętrzny strony. Spróbuj ponownie.';
        if (loginUserMessageEl) loginUserMessageEl.textContent = errorMsg;
        else alert(errorMsg);
        return;
    }

    if (loginUserMessageEl) loginUserMessageEl.textContent = ''; // Wyczyść poprzednie komunikaty
    loginResponseRawEl.textContent = 'Logowanie...'; // Ustawienie statusu "logowanie"

    const email = emailEl.value;
    const password = passwordEl.value;

    clearAuthState(); // Wyczyść poprzedni stan autoryzacji przed próbą logowania

    try {
        const response = await fetch(`${backendAppUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) { // Jeśli logowanie powiodło się (status 2xx)
            const responseData = await response.json() as LoginSuccessResponse;
            loginResponseRawEl.textContent = JSON.stringify(responseData, null, 2); // Wyświetl surową odpowiedź
            if (responseData.token) {
                setAuthState(responseData.token); // Zapisz token i rolę
                updateLoginState(); // Zaktualizuj UI
                window.location.hash = '#/mieszkania'; // Przekieruj na stronę mieszkań
            } else {
                // Jeśli odpowiedź jest OK, ale brakuje tokenu
                const userMessage = 'Błąd logowania lub brak tokenu w odpowiedzi.';
                loginResponseRawEl.textContent += `\n${userMessage}`;
                if (loginUserMessageEl) loginUserMessageEl.textContent = userMessage;
                else alert(userMessage);
                updateLoginState(); // Zaktualizuj UI (jako niezalogowany)
            }
        } else { // Jeśli wystąpił błąd logowania (status 4xx, 5xx)
            let detailedErrorMessage = `Błąd logowania. Status: ${response.status}`;
            let userFriendlyMessage = "Niepoprawny email lub hasło. Spróbuj ponownie."; // Domyślny komunikat dla użytkownika

            try {
                const errorBodyText = await response.text(); // Spróbuj odczytać ciało odpowiedzi błędu
                if (errorBodyText) {
                    try {
                        const errorJson = JSON.parse(errorBodyText) as ApiErrorResponse;
                        // Obsługa błędów walidacji (status 400)
                        if (response.status === 400 && errorJson.errors) {
                            userFriendlyMessage = "Wprowadzono niepoprawne dane. Sprawdź formularz.";
                            const validationErrors = Object.entries(errorJson.errors)
                                .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                                .join('\n');
                            detailedErrorMessage = `${errorJson.title || 'Błąd walidacji'}:\n${validationErrors}`;
                        } else if (errorJson.message) { // Standardowy komunikat błędu z API
                            detailedErrorMessage += `: ${errorJson.message}`;
                            if (response.status !== 401) userFriendlyMessage = errorJson.message; // Dla 401 nie nadpisuj domyślnego "Niepoprawny email lub hasło"
                        } else if (errorJson.Message) { // Alternatywna nazwa pola komunikatu
                            detailedErrorMessage += `: ${errorJson.Message}`;
                            if (response.status !== 401) userFriendlyMessage = errorJson.Message;
                        } else if (errorJson.title) { // Komunikat z pola 'title'
                            detailedErrorMessage += `: ${errorJson.title}`;
                            if (response.status !== 401) userFriendlyMessage = errorJson.title;
                        }
                        else { // Jeśli JSON nie ma oczekiwanych pól
                            detailedErrorMessage += `. Odpowiedź serwera: ${errorBodyText}`;
                            if (response.status !== 401) userFriendlyMessage = "Wystąpił błąd serwera.";
                        }
                    } catch (e) { // Jeśli ciało błędu nie jest JSON-em
                        detailedErrorMessage += `. Odpowiedź serwera (nie JSON): ${errorBodyText}`;
                        if (response.status !== 401) userFriendlyMessage = "Wystąpił błąd serwera (niepoprawna odpowiedź).";
                    }
                } else { // Jeśli ciało odpowiedzi błędu jest puste
                    if (response.status !== 401) userFriendlyMessage = `Błąd serwera (status: ${response.status}).`;
                }
            } catch (e) { // Błąd odczytu ciała odpowiedzi
                console.error("Nie można odczytać ciała odpowiedzi błędu", e);
                if (response.status !== 401) userFriendlyMessage = `Błąd serwera (status: ${response.status}). Nie można odczytać odpowiedzi.`;
            }

            loginResponseRawEl.textContent = detailedErrorMessage; // Wyświetl szczegółowy błąd
            if (loginUserMessageEl) loginUserMessageEl.textContent = userFriendlyMessage; // Wyświetl przyjazny komunikat
            else alert(userFriendlyMessage);

            updateLoginState(); // Zaktualizuj UI (jako niezalogowany)
            console.error('Błąd logowania, status:', response.status, detailedErrorMessage);
        }
    } catch (error: any) { // Błąd sieciowy lub inny błąd fetch
        const networkErrorUserMessage = 'Błąd sieci lub serwera. Spróbuj ponownie później.';
        loginResponseRawEl.textContent = networkErrorUserMessage + (error instanceof Error ? error.message : String(error));
        if (loginUserMessageEl) loginUserMessageEl.textContent = networkErrorUserMessage;
        else alert(networkErrorUserMessage);

        updateLoginState(); // Zaktualizuj UI
        console.error('Błąd fetch/sieciowy logowania:', error);
    }
}

/**
 * Wylogowuje użytkownika.
 * Czyści stan autoryzacji, aktualizuje UI i przekierowuje na stronę główną.
 */
export function logoutUser(): void {
    console.log("logoutUser function CALLED");
    clearAuthState(); // Usuń token i rolę
    updateLoginState(); // Zaktualizuj UI
    window.location.hash = '#/'; // Przekieruj na stronę logowania
    const loginResponseRawEl = document.getElementById('loginResponseRaw') as HTMLPreElement | null;
    if (loginResponseRawEl) { // Informacja w konsoli dla dewelopera
        loginResponseRawEl.textContent = 'Wylogowano. Przekierowywanie na stronę logowania...';
    }
}

/**
 * Sprawdza stan logowania przy ładowaniu strony.
 * Ładuje zapisany stan (token, rola) z localStorage i aktualizuje UI.
 */
export function checkLoginOnLoad(): void {
    console.log("checkLoginOnLoad function CALLED");
    loadStateFromStorage(); // Załaduj token i rolę z localStorage
    updateLoginState();    // Zaktualizuj UI na podstawie załadowanego stanu

    // Informacja w konsoli o stanie logowania
    if (getJwtToken()) {
        console.log("Użytkownik jest zalogowany na podstawie zapisanego tokenu. Rola:", getUserRole());
    } else {
        console.log("Brak ważnego tokenu, użytkownik niezalogowany.");
    }
}

/**
 * Rejestruje nowego użytkownika.
 * Pobiera dane z formularza rejestracji, wysyła żądanie do API,
 * obsługuje odpowiedź i informuje użytkownika o wyniku.
 */
export async function submitRegistration(): Promise<void> {
    console.log("submitRegistration function CALLED");
    const registerResponseEl = document.getElementById('registerResponse') as HTMLPreElement | null;
    if (!registerResponseEl) {
        console.error("Element registerResponse nie znaleziony!");
        return;
    }
    registerResponseEl.textContent = 'Rejestrowanie...'; // Ustawienie statusu

    // Pobranie elementów formularza
    const nameEl = document.getElementById('registerName') as HTMLInputElement | null;
    const emailEl = document.getElementById('registerEmail') as HTMLInputElement | null;
    const passwordEl = document.getElementById('registerPassword') as HTMLInputElement | null;
    const confirmPasswordEl = document.getElementById('registerConfirmPassword') as HTMLInputElement | null;
    const registerFormEl = document.getElementById('registerForm') as HTMLFormElement | null; // Referencja do formularza

    if (!nameEl || !emailEl || !passwordEl || !confirmPasswordEl) {
        console.error("Brakuje jednego lub więcej pól formularza rejestracji!");
        if(registerResponseEl) registerResponseEl.textContent = 'Błąd wewnętrzny: brakuje pól formularza.';
        return;
    }
    // Pobranie wartości z pól
    const name = nameEl.value;
    const email = emailEl.value;
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;

    // Walidacja zgodności haseł
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

        const responseBodyText = await response.text(); // Odczytaj odpowiedź jako tekst
        let responseData: RegistrationSuccessResponse | ApiErrorResponse | null = null;

        // Spróbuj sparsować odpowiedź jako JSON
        if (responseBodyText) {
            try {
                responseData = JSON.parse(responseBodyText);
            } catch (e) {
                console.warn("Odpowiedź rejestracji nie była poprawnym JSON:", responseBodyText);
                // Jeśli nie jest JSON, a status wskazuje na sukces (np. 201), to może być problem
                // ale na razie pozwalamy kodowi kontynuować, aby obsłużyć status
            }
        }

        // Obsługa pomyślnej rejestracji (status 201 Created)
        if (response.status === 201 && responseData && !(responseData as ApiErrorResponse).errors && !(responseData as ApiErrorResponse).title) {
            registerResponseEl.textContent = JSON.stringify(responseData, null, 2);
            alert('Rejestracja pomyślna! Możesz się teraz zalogować.');
            if (registerFormEl) { // Zresetuj formularz po pomyślnej rejestracji
                registerFormEl.reset();
            }
            window.location.hash = '#/'; // Przekieruj na stronę logowania
        } else { // Obsługa błędów rejestracji
            let errorMessage = `Błąd rejestracji. Status: ${response.status}`;
            const errorDetails = responseData as ApiErrorResponse;

            // Próba wyciągnięcia bardziej szczegółowych informacji o błędzie
            if (errorDetails && errorDetails.errors) { // Błędy walidacji
                errorMessage = "Błędy walidacji:\n" + Object.entries(errorDetails.errors)
                    .map(([field, errors]: [string, string[]]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
            } else if (errorDetails && (errorDetails.message || errorDetails.Message)) { // Ogólny komunikat błędu
                errorMessage = errorDetails.message || errorDetails.Message || errorMessage;
            } else if (responseBodyText) { // Jeśli nie ma struktury JSON, użyj surowego tekstu
                errorMessage += `. Odpowiedź serwera: ${responseBodyText}`;
            }
            registerResponseEl.textContent = errorMessage;
            alert(errorMessage); // Pokaż błąd użytkownikowi
        }
    } catch (error: any) { // Błąd sieciowy lub inny błąd fetch
        const errorMsg = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
        registerResponseEl.textContent = errorMsg;
        console.error('Błąd rejestracji:', error);
        alert('Wystąpił błąd sieciowy podczas rejestracji.');
    }
}