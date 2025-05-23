var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { backendAppUrl } from './config.js';
import { updateLoginState } from './uiService.js';
import { setAuthState, clearAuthState, loadStateFromStorage, getJwtToken, getUserRole } from './state.js';
export function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("loginUser function CALLED");
        const emailEl = document.getElementById('loginEmail');
        const passwordEl = document.getElementById('loginPassword');
        const loginResponseRawEl = document.getElementById('loginResponseRaw');
        const loginUserMessageEl = document.getElementById('loginUserMessage');
        if (!loginResponseRawEl || !emailEl || !passwordEl) {
            console.error("Element loginEmail, loginPassword lub loginResponseRaw nie został znaleziony!");
            const errorMsg = 'Błąd wewnętrzny strony. Spróbuj ponownie.';
            if (loginUserMessageEl)
                loginUserMessageEl.textContent = errorMsg;
            else
                alert(errorMsg);
            return;
        }
        if (loginUserMessageEl)
            loginUserMessageEl.textContent = '';
        loginResponseRawEl.textContent = 'Logowanie...';
        const email = emailEl.value;
        const password = passwordEl.value;
        clearAuthState();
        try {
            const response = yield fetch(`${backendAppUrl}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                const responseData = yield response.json();
                loginResponseRawEl.textContent = JSON.stringify(responseData, null, 2);
                if (responseData.token) {
                    setAuthState(responseData.token);
                    updateLoginState();
                    window.location.hash = '#/mieszkania';
                }
                else {
                    const userMessage = 'Błąd logowania lub brak tokenu w odpowiedzi.';
                    loginResponseRawEl.textContent += `\n${userMessage}`;
                    if (loginUserMessageEl)
                        loginUserMessageEl.textContent = userMessage;
                    else
                        alert(userMessage);
                    updateLoginState();
                }
            }
            else {
                let detailedErrorMessage = `Błąd logowania. Status: ${response.status}`;
                let userFriendlyMessage = "Niepoprawny email lub hasło. Spróbuj ponownie.";
                try {
                    const errorBodyText = yield response.text();
                    if (errorBodyText) {
                        try {
                            const errorJson = JSON.parse(errorBodyText);
                            if (response.status === 400 && errorJson.errors) {
                                userFriendlyMessage = "Wprowadzono niepoprawne dane. Sprawdź formularz.";
                                const validationErrors = Object.entries(errorJson.errors)
                                    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                                    .join('\n');
                                detailedErrorMessage = `${errorJson.title || 'Błąd walidacji'}:\n${validationErrors}`;
                            }
                            else if (errorJson.message) {
                                detailedErrorMessage += `: ${errorJson.message}`;
                                if (response.status !== 401)
                                    userFriendlyMessage = errorJson.message;
                            }
                            else if (errorJson.Message) {
                                detailedErrorMessage += `: ${errorJson.Message}`;
                                if (response.status !== 401)
                                    userFriendlyMessage = errorJson.Message;
                            }
                            else if (errorJson.title) {
                                detailedErrorMessage += `: ${errorJson.title}`;
                                if (response.status !== 401)
                                    userFriendlyMessage = errorJson.title;
                            }
                            else {
                                detailedErrorMessage += `. Odpowiedź serwera: ${errorBodyText}`;
                                if (response.status !== 401)
                                    userFriendlyMessage = "Wystąpił błąd serwera.";
                            }
                        }
                        catch (e) {
                            detailedErrorMessage += `. Odpowiedź serwera (nie JSON): ${errorBodyText}`;
                            if (response.status !== 401)
                                userFriendlyMessage = "Wystąpił błąd serwera (niepoprawna odpowiedź).";
                        }
                    }
                    else {
                        if (response.status !== 401)
                            userFriendlyMessage = `Błąd serwera (status: ${response.status}).`;
                    }
                }
                catch (e) {
                    console.error("Nie można odczytać ciała odpowiedzi błędu", e);
                    if (response.status !== 401)
                        userFriendlyMessage = `Błąd serwera (status: ${response.status}). Nie można odczytać odpowiedzi.`;
                }
                loginResponseRawEl.textContent = detailedErrorMessage;
                if (loginUserMessageEl)
                    loginUserMessageEl.textContent = userFriendlyMessage;
                else
                    alert(userFriendlyMessage);
                updateLoginState();
                console.error('Błąd logowania, status:', response.status, detailedErrorMessage);
            }
        }
        catch (error) {
            const networkErrorUserMessage = 'Błąd sieci lub serwera. Spróbuj ponownie później.';
            loginResponseRawEl.textContent = networkErrorUserMessage + (error instanceof Error ? error.message : String(error));
            if (loginUserMessageEl)
                loginUserMessageEl.textContent = networkErrorUserMessage;
            else
                alert(networkErrorUserMessage);
            updateLoginState();
            console.error('Błąd fetch/sieciowy logowania:', error);
        }
    });
}
export function logoutUser() {
    console.log("logoutUser function CALLED");
    clearAuthState();
    updateLoginState();
    window.location.hash = '#/';
    const loginResponseRawEl = document.getElementById('loginResponseRaw');
    if (loginResponseRawEl) {
        loginResponseRawEl.textContent = 'Wylogowano. Przekierowywanie na stronę logowania...';
    }
}
export function checkLoginOnLoad() {
    console.log("checkLoginOnLoad function CALLED");
    loadStateFromStorage();
    updateLoginState();
    if (getJwtToken()) {
        console.log("Użytkownik jest zalogowany na podstawie zapisanego tokenu. Rola:", getUserRole());
    }
    else {
        console.log("Brak ważnego tokenu, użytkownik niezalogowany.");
    }
}
export function submitRegistration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("submitRegistration function CALLED");
        const registerResponseEl = document.getElementById('registerResponse');
        if (!registerResponseEl) {
            console.error("Element registerResponse nie znaleziony!");
            return;
        }
        registerResponseEl.textContent = 'Rejestrowanie...';
        const nameEl = document.getElementById('registerName');
        const emailEl = document.getElementById('registerEmail');
        const passwordEl = document.getElementById('registerPassword');
        const confirmPasswordEl = document.getElementById('registerConfirmPassword');
        const registerFormEl = document.getElementById('registerForm');
        if (!nameEl || !emailEl || !passwordEl || !confirmPasswordEl) {
            console.error("Brakuje jednego lub więcej pól formularza rejestracji!");
            if (registerResponseEl)
                registerResponseEl.textContent = 'Błąd wewnętrzny: brakuje pól formularza.';
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
            const response = yield fetch(`${backendAppUrl}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, confirmPassword }),
            });
            const responseBodyText = yield response.text();
            let responseData = null;
            if (responseBodyText) {
                try {
                    responseData = JSON.parse(responseBodyText);
                }
                catch (e) {
                    console.warn("Odpowiedź rejestracji nie była poprawnym JSON:", responseBodyText);
                }
            }
            if (response.status === 201 && responseData && !responseData.errors && !responseData.title) {
                registerResponseEl.textContent = JSON.stringify(responseData, null, 2);
                alert('Rejestracja pomyślna! Możesz się teraz zalogować.');
                if (registerFormEl) {
                    registerFormEl.reset();
                }
                window.location.hash = '#/';
            }
            else {
                let errorMessage = `Błąd rejestracji. Status: ${response.status}`;
                const errorDetails = responseData;
                if (errorDetails && errorDetails.errors) {
                    errorMessage = "Błędy walidacji:\n" + Object.entries(errorDetails.errors)
                        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                        .join('\n');
                }
                else if (errorDetails && (errorDetails.message || errorDetails.Message)) {
                    errorMessage = errorDetails.message || errorDetails.Message || errorMessage;
                }
                else if (responseBodyText) {
                    errorMessage += `. Odpowiedź serwera: ${responseBodyText}`;
                }
                registerResponseEl.textContent = errorMessage;
                alert(errorMessage);
            }
        }
        catch (error) {
            const errorMsg = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
            registerResponseEl.textContent = errorMsg;
            console.error('Błąd rejestracji:', error);
            alert('Wystąpił błąd sieciowy podczas rejestracji.');
        }
    });
}
//# sourceMappingURL=authService.js.map