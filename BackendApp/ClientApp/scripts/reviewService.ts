// Importy konfiguracji, stanu, funkcji serwisowych oraz typów
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { fetchApartments } from './apartmentService.js'; // Do odświeżenia listy mieszkań po dodaniu/usunięciu recenzji
import { fetchMyProfile } from './profileService.js';   // Do odświeżenia profilu, jeśli recenzje są tam wyświetlane

import {
    Review,
    GraphQLResponse,
    ApiError,
    AddReviewInput,          // Typ dla danych wejściowych nowej recenzji
    AddReviewMutationData,   // Typ dla danych odpowiedzi mutacji dodawania recenzji
    DeleteReviewMutationData // Typ dla danych odpowiedzi mutacji usuwania recenzji
} from './types.js';

/**
 * Przesyła nową recenzję dla wybranego mieszkania do serwera.
 * Wymaga zalogowanego użytkownika.
 */
export async function submitReview(): Promise<void> {
    console.log("submitReview function CALLED");
    // Pobranie elementu DOM do wyświetlania odpowiedzi
    const responseEl = document.getElementById('addReviewResponse') as HTMLPreElement | null;
    if (!responseEl) {
        console.error("Element addReviewResponse nie został znaleziony.");
        return;
    }
    responseEl.textContent = 'Wysyłanie recenzji...'; // Komunikat o przetwarzaniu

    // Sprawdzenie autoryzacji (czy użytkownik jest zalogowany)
    const currentJwtToken = getJwtToken();
    if (!currentJwtToken) {
        alert('Musisz być zalogowany, aby dodać recenzję.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/'; // Przekierowanie do logowania
        return;
    }

    // Pobranie elementów formularza dodawania recenzji
    const apartmentSelectEl = document.getElementById('reviewApartmentSelect') as HTMLSelectElement | null;
    const ratingInputEl = document.getElementById('reviewRating') as HTMLInputElement | null;
    const commentTextAreaEl = document.getElementById('reviewComment') as HTMLTextAreaElement | null;
    const addReviewFormEl = document.getElementById('addReviewForm') as HTMLFormElement | null; // Referencja do formularza

    if (!apartmentSelectEl || !ratingInputEl || !commentTextAreaEl) {
        responseEl.textContent = 'Błąd: Brakuje elementów formularza recenzji.';
        console.error("Brakuje elementów formularza recenzji.");
        return;
    }

    // Pobranie wartości z formularza
    const apartmentId = apartmentSelectEl.value; // ID mieszkania (databaseId)
    const rating = parseInt(ratingInputEl.value, 10);
    const comment = commentTextAreaEl.value;

    // Podstawowa walidacja danych wejściowych
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

    // Przygotowanie obiektu wejściowego dla mutacji GraphQL
    const reviewInput: AddReviewInput = {
        apartmentId, // Powinno to być ID GraphQL mieszkania, jeśli serwer tego oczekuje, lub databaseId
        rating,
        comment
    };

    // Definicja mutacji GraphQL do dodawania recenzji
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
        // Wysłanie żądania do serwera GraphQL
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });

        const resData = await res.json() as GraphQLResponse<AddReviewMutationData>;
        responseEl.textContent = JSON.stringify(resData, null, 2); // Wyświetlenie surowej odpowiedzi

        // Obsługa pomyślnego dodania recenzji
        if (resData.data?.addReview?.review) {
            alert('Recenzja dodana pomyślnie!');
            addReviewFormEl?.reset(); // Reset formularza
            // Odświeżenie listy mieszkań, jeśli użytkownik jest na tej stronie, aby pokazać zaktualizowane recenzje
            if (window.location.hash.includes('#/mieszkania')) {
                fetchApartments();
            }
        } else {
            // Obsługa błędów zwróconych przez GraphQL (w polu `data.addReview.errors` lub w głównym `errors`)
            const errors: ApiError[] | undefined = resData.data?.addReview?.errors || resData.errors;
            const errorMessage = errors && errors.length > 0
                ? errors.map(e => e.message).join('; ') // Łączenie komunikatów błędów
                : 'Nieznany błąd podczas dodawania recenzji.';
            alert(`Błąd dodawania recenzji: ${errorMessage}`);
            console.error("Błąd GraphQL (addReview):", errors || resData);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
        console.error("Błąd sieciowy (addReview):", error);
        alert('Wystąpił błąd sieciowy podczas dodawania recenzji.');
    }
}

/**
 * Wyświetla okno dialogowe z potwierdzeniem usunięcia recenzji.
 * @param reviewGlobalRelayId Globalne ID Relay recenzji do usunięcia.
 * @param reviewCommentSnippet Fragment komentarza recenzji do wyświetlenia w potwierdzeniu.
 */
export function confirmDeleteReview(reviewGlobalRelayId: string, reviewCommentSnippet: string): void {
    console.log("confirmDeleteReview CALLED for Global Relay ID:", reviewGlobalRelayId, "Snippet:", reviewCommentSnippet);
    if (confirm(`Czy na pewno chcesz usunąć recenzję: "${reviewCommentSnippet}..." (Globalne ID: ${reviewGlobalRelayId})?`)) {
        deleteReview(reviewGlobalRelayId); // Wywołanie funkcji usuwającej po potwierdzeniu
    }
}

/**
 * Usuwa recenzję z serwera na podstawie jej globalnego ID Relay.
 * Wymaga uprawnień administratora.
 * @param reviewGlobalRelayId Globalne ID Relay recenzji do usunięcia.
 */
export async function deleteReview(reviewGlobalRelayId: string): Promise<void> {
    console.log("deleteReview CALLED for Global Relay ID:", reviewGlobalRelayId);
    // Sprawdzenie autoryzacji i roli administratora
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Musisz być zalogowany jako Administrator, aby usunąć recenzję.');
        return;
    }
    // Walidacja ID recenzji
    if (!reviewGlobalRelayId || typeof reviewGlobalRelayId !== 'string' || reviewGlobalRelayId.trim() === "") {
        alert('Brak poprawnego globalnego ID recenzji do usunięcia.');
        console.error("deleteReview: reviewGlobalRelayId jest nieprawidłowy:", reviewGlobalRelayId);
        return;
    }

    // Definicja mutacji GraphQL do usuwania recenzji
    const graphqlMutation = {
        query: `
            mutation UsunRecenzje($id: ID!) { # Serwer GraphQL oczekuje globalnego ID typu ID!
              deleteReview(id: $id) 
            }
        `,
        variables: { id: reviewGlobalRelayId } // Przekazanie globalnego ID jako zmiennej
    };

    console.log("Wysyłanie mutacji GraphQL (deleteReview):", JSON.stringify(graphqlMutation, null, 2));

    try {
        // Wysłanie żądania do serwera GraphQL
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(graphqlMutation),
        });

        // Bezpieczne parsowanie odpowiedzi JSON
        const responseData = await response.json().catch(e => {
            console.error("Błąd parsowania JSON w deleteReview:", e);
            return { errors: [{ message: "Nie udało się sparsować odpowiedzi serwera." }] } as GraphQLResponse<null>;
        }) as GraphQLResponse<DeleteReviewMutationData>;

        console.log("Delete review response from server:", responseData);

        // Obsługa pomyślnego usunięcia recenzji
        if (response.ok && responseData.data?.deleteReview === true) {
            alert('Recenzja została pomyślnie usunięta!');
            // Odświeżenie odpowiednich widoków, jeśli użytkownik się na nich znajduje
            const currentHash = window.location.hash;
            if (currentHash.includes('#/mieszkania')) {
                fetchApartments(); // Odśwież listę mieszkań (mogą tam być widoczne recenzje)
            }
            if (currentHash.includes('#/profil')) {
                fetchMyProfile(); // Odśwież profil (jeśli recenzje są tam częścią danych)
            }
        } else if (responseData.errors && responseData.errors.length > 0) { // Obsługa błędów GraphQL
            alert(`Błąd usuwania recenzji: ${responseData.errors.map(e => e.message).join('; ')}`);
        } else if (!response.ok) { // Obsługa błędów HTTP
            alert(`Błąd serwera (${response.status}) przy usuwaniu recenzji.`);
        } else if (responseData.data?.deleteReview === false || responseData.data?.deleteReview === null) {
            // Jeśli mutacja zwróciła false lub null, co może oznaczać niepowodzenie operacji na serwerze
            alert('Nie udało się usunąć recenzji (operacja na serwerze zwróciła false lub null).');
        } else { // Inne nieoczekiwane przypadki
            alert('Nie udało się usunąć recenzji z nieznanego powodu.');
            console.warn('Unexpected response structure in deleteReview:', responseData);
        }
    } catch (error: any) { // Obsługa błędów sieciowych
        console.error('Delete review network/fetch error:', error);
        alert(`Wystąpił błąd sieciowy przy usuwaniu recenzji: ${error instanceof Error ? error.message : String(error)}`);
    }
}