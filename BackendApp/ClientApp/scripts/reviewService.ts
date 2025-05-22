// reviewService.ts
import { backendAppUrl } from './config.js'; // Poprawiony import
import { getJwtToken, getUserRole } from './state.js';
import { fetchApartments } from './apartmentService.js'; // Poprawiony import
import { fetchMyProfile } from './profileService.js';   // Poprawiony import

// Importy typów
import {
    Review,
    GraphQLResponse,
    ApiError,
    AddReviewInput,
    AddReviewMutationData,
    DeleteReviewMutationData
} from './types.js';

export async function submitReview(): Promise<void> {
    console.log("submitReview function CALLED");
    const responseEl = document.getElementById('addReviewResponse') as HTMLPreElement | null;
    if (!responseEl) {
        console.error("Element addReviewResponse nie został znaleziony.");
        return;
    }
    responseEl.textContent = 'Wysyłanie recenzji...';

    const currentJwtToken = getJwtToken();
    if (!currentJwtToken) {
        alert('Musisz być zalogowany.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/';
        return;
    }

    // Typowanie elementów DOM i pobieranie wartości
    const apartmentSelectEl = document.getElementById('reviewApartmentSelect') as HTMLSelectElement | null;
    const ratingInputEl = document.getElementById('reviewRating') as HTMLInputElement | null;
    const commentTextAreaEl = document.getElementById('reviewComment') as HTMLTextAreaElement | null;
    const addReviewFormEl = document.getElementById('addReviewForm') as HTMLFormElement | null;

    if (!apartmentSelectEl || !ratingInputEl || !commentTextAreaEl) {
        responseEl.textContent = 'Błąd: Brakuje elementów formularza recenzji.';
        console.error("Brakuje elementów formularza recenzji.");
        return;
    }

    const apartmentId = apartmentSelectEl.value; // Zakładamy, że to UUID mieszkania
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

    const reviewInput: AddReviewInput = {
        apartmentId,
        rating,
        comment
    };

    const mutation = {
        query: `
            mutation DodajRecenzje($input: AddReviewInput!) { 
              addReview(input: $input) { 
                review { 
                  id 
                  rating 
                  comment 
                  # Upewnij się, że te pola pasują do interfejsu Review
                } 
                errors { # Błędy specyficzne dla operacji addReview
                  message 
                  code 
                } 
              } 
            }
        `,
        variables: { input: reviewInput }
    };

    try {
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });

        const resData = await res.json() as GraphQLResponse<AddReviewMutationData>;
        responseEl.textContent = JSON.stringify(resData, null, 2);

        if (resData.data?.addReview?.review) {
            alert('Recenzja dodana pomyślnie!');
            addReviewFormEl?.reset();
            if (window.location.hash.includes('#/mieszkania')) {
                fetchApartments(); // Funkcja z apartmentService
            }
        } else {
            // Sprawdź błędy operacji addReview lub błędy GraphQL na wyższym poziomie
            const errors: ApiError[] | undefined = resData.data?.addReview?.errors || resData.errors;
            const errorMessage = errors && errors.length > 0
                ? errors.map(e => e.message).join('; ')
                : 'Nieznany błąd podczas dodawania recenzji.';
            alert(`Błąd dodawania recenzji: ${errorMessage}`);
            console.error("Błąd GraphQL (addReview):", errors || resData);
        }
    } catch (error: any) {
        responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
        console.error("Błąd sieciowy (addReview):", error);
        alert('Wystąpił błąd sieciowy podczas dodawania recenzji.');
    }
}

export function confirmDeleteReview(reviewGlobalRelayId: string, reviewCommentSnippet: string): void {
    console.log("confirmDeleteReview CALLED for Global Relay ID:", reviewGlobalRelayId, "Snippet:", reviewCommentSnippet);
    if (confirm(`Czy na pewno chcesz usunąć recenzję: "${reviewCommentSnippet}..." (Globalne ID: ${reviewGlobalRelayId})?`)) {
        deleteReview(reviewGlobalRelayId);
    }
}

export async function deleteReview(reviewGlobalRelayId: string): Promise<void> {
    console.log("deleteReview CALLED for Global Relay ID:", reviewGlobalRelayId);
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Musisz być zalogowany jako Administrator.');
        return;
    }
    if (!reviewGlobalRelayId || typeof reviewGlobalRelayId !== 'string' || reviewGlobalRelayId.trim() === "") {
        alert('Brak poprawnego globalnego ID recenzji do usunięcia.');
        console.error("deleteReview: reviewGlobalRelayId jest nieprawidłowy:", reviewGlobalRelayId);
        return;
    }

    const graphqlMutation = {
        query: `
            mutation UsunRecenzje($id: ID!) { # Serwer oczekuje globalnego ID!
              deleteReview(id: $id) 
            }
        `,
        variables: { id: reviewGlobalRelayId }
    };

    console.log("Wysyłanie mutacji GraphQL (deleteReview):", JSON.stringify(graphqlMutation, null, 2));

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(graphqlMutation),
        });

        const responseData = await response.json().catch(e => {
            console.error("Błąd parsowania JSON w deleteReview:", e);
            return { errors: [{ message: "Nie udało się sparsować odpowiedzi serwera." }] } as GraphQLResponse<null>;
        }) as GraphQLResponse<DeleteReviewMutationData>;

        console.log("Delete review response from server:", responseData);

        if (response.ok && responseData.data?.deleteReview === true) {
            alert('Recenzja została pomyślnie usunięta!');
            const currentHash = window.location.hash;
            if (currentHash.includes('#/mieszkania')) {
                fetchApartments(); // Funkcja z apartmentService
            }
            if (currentHash.includes('#/profil')) {
                fetchMyProfile(); // Funkcja z profileService (będzie typowana później)
            }
        } else if (responseData.errors && responseData.errors.length > 0) {
            alert(`Błąd usuwania recenzji: ${responseData.errors.map(e => e.message).join('; ')}`);
        } else if (!response.ok) {
            alert(`Błąd serwera (${response.status}) przy usuwaniu recenzji.`);
        } else if (responseData.data?.deleteReview === false || responseData.data?.deleteReview === null) {
            alert('Nie udało się usunąć recenzji (operacja na serwerze zwróciła false lub null).');
        } else {
            alert('Nie udało się usunąć recenzji z nieznanego powodu.');
            console.warn('Unexpected response structure in deleteReview:', responseData);
        }
    } catch (error: any) {
        console.error('Delete review network/fetch error:', error);
        alert(`Wystąpił błąd sieciowy przy usuwaniu recenzji: ${error instanceof Error ? error.message : String(error)}`);
    }
}