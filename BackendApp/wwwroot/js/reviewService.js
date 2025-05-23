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
import { getJwtToken, getUserRole } from './state.js';
import { fetchApartments } from './apartmentService.js';
import { fetchMyProfile } from './profileService.js';
export function submitReview() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        console.log("submitReview function CALLED");
        const responseEl = document.getElementById('addReviewResponse');
        if (!responseEl) {
            console.error("Element addReviewResponse nie został znaleziony.");
            return;
        }
        responseEl.textContent = 'Wysyłanie recenzji...';
        const currentJwtToken = getJwtToken();
        if (!currentJwtToken) {
            alert('Musisz być zalogowany, aby dodać recenzję.');
            responseEl.textContent = 'Brak autoryzacji.';
            window.location.hash = '#/';
            return;
        }
        const apartmentSelectEl = document.getElementById('reviewApartmentSelect');
        const ratingInputEl = document.getElementById('reviewRating');
        const commentTextAreaEl = document.getElementById('reviewComment');
        const addReviewFormEl = document.getElementById('addReviewForm');
        if (!apartmentSelectEl || !ratingInputEl || !commentTextAreaEl) {
            responseEl.textContent = 'Błąd: Brakuje elementów formularza recenzji.';
            console.error("Brakuje elementów formularza recenzji.");
            return;
        }
        const apartmentId = apartmentSelectEl.value;
        const rating = parseInt(ratingInputEl.value, 10);
        const comment = commentTextAreaEl.value;
        if (!apartmentId) {
            alert('Wybierz mieszkanie.');
            responseEl.textContent = 'Wybierz mieszkanie.';
            return;
        }
        if (isNaN(rating) || rating < 1 || rating > 5) {
            alert('Ocena musi być liczbą od 1 do 5.');
            responseEl.textContent = 'Ocena musi być liczbą od 1 do 5.';
            return;
        }
        const reviewInput = {
            apartmentId,
            rating,
            comment
        };
        const mutation = {
            query: `
            mutation DodajRecenzje($input: AddReviewInput!) { 
              addReview(input: $input) { 
                review { # Dane dodanej recenzji
                  id 
                  rating 
                  comment 
                  # Upewnij się, że te pola pasują do interfejsu Review w twoim schemacie GraphQL
                } 
                errors { # Błędy specyficzne dla operacji addReview (np. walidacyjne z logiki biznesowej)
                  message 
                  code 
                } 
              } 
            }
        `,
            variables: { input: reviewInput }
        };
        try {
            const res = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(mutation)
            });
            const resData = yield res.json();
            responseEl.textContent = JSON.stringify(resData, null, 2);
            if ((_b = (_a = resData.data) === null || _a === void 0 ? void 0 : _a.addReview) === null || _b === void 0 ? void 0 : _b.review) {
                alert('Recenzja dodana pomyślnie!');
                addReviewFormEl === null || addReviewFormEl === void 0 ? void 0 : addReviewFormEl.reset();
                if (window.location.hash.includes('#/mieszkania')) {
                    fetchApartments();
                }
            }
            else {
                const errors = ((_d = (_c = resData.data) === null || _c === void 0 ? void 0 : _c.addReview) === null || _d === void 0 ? void 0 : _d.errors) || resData.errors;
                const errorMessage = errors && errors.length > 0
                    ? errors.map(e => e.message).join('; ')
                    : 'Nieznany błąd podczas dodawania recenzji.';
                alert(`Błąd dodawania recenzji: ${errorMessage}`);
                console.error("Błąd GraphQL (addReview):", errors || resData);
            }
        }
        catch (error) {
            responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
            console.error("Błąd sieciowy (addReview):", error);
            alert('Wystąpił błąd sieciowy podczas dodawania recenzji.');
        }
    });
}
export function confirmDeleteReview(reviewGlobalRelayId, reviewCommentSnippet) {
    console.log("confirmDeleteReview CALLED for Global Relay ID:", reviewGlobalRelayId, "Snippet:", reviewCommentSnippet);
    if (confirm(`Czy na pewno chcesz usunąć recenzję: "${reviewCommentSnippet}..." (Globalne ID: ${reviewGlobalRelayId})?`)) {
        deleteReview(reviewGlobalRelayId);
    }
}
export function deleteReview(reviewGlobalRelayId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("deleteReview CALLED for Global Relay ID:", reviewGlobalRelayId);
        const currentJwtToken = getJwtToken();
        const currentUserRole = getUserRole();
        if (!currentJwtToken || currentUserRole !== 'Admin') {
            alert('Musisz być zalogowany jako Administrator, aby usunąć recenzję.');
            return;
        }
        if (!reviewGlobalRelayId || typeof reviewGlobalRelayId !== 'string' || reviewGlobalRelayId.trim() === "") {
            alert('Brak poprawnego globalnego ID recenzji do usunięcia.');
            console.error("deleteReview: reviewGlobalRelayId jest nieprawidłowy:", reviewGlobalRelayId);
            return;
        }
        const graphqlMutation = {
            query: `
            mutation UsunRecenzje($id: ID!) { # Serwer GraphQL oczekuje globalnego ID typu ID!
              deleteReview(id: $id) 
            }
        `,
            variables: { id: reviewGlobalRelayId }
        };
        console.log("Wysyłanie mutacji GraphQL (deleteReview):", JSON.stringify(graphqlMutation, null, 2));
        try {
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(graphqlMutation),
            });
            const responseData = yield response.json().catch(e => {
                console.error("Błąd parsowania JSON w deleteReview:", e);
                return { errors: [{ message: "Nie udało się sparsować odpowiedzi serwera." }] };
            });
            console.log("Delete review response from server:", responseData);
            if (response.ok && ((_a = responseData.data) === null || _a === void 0 ? void 0 : _a.deleteReview) === true) {
                alert('Recenzja została pomyślnie usunięta!');
                const currentHash = window.location.hash;
                if (currentHash.includes('#/mieszkania')) {
                    fetchApartments();
                }
                if (currentHash.includes('#/profil')) {
                    fetchMyProfile();
                }
            }
            else if (responseData.errors && responseData.errors.length > 0) {
                alert(`Błąd usuwania recenzji: ${responseData.errors.map(e => e.message).join('; ')}`);
            }
            else if (!response.ok) {
                alert(`Błąd serwera (${response.status}) przy usuwaniu recenzji.`);
            }
            else if (((_b = responseData.data) === null || _b === void 0 ? void 0 : _b.deleteReview) === false || ((_c = responseData.data) === null || _c === void 0 ? void 0 : _c.deleteReview) === null) {
                alert('Nie udało się usunąć recenzji (operacja na serwerze zwróciła false lub null).');
            }
            else {
                alert('Nie udało się usunąć recenzji z nieznanego powodu.');
                console.warn('Unexpected response structure in deleteReview:', responseData);
            }
        }
        catch (error) {
            console.error('Delete review network/fetch error:', error);
            alert(`Wystąpił błąd sieciowy przy usuwaniu recenzji: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
//# sourceMappingURL=reviewService.js.map