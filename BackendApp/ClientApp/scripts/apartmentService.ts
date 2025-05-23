// Importy modułów i typów
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { showSection } from './uiService.js';
import { handleRouteChange } from './router.js';
import { calculateTotalPrice } from './bookingService.js';

import {
    Apartment,
    Review,
    GraphQLResponse,
    ApartmentForSelect,

    AddApartmentInput,
    UpdateApartmentInput,
    AddApartmentMutationPayload,
    UpdateApartmentMutationPayload,
    DeleteApartmentMutationPayload,
    PageInfo,
    ApartmentsQueryData,
    ApiError
} from './types.js';

// Zmienne globalne do zarządzania paginacją listy mieszkań
let currentApartmentsPageInfo: PageInfo | null = null; // Informacje o bieżącej stronie (GraphQL PageInfo)
const APARTMENTS_PER_PAGE = 10; // Liczba mieszkań wyświetlanych na jednej stronie
let currentApartmentPageNumber = 1; // Numer bieżącej strony listy mieszkań

/**
 * Pobiera listę mieszkań (ID, nazwa, cena) do wypełnienia elementów select
 * używanych w formularzach dodawania recenzji i rezerwacji.
 */
export async function fetchApartmentsForSelect(): Promise<void> {
    console.log("[INFO] fetchApartmentsForSelect function CALLED");
    // Pobranie referencji do elementów select
    const localReviewApartmentSelectEl = document.getElementById('reviewApartmentSelect') as HTMLSelectElement | null;
    const localBookingApartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;

    // Filtrowanie, aby uzyskać tylko istniejące elementy select
    const selectsToPopulate: HTMLSelectElement[] = [localReviewApartmentSelectEl, localBookingApartmentSelectEl]
        .filter((el): el is HTMLSelectElement => el !== null);

    if (selectsToPopulate.length === 0) return; // Jeśli nie ma selectów do wypełnienia, zakończ

    // Ustawienie początkowego stanu "ładowanie" dla selectów
    selectsToPopulate.forEach(selectEl => {
        selectEl.innerHTML = '<option value="">Ładowanie mieszkań...</option>';
    });

    // Zapytanie GraphQL do pobrania podstawowych danych mieszkań
    const graphqlQuery = { query: `query PobierzMieszkaniaDlaSelect { apartments(first: 49) { nodes { databaseId name pricePerNight } } }` };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
        });

        const responseData = await response.json() as GraphQLResponse<{ apartments: { nodes: ApartmentForSelect[] } }>;

        // Funkcja pomocnicza do wypełniania pojedynczego elementu select
        const populateSelect = (selectEl: HTMLSelectElement, apartments: ApartmentForSelect[]): void => {
            selectEl.innerHTML = '<option value="">-- Wybierz mieszkanie --</option>';
            if (apartments && apartments.length > 0) {
                apartments.forEach((apt: ApartmentForSelect) => {
                    const option = document.createElement('option');
                    option.value = apt.databaseId;
                    option.textContent = `${apt.name} (${apt.pricePerNight !== null ? apt.pricePerNight.toFixed(2) + ' PLN/noc' : 'Cena nieznana'})`;
                    if (apt.pricePerNight !== null) {
                        option.dataset.pricePerNight = apt.pricePerNight.toString(); // Przechowywanie ceny dla kalkulacji
                    }
                    selectEl.appendChild(option);
                });
            } else {
                selectEl.innerHTML = '<option value="">Brak mieszkań do wyboru</option>';
            }
        };

        // Wypełnienie wszystkich selectów danymi lub obsługa błędu
        if (responseData.data?.apartments?.nodes) {
            selectsToPopulate.forEach(selectEl => populateSelect(selectEl, responseData.data!.apartments.nodes));
            // Jeśli select rezerwacji istnieje i ma wybraną wartość, przelicz cenę
            const bookingSelect = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
            if (bookingSelect?.value) {
                calculateTotalPrice();
            }
        } else {
            const errorMsg = responseData.errors?.map(e => e.message).join(', ') || "No data or unexpected error structure";
            selectsToPopulate.forEach(selectEl => {
                selectEl.innerHTML = '<option value="">Nie załadowano mieszkań</option>';
            });
            console.error("[ERROR] Error fetching apartments for select:", errorMsg, responseData.errors);
        }
    } catch (error: any) {
        console.error('[ERROR] Fetch apartments for select error:', error);
        selectsToPopulate.forEach(selectEl => {
            selectEl.innerHTML = '<option value="">Błąd ładowania</option>';
        });
    }
}

/**
 * Pobiera i wyświetla listę mieszkań z paginacją.
 * @param direction Kierunek paginacji ('next', 'previous', 'first').
 * @param cursor Kursor GraphQL dla paginacji.
 */
export async function fetchApartments(
    direction: 'next' | 'previous' | 'first' = 'first',
    cursor?: string | null
): Promise<void> {
    // Aktualizacja numeru bieżącej strony w zależności od kierunku
    if (direction === 'first') {
        currentApartmentPageNumber = 1;
    } else if (direction === 'next' && currentApartmentsPageInfo?.hasNextPage) {
        currentApartmentPageNumber++;
    } else if (direction === 'previous' && currentApartmentsPageInfo?.hasPreviousPage) {
        currentApartmentPageNumber--;
        if (currentApartmentPageNumber < 1) currentApartmentPageNumber = 1; // Zapobieganie numerom strony < 1
    }

    console.log(`[INFO] fetchApartments function CALLED - Page: ${currentApartmentPageNumber}, Direction: ${direction}, Cursor: ${cursor}`);
    // Pobranie referencji do elementów DOM
    const rawEl = document.getElementById('apartmentsResponseRaw') as HTMLPreElement | null;
    const listEl = document.getElementById('apartmentsListFormatted') as HTMLElement | null;
    const paginationControlsEl = document.getElementById('apartmentsPaginationControls') as HTMLElement | null;
    const currentUserRole: string | null = getUserRole();

    if (!rawEl || !listEl || !paginationControlsEl) {
        console.error("[ERROR] fetchApartments: Brakuje elementów DOM: apartmentsResponseRaw, apartmentsListFormatted lub apartmentsPaginationControls.");
        if (listEl) listEl.innerHTML = '<p style="color:red; text-align:center;">Błąd wewnętrzny strony.</p>';
        return;
    }

    // Ustawienie stanu "ładowanie"
    rawEl.textContent = 'Pobieranie mieszkań...';
    listEl.innerHTML = '<p style="text-align:center;">Ładowanie listy mieszkań...</p>';
    paginationControlsEl.innerHTML = '';

    // Przygotowanie zmiennych dla zapytania GraphQL w zależności od kierunku paginacji
    let gqlVariables: { first?: number; after?: string | null; last?: number; before?: string | null } = {
        first: undefined, after: null, last: undefined, before: null
    };

    if (direction === 'next' && cursor) {
        gqlVariables = { first: APARTMENTS_PER_PAGE, after: cursor, last: undefined, before: null };
    } else if (direction === 'previous' && cursor) {
        gqlVariables = { last: APARTMENTS_PER_PAGE, before: cursor, first: undefined, after: null };
    } else { // Domyślnie (dla 'first' lub braku kursora)
        gqlVariables = { first: APARTMENTS_PER_PAGE, after: null, last: undefined, before: null };
    }

    // Pełne zapytanie GraphQL
    const graphqlQuery = {
        query: `
            query PobierzMieszkania($first: Int, $after: String, $last: Int, $before: String) {
              apartments(first: $first, after: $after, last: $last, before: $before) {
                nodes {
                  id databaseId name description location numberOfBedrooms numberOfBathrooms amenities isAvailable pricePerNight
                  reviews { nodes { id comment rating user { name } } totalCount }
                }
                pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                totalCount
              }
            }
        `,
        variables: gqlVariables
    };

    console.log("[INFO] Wysyłanie zapytania GraphQL (fetchApartments):", JSON.stringify(graphqlQuery, null, 2));

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
        });

        // Bezpieczne parsowanie JSON
        const responseData = await response.json().catch(e => {
            console.error("[ERROR] Błąd parsowania JSON w fetchApartments:", e);
            return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." } as ApiError] } as GraphQLResponse<null>;
        }) as GraphQLResponse<ApartmentsQueryData>;

        if (rawEl) rawEl.textContent = JSON.stringify(responseData, null, 2); // Wyświetlenie surowej odpowiedzi

        if (response.ok && responseData.data?.apartments) {
            const connection = responseData.data.apartments;
            const apartments: Apartment[] = connection.nodes || connection.edges?.map(edge => edge.node) || [];
            currentApartmentsPageInfo = connection.pageInfo; // Zapisanie informacji o paginacji

            // Wyświetlanie mieszkań lub odpowiedniego komunikatu
            if (connection.totalCount === 0 || (apartments.length === 0 && direction === 'first')) {
                listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych mieszkań w systemie.</p>';
            } else if (apartments.length === 0 && (direction === 'next' || direction === 'previous')) {
                // Komunikat, jeśli paginacja doszła do końca w danym kierunku
                if (!listEl.innerHTML.includes("Nie znaleziono żadnych mieszkań w systemie.")) {
                    listEl.innerHTML += '<p style="text-align:center; color: orange;">Brak więcej mieszkań w tym kierunku.</p>';
                }
            } else {
                // Budowanie HTML dla listy mieszkań
                let html = `<h4 style="text-align:center;">Znaleziono mieszkań: ${connection.totalCount} (Wyświetlono na tej stronie: ${apartments.length})</h4>`;
                html += '<div class="apartment-list-container" style="display: flex; flex-direction: column; gap: 15px;">';
                apartments.forEach((apt: Apartment) => {
                    // Zabezpieczenie danych mieszkania przed użyciem w atrybutach HTML/JS
                    const apartmentDataString = JSON.stringify(apt).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                    html += `
                        <div class="data-card apartment-card" id="apartment-card-${apt.databaseId}">
                            <h4>${apt.name || '<em>Nazwa nieznana</em>'}</h4>
                            <p><strong>ID (Baza):</strong> ${apt.databaseId || '<em>N/A</em>'}</p>
                            <p><strong>Lokalizacja:</strong> ${apt.location || '<em>Brak</em>'}</p>
                            <p><strong>Cena/noc:</strong> ${typeof apt.pricePerNight === 'number' ? apt.pricePerNight.toFixed(2) : '<em>N/A</em>'} PLN</p>
                            <p><strong>Dostępne:</strong> ${apt.isAvailable ? 'Tak' : 'Nie'}</p>
                            <p><strong>Opis:</strong> ${apt.description ? (apt.description.substring(0, 100) + (apt.description.length > 100 ? '...' : '')) : '<em>Brak</em>'}</p>
                            <p><strong>Sypialnie:</strong> ${apt.numberOfBedrooms ?? '<em>N/A</em>'}, <strong>Łazienki:</strong> ${apt.numberOfBathrooms ?? '<em>N/A</em>'}</p>
                            <p><strong>Udogodnienia:</strong> ${(apt.amenities && apt.amenities.length > 0) ? apt.amenities.join(', ') : '<em>Brak</em>'}</p>`;
                    // Akcje dla administratora (edycja, usuwanie)
                    if (currentUserRole === 'Admin' && apt.databaseId) {
                        const apartmentNameForJsSafe = String(apt.name || 'Mieszkanie').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                        const apartmentIdForJsSafe = String(apt.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                        html += `<div class="admin-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">`;
                        html += `<button onclick='prepareEditApartmentForm(${apartmentDataString})' class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #3498db; color:white; border:none; border-radius:3px; cursor:pointer;">Edytuj</button>`;
                        html += `<button onclick="confirmDeleteApartment('${apartmentIdForJsSafe}', '${apartmentNameForJsSafe}')" class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń</button>`;
                        html += `</div>`;
                    }
                    // Wyświetlanie recenzji
                    if (apt.reviews?.nodes && apt.reviews.nodes.length > 0) {
                        html += `<div class="reviews-list" style="margin-top:10px;"><h5>Recenzje (${apt.reviews.totalCount}):</h5>`;
                        apt.reviews.nodes.forEach((review: Review) => {
                            const reviewIdForActions = review.id; // GraphQL ID
                            const reviewDisplayId = review.id.replace(/[^a-zA-Z0-9_-]/g, ""); // ID bezpieczne dla HTML
                            html += `<div class="review-item" id="review-item-${reviewDisplayId}"><p><strong>Ocena:</strong> ${review.rating}/5</p><p><em>"${review.comment || 'Brak komentarza'}"</em></p><p><small>- ${review.user?.name || 'Anonim'}</small></p>`;
                            // Akcja usuwania recenzji dla admina
                            if (currentUserRole === 'Admin' && reviewIdForActions) {
                                const reviewIdForJsSafe = String(reviewIdForActions).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                                const commentSnippetSafe = (review.comment || "Recenzja").substring(0, 20).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                                html += `<button onclick="confirmDeleteReview('${reviewIdForJsSafe}', '${commentSnippetSafe}')" class="action-button-secondary" style="font-size:0.8em; padding:3px 6px; background-color: #f39c12; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń recenzję</button>`;
                            }
                            html += `</div>`;
                        });
                        html += `</div>`;
                    } else { html += `<p><small>Brak recenzji.</small></p>`; }
                    html += `</div>`; // Koniec .data-card
                });
                html += '</div>'; // Koniec .apartment-list-container
                listEl.innerHTML = html;
            }
            renderPaginationControls(paginationControlsEl, currentApartmentsPageInfo, connection.totalCount);
        } else if (responseData.errors) {
            const errorMessages = responseData.errors.map(err => `${err.message} (Path: ${err.path?.join(' > ') || 'N/A'})`).join('<br>');
            if (listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd pobierania mieszkań:<br>${errorMessages}</p>`;
            console.error("[ERROR] GraphQL errors (fetchApartments):", responseData.errors);
        } else {
            if (listEl) listEl.innerHTML = `<p style="color:orange; text-align:center;">Brak danych mieszkań w odpowiedzi lub błąd serwera (Status: ${response.status}).</p>`;
            console.warn("[WARN] Nie znaleziono danych mieszkań (fetchApartments):", responseData, "Status HTTP:", response.status);
        }
    } catch (error: any) {
        console.error('[ERROR] Błąd sieciowy w fetchApartments:', error);
        if (rawEl) rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
        if (listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd sieciowy podczas pobierania mieszkań: ${error instanceof Error ? error.message : String(error)}</p>`;
    }
}

/**
 * Renderuje kontrolki paginacji (przyciski Poprzednia/Następna).
 * @param container Element DOM, w którym mają być renderowane kontrolki.
 * @param pageInfo Obiekt PageInfo z GraphQL.
 * @param totalCount Całkowita liczba mieszkań.
 */
function renderPaginationControls(
    container: HTMLElement,
    pageInfo: PageInfo | null,
    totalCount: number
): void {
    if (!pageInfo || !container) {
        if (container) container.innerHTML = ""; // Wyczyść kontener, jeśli nie ma pageInfo
        return;
    }

    let paginationHtml = `<div style="margin-top: 20px; text-align: center; padding-bottom: 20px;">`;

    // Przycisk "Poprzednia"
    paginationHtml += `<button id="apartmentsPrevPageBtn" class="action-button-secondary" style="margin-right: 10px;" ${!pageInfo.hasPreviousPage ? 'disabled' : ''}>Poprzednia</button>`;

    // Informacja o stronie i liczbie elementów
    const totalPagesEst = Math.ceil(totalCount / APARTMENTS_PER_PAGE);
    paginationHtml += `<span style="margin: 0 10px;"> Strona ${currentApartmentPageNumber} z ${totalPagesEst > 0 ? totalPagesEst : 1} (Łącznie: ${totalCount}) </span>`;

    // Przycisk "Następna"
    paginationHtml += `<button id="apartmentsNextPageBtn" class="action-button-secondary" style="margin-left: 10px;" ${!pageInfo.hasNextPage ? 'disabled' : ''}>Następna</button>`;
    paginationHtml += `</div>`;
    container.innerHTML = paginationHtml;

    // Dodanie obsługi zdarzeń do przycisków
    const prevBtn = document.getElementById('apartmentsPrevPageBtn');
    if (prevBtn && pageInfo.hasPreviousPage) {
        prevBtn.onclick = () => {
            if (currentApartmentsPageInfo?.hasPreviousPage && currentApartmentsPageInfo.startCursor) {
                fetchApartments('previous', currentApartmentsPageInfo.startCursor);
            }
        };
    }

    const nextBtn = document.getElementById('apartmentsNextPageBtn');
    if (nextBtn && pageInfo.hasNextPage) {
        nextBtn.onclick = () => {
            if (currentApartmentsPageInfo?.hasNextPage && currentApartmentsPageInfo.endCursor) {
                fetchApartments('next', currentApartmentsPageInfo.endCursor);
            }
        };
    }
}

/**
 * Przesyła dane nowego mieszkania do serwera (GraphQL Mutation).
 * Wymaga uprawnień administratora.
 */
export async function submitNewApartment(): Promise<void> {
    console.log("[INFO] submitNewApartment function CALLED");
    const responseEl = document.getElementById('addApartmentResponse') as HTMLPreElement | null;
    if (!responseEl) { console.error("[ERROR] Element addApartmentResponse nie znaleziony"); return; }
    responseEl.textContent = 'Dodawanie mieszkania...';

    // Sprawdzenie autoryzacji
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Brak uprawnień.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/mieszkania'; // Przekierowanie, jeśli brak uprawnień
        return;
    }

    // Pobranie danych z formularza
    const name = (document.getElementById('apartmentName') as HTMLInputElement).value;
    const description = (document.getElementById('apartmentDescription') as HTMLTextAreaElement).value;
    const location = (document.getElementById('apartmentLocation') as HTMLInputElement).value;
    const numberOfBedrooms = parseInt((document.getElementById('apartmentBedrooms') as HTMLInputElement).value, 10);
    const numberOfBathrooms = parseInt((document.getElementById('apartmentBathrooms') as HTMLInputElement).value, 10);
    const amenitiesText = (document.getElementById('apartmentAmenities') as HTMLInputElement).value;
    const isAvailable = (document.getElementById('apartmentIsAvailable') as HTMLInputElement).checked;
    const pricePerNight = parseFloat((document.getElementById('apartmentPrice') as HTMLInputElement).value);

    // Przygotowanie obiektu input dla mutacji GraphQL
    const input: AddApartmentInput = {
        name, description, location, numberOfBedrooms, numberOfBathrooms,
        amenities: (amenitiesText || "").split(',').map(a => a.trim()).filter(a => a.length > 0), // Konwersja stringa na tablicę
        isAvailable, pricePerNight
    };

    // Podstawowa walidacja danych wejściowych
    if (!input.name || !input.description || !input.location ||
        isNaN(input.numberOfBedrooms) || isNaN(input.numberOfBathrooms) ||
        isNaN(input.pricePerNight) || input.pricePerNight < 0) {
        alert('Wypełnij poprawnie wszystkie pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
        responseEl.textContent = 'Błędne dane wejściowe.';
        return;
    }

    // Mutacja GraphQL
    const mutation = {
        query: `mutation DodajMieszkanie($input: AddApartmentInput!) { addApartment(input: $input) { id name } }`,
        variables: { input }
    };

    console.log("[INFO] Wysyłanie mutacji (submitNewApartment):", JSON.stringify(mutation, null, 2));

    try {
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });
        const resData = await res.json() as GraphQLResponse<AddApartmentMutationPayload>;
        if (responseEl) responseEl.textContent = JSON.stringify(resData, null, 2); // Wyświetlenie odpowiedzi

        if (resData.data?.addApartment?.id) {
            alert('Mieszkanie dodane pomyślnie!');
            (document.getElementById('addApartmentForm') as HTMLFormElement | null)?.reset(); // Reset formularza
            await fetchApartments('first'); // Odświeżenie listy mieszkań
            await fetchApartmentsForSelect(); // Odświeżenie list select
            window.location.hash = '#/mieszkania'; // Przekierowanie na listę mieszkań
        } else if (resData.errors) {
            alert(`Błąd GraphQL: ${resData.errors.map(e => e.message).join('; ')}`);
        } else {
            alert('Nieznany błąd podczas dodawania mieszkania.');
        }
    } catch (error: any) {
        if (responseEl) responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
        console.error("[ERROR]", error);
        alert('Wystąpił błąd sieciowy.');
    }
}

/**
 * Wypełnia formularz edycji danymi wybranego mieszkania.
 * @param apartmentData Obiekt z danymi mieszkania.
 */
export function prepareEditApartmentForm(apartmentData: Apartment): void {
    console.log("[INFO] Przygotowywanie formularza edycji dla:", apartmentData);
    // Sprawdzenie poprawności danych wejściowych
    if (!apartmentData || typeof apartmentData !== 'object' || !apartmentData.databaseId) {
        alert("Błąd: Nieprawidłowe dane mieszkania do edycji lub brak ID.");
        console.error("[ERROR] Invalid apartmentData for edit:", apartmentData);
        return;
    }
    // Wypełnienie pól formularza
    (document.getElementById('editApartmentId') as HTMLInputElement).value = apartmentData.databaseId;
    (document.getElementById('editApartmentName') as HTMLInputElement).value = apartmentData.name || '';
    (document.getElementById('editApartmentDescription') as HTMLTextAreaElement).value = apartmentData.description || '';
    (document.getElementById('editApartmentLocation') as HTMLInputElement).value = apartmentData.location || '';
    (document.getElementById('editApartmentBedrooms') as HTMLInputElement).value = (apartmentData.numberOfBedrooms ?? 0).toString();
    (document.getElementById('editApartmentBathrooms') as HTMLInputElement).value = (apartmentData.numberOfBathrooms ?? 0).toString();
    (document.getElementById('editApartmentAmenities') as HTMLInputElement).value = Array.isArray(apartmentData.amenities) ? apartmentData.amenities.join(', ') : (apartmentData.amenities || '');
    (document.getElementById('editApartmentIsAvailable') as HTMLInputElement).checked = apartmentData.isAvailable || false;
    (document.getElementById('editApartmentPrice') as HTMLInputElement).value = (apartmentData.pricePerNight ?? 0).toString();

    const responseEl = document.getElementById('editApartmentResponse') as HTMLPreElement | null;
    if (responseEl) responseEl.textContent = 'Wprowadź zmiany i zapisz.';
    showSection('editApartmentSection'); // Wyświetlenie sekcji edycji
}

/**
 * Anuluje proces edycji mieszkania, resetuje formularz i wraca do listy mieszkań.
 */
export function cancelEditApartment(): void {
    const editForm = document.getElementById('editApartmentForm') as HTMLFormElement | null;
    if (editForm) editForm.reset(); // Reset formularza
    const editApartmentIdEl = document.getElementById('editApartmentId') as HTMLInputElement | null;
    if (editApartmentIdEl) editApartmentIdEl.value = ''; // Wyczyszczenie ID edytowanego mieszkania

    // Nawigacja do listy mieszkań, odświeżając widok, jeśli już tam jesteśmy
    if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
        handleRouteChange(); // Wymuszenie odświeżenia, jeśli jesteśmy na tej samej stronie
    } else {
        window.location.hash = '#/mieszkania';
    }
}

/**
 * Przesyła zaktualizowane dane mieszkania do serwera (GraphQL Mutation).
 * Wymaga uprawnień administratora.
 */
export async function submitUpdateApartment(): Promise<void> {
    console.log("[INFO] submitUpdateApartment function CALLED");
    const responseEl = document.getElementById('editApartmentResponse') as HTMLPreElement | null;
    if (!responseEl) { console.error("[ERROR] Brakuje elementu editApartmentResponse"); return; }
    responseEl.textContent = 'Aktualizowanie mieszkania...';

    // Sprawdzenie autoryzacji
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();
    if (!currentJwtToken || currentUserRole !== 'Admin') { alert('Brak uprawnień...'); responseEl.textContent = 'Brak autoryzacji.'; return; }

    const apartmentId = (document.getElementById('editApartmentId') as HTMLInputElement).value;
    if (!apartmentId) { alert('Błąd: Brak ID mieszkania.'); responseEl.textContent = 'Błąd: Brak ID mieszkania.'; return; }

    // Przygotowanie obiektu input dla mutacji
    const input: UpdateApartmentInput = {
        id: apartmentId, // Globalne ID GraphQL
        name: (document.getElementById('editApartmentName') as HTMLInputElement).value,
        description: (document.getElementById('editApartmentDescription') as HTMLTextAreaElement).value,
        location: (document.getElementById('editApartmentLocation') as HTMLInputElement).value,
        numberOfBedrooms: parseInt((document.getElementById('editApartmentBedrooms') as HTMLInputElement).value, 10),
        numberOfBathrooms: parseInt((document.getElementById('editApartmentBathrooms') as HTMLInputElement).value, 10),
        amenities: ((document.getElementById('editApartmentAmenities') as HTMLInputElement).value || "").split(',').map(a => a.trim()).filter(a => a.length > 0),
        isAvailable: (document.getElementById('editApartmentIsAvailable') as HTMLInputElement).checked,
        pricePerNight: parseFloat((document.getElementById('editApartmentPrice') as HTMLInputElement).value)
    };

    // Podstawowa walidacja (pola, które są aktualizowane, nie mogą być puste, jeśli zdefiniowane)
    if (
        (input.name !== undefined && !input.name) ||
        (input.description !== undefined && !input.description) ||
        (input.location !== undefined && !input.location) ||
        (typeof input.numberOfBedrooms !== 'undefined' && isNaN(input.numberOfBedrooms)) ||
        (typeof input.numberOfBathrooms !== 'undefined' && isNaN(input.numberOfBathrooms)) ||
        (typeof input.pricePerNight !== 'undefined' && (isNaN(input.pricePerNight) || input.pricePerNight < 0))
    ) {
        alert('Wypełnij poprawnie wszystkie zmieniane pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
        if (responseEl) responseEl.textContent = 'Błędne dane wejściowe.';
        return;
    }

    // Mutacja GraphQL
    const mutation = {
        query: `
            mutation AktualizujMieszkanie($input: UpdateApartmentInput!) {
              updateApartment(input: $input) {
                id name description location numberOfBedrooms numberOfBathrooms amenities isAvailable pricePerNight
              }
            }
        `,
        variables: { input }
    };
    try {
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });
        const resData = await res.json() as GraphQLResponse<UpdateApartmentMutationPayload>;
        if (responseEl) responseEl.textContent = JSON.stringify(resData, null, 2);

        if (resData.data?.updateApartment) {
            alert('Mieszkanie zaktualizowane pomyślnie!');
            (document.getElementById('editApartmentForm') as HTMLFormElement | null)?.reset();
            const editApartmentIdEl = document.getElementById('editApartmentId') as HTMLInputElement | null;
            if (editApartmentIdEl) editApartmentIdEl.value = ''; // Wyczyść ID

            // Nawigacja do listy mieszkań, wymuszając odświeżenie
            if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
                handleRouteChange();
            } else {
                window.location.hash = '#/mieszkania';
            }
        } else if (resData.errors) {
            alert(`Błąd aktualizacji mieszkania: ${resData.errors.map(e => e.message).join('; ')}`);
        } else {
            alert('Nie udało się zaktualizować mieszkania.');
        }
    } catch (error: any) {
        if (responseEl) responseEl.textContent = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
        console.error('[ERROR] Błąd sieciowy (submitUpdateApartment):', error);
        alert('Wystąpił błąd sieciowy.');
    }
}

/**
 * Wyświetla okno dialogowe z potwierdzeniem usunięcia mieszkania.
 * @param apartmentDbId ID mieszkania z bazy danych (UUID).
 * @param apartmentName Nazwa mieszkania.
 */
export function confirmDeleteApartment(apartmentDbId: string, apartmentName: string): void {
    if (confirm(`Czy na pewno chcesz usunąć mieszkanie "${apartmentName}" (ID: ${apartmentDbId})?`)) {
        deleteApartment(apartmentDbId);
    }
}

/**
 * Usuwa mieszkanie z serwera (GraphQL Mutation).
 * Wymaga uprawnień administratora.
 * @param apartmentDbId ID mieszkania z bazy danych (UUID) do usunięcia.
 */
export async function deleteApartment(apartmentDbId: string): Promise<void> {
    console.log("[INFO] deleteApartment CALLED for ID:", apartmentDbId);
    // Sprawdzenie autoryzacji
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') { alert('Brak uprawnień.'); return; }
    if (!apartmentDbId) { alert('Brak ID.'); return; }

    // Mutacja GraphQL (używa UUID jako ID, zgodnie ze schematem backendu dla deleteApartment)
    const mutation = {
        query: `mutation UsunMieszkanie($id: UUID!) { deleteApartment(id: $id) }`,
        variables: { id: apartmentDbId }
    };
    let resData: GraphQLResponse<DeleteApartmentMutationPayload> | null = null;
    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });
        const responseText = await response.text(); // Pobranie odpowiedzi jako tekst

        // Obsługa odpowiedzi - backend może zwracać 'true' lub pustą odpowiedź przy sukcesie
        if (response.ok) {
            try {
                const parsedJson = JSON.parse(responseText); // Próba parsowania jako JSON
                if (parsedJson.data && typeof parsedJson.data.deleteApartment === 'boolean') {
                    resData = { data: { deleteApartment: parsedJson.data.deleteApartment } };
                } else if (parsedJson.errors && Array.isArray(parsedJson.errors)) {
                    resData = { errors: parsedJson.errors as ApiError[] };
                } else {
                    // Jeśli JSON jest poprawny, ale struktura nieoczekiwana
                    console.warn("[WARN] Poprawnie sparsowano JSON, ale struktura nie jest oczekiwanym payloadem GraphQL (deleteApartment):", responseText);
                    resData = { errors: [{ message: `Nieoczekiwana struktura danych JSON od serwera (status ${response.status}): ${responseText}` } as ApiError] };
                }
            } catch (e: any) {
                // Jeśli odpowiedź nie jest JSON-em, sprawdź, czy to 'true' lub pusta odpowiedź (sukces)
                if (responseText.trim().toLowerCase() === "true" || response.status === 204 || responseText.trim() === "") {
                    resData = { data: { deleteApartment: true } };
                } else {
                    console.error("[ERROR]", e, "Błąd parsowania odpowiedzi jako JSON, a odpowiedź nie jest 'true' ani pusta (deleteApartment):", responseText);
                    resData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa serwera (status ${response.status}): ${responseText}` } as ApiError] };
                }
            }
        } else { // Jeśli status HTTP wskazuje na błąd
            console.error("[ERROR] Błąd HTTP w deleteApartment. Status:", response.status, "Odpowiedź:", responseText);
            try {
                const parsedError = JSON.parse(responseText); // Spróbuj sparsować jako JSON błędu
                if (parsedError && Array.isArray(parsedError.errors)) {
                    resData = { errors: parsedError.errors as ApiError[] };
                } else {
                    resData = { errors: [{ message: `Błąd serwera (status ${response.status}): ${responseText}` } as ApiError] };
                }
            } catch (e) { // Jeśli odpowiedź błędu nie jest JSON
                resData = { errors: [{ message: `Błąd serwera (status ${response.status}), odpowiedź nie jest JSON: ${responseText}` } as ApiError] };
            }
        }

        // Obsługa wyniku operacji
        if (resData?.data?.deleteApartment === true) {
            alert('Mieszkanie usunięte pomyślnie!');
            console.log("[INFO] Delete successful, fetching apartments...");
            await fetchApartments('first'); // Odświeżenie listy mieszkań
        } else if (resData?.errors && resData.errors.length > 0) {
            const errorMessages = resData.errors.map(e => e.message).join('; ');
            alert(`Błąd usuwania: ${errorMessages}`);
            console.error("[ERROR] GraphQL errors/Frontend processing error (deleteApartment):", JSON.parse(JSON.stringify(resData.errors)));
        } else {
            alert('Nie udało się usunąć mieszkania lub serwer zwrócił nieoczekiwane/puste dane.');
            console.warn("[WARN] Unexpected response or no data in deleteApartment:", JSON.stringify(resData, null, 2));
        }
    } catch (error: any) {
        console.error('[ERROR] Delete apartment network error:', error);
        alert(`Błąd sieciowy: ${error instanceof Error ? error.message : String(error)}`);
    }
}