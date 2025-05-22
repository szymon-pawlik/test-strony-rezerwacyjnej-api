// apartmentService.ts
import { backendAppUrl } from './config.js';
import { getJwtToken, getUserRole } from './state.js';
import { showSection } from './uiService.js';
import { handleRouteChange } from './router.js';
import { calculateTotalPrice } from './bookingService.js'; // Importowana, ale typowana będzie w bookingService.ts

// Importy typów
import {
    Apartment,
    Review,
    GraphQLResponse,
    ApartmentForSelect,
    ApartmentsForSelectQueryData,
    AddApartmentInput,
    UpdateApartmentInput,
    AddApartmentMutationPayload,
    UpdateApartmentMutationPayload,
    DeleteApartmentMutationPayload
} from './types';

export async function fetchApartmentsForSelect(): Promise<void> {
    console.log("fetchApartmentsForSelect function CALLED");
    const localReviewApartmentSelectEl = document.getElementById('reviewApartmentSelect') as HTMLSelectElement | null;
    const localBookingApartmentSelectEl = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;

    // Filtrujemy tylko istniejące elementy select
    const selectsToPopulate: HTMLSelectElement[] = [localReviewApartmentSelectEl, localBookingApartmentSelectEl]
        .filter((el): el is HTMLSelectElement => el !== null);

    if (selectsToPopulate.length === 0) return;

    selectsToPopulate.forEach(selectEl => {
        selectEl.innerHTML = '<option value="">Ładowanie mieszkań...</option>';
    });

    const graphqlQuery = { query: `query PobierzMieszkaniaDlaSelect { apartments { nodes { databaseId name pricePerNight } } }` };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
        });
        const responseData = await response.json() as GraphQLResponse<ApartmentsForSelectQueryData>;

        const populateSelect = (selectEl: HTMLSelectElement, apartments: ApartmentForSelect[]): void => {
            selectEl.innerHTML = '<option value="">-- Wybierz mieszkanie --</option>';
            if (apartments && apartments.length > 0) {
                apartments.forEach((apt: ApartmentForSelect) => {
                    const option = document.createElement('option');
                    option.value = apt.databaseId;
                    option.textContent = `${apt.name} (${apt.pricePerNight !== null ? apt.pricePerNight.toFixed(2) + ' PLN/noc' : 'Cena nieznana'})`;
                    if (apt.pricePerNight !== null) {
                        option.dataset.pricePerNight = apt.pricePerNight.toString();
                    }
                    selectEl.appendChild(option);
                });
            } else {
                selectEl.innerHTML = '<option value="">Brak mieszkań do wyboru</option>';
            }
        };

        if (responseData.data?.apartments?.nodes) {
            selectsToPopulate.forEach(selectEl => populateSelect(selectEl, responseData.data!.apartments.nodes));
            const bookingSelect = document.getElementById('bookingApartmentSelect') as HTMLSelectElement | null;
            if (bookingSelect?.value) { // Sprawdzamy czy element istnieje i ma wartość
                calculateTotalPrice();
            }
        } else {
            const errorMsg = responseData.errors?.map(e => e.message).join(', ') || "No data or unexpected error structure";
            selectsToPopulate.forEach(selectEl => {
                selectEl.innerHTML = '<option value="">Nie załadowano mieszkań</option>';
            });
            console.error("Error fetching apartments for select:", errorMsg, responseData.errors);
        }
    } catch (error: any) {
        console.error('Fetch apartments for select error:', error);
        selectsToPopulate.forEach(selectEl => {
            selectEl.innerHTML = '<option value="">Błąd ładowania</option>';
        });
    }
}

export async function fetchApartments(): Promise<void> {
    console.log("fetchApartments function CALLED");
    const rawEl = document.getElementById('apartmentsResponseRaw') as HTMLPreElement | null;
    const listEl = document.getElementById('apartmentsListFormatted') as HTMLElement | null;
    const currentUserRole: string | null = getUserRole();

    if (!rawEl || !listEl) {
        console.error("fetchApartments: Brakuje elementów DOM: apartmentsResponseRaw lub apartmentsListFormatted.");
        if (listEl) listEl.innerHTML = '<p style="color:red; text-align:center;">Błąd wewnętrzny strony: nie można wyświetlić listy mieszkań.</p>';
        return;
    }

    rawEl.textContent = 'Pobieranie mieszkań...';
    listEl.innerHTML = '<p style="text-align:center;">Ładowanie listy mieszkań...</p>';

    // Zapytanie GraphQL - upewnij się, że pasuje do definicji typów Apartment i Review
    const graphqlQuery = {
        query: `
            query PobierzMieszkania {
              apartments {
                nodes {
                  id
                  databaseId
                  name
                  description
                  location
                  numberOfBedrooms
                  numberOfBathrooms
                  amenities
                  isAvailable
                  pricePerNight
                  reviews {
                    nodes {
                      id
                      comment
                      rating
                      user {
                        name
                      }
                    }
                    totalCount
                  }
                }
                totalCount
              }
            }
        `
    };

    console.log("Wysyłanie zapytania GraphQL (fetchApartments):", JSON.stringify(graphqlQuery, null, 2));

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
        });

        const responseData = await response.json().catch(e => {
            console.error("Błąd parsowania JSON w fetchApartments:", e);
            // Zwracamy strukturę błędu zgodną z GraphQLResponse
            return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." }] } as GraphQLResponse<null>;
        }) as GraphQLResponse<{ apartments: { nodes: Apartment[], totalCount: number } }>;


        if (rawEl) rawEl.textContent = JSON.stringify(responseData, null, 2);

        if (response.ok && responseData.data?.apartments?.nodes) {
            const apartments: Apartment[] = responseData.data.apartments.nodes;
            if (apartments.length === 0) {
                listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych mieszkań w systemie.</p>';
                return;
            }

            let html = `<h4 style="text-align:center;">Znaleziono mieszkań: ${responseData.data.apartments.totalCount || apartments.length}</h4>`;
            html += '<div class="apartment-list-container" style="display: flex; flex-direction: column; gap: 15px;">';

            apartments.forEach((apt: Apartment) => {
                // Bezpieczne serializowanie obiektu apt do stringa dla atrybutu onclick
                // Ważne: Przekazywanie obiektów do onclick przez stringify jest ryzykowne
                // i może prowadzić do problemów z bezpieczeństwem (XSS) lub parsowaniem.
                // Lepszym podejściem byłoby przechowywanie danych w JS i używanie event listenerów.
                // Na potrzeby konwersji zachowujemy, ale z uwagą.
                const apartmentDataString = JSON.stringify(apt)
                    .replace(/'/g, "&apos;")  // Zamień pojedyncze cudzysłowy na encję HTML
                    .replace(/"/g, "&quot;"); // Zamień podwójne cudzysłowy na encję HTML

                html += `
                    <div class="data-card apartment-card" id="apartment-card-${apt.databaseId}">
                        <h4>${apt.name || '<em>Nazwa nieznana</em>'}</h4>
                        <p><strong>ID (Baza):</strong> ${apt.databaseId || '<em>N/A</em>'}</p>
                        <p><strong>Lokalizacja:</strong> ${apt.location || '<em>Brak</em>'}</p>
                        <p><strong>Cena/noc:</strong> ${typeof apt.pricePerNight === 'number' ? apt.pricePerNight.toFixed(2) : '<em>N/A</em>'} PLN</p>
                        <p><strong>Dostępne:</strong> ${apt.isAvailable ? 'Tak' : 'Nie'}</p>
                        <p><strong>Opis:</strong> ${apt.description ? (apt.description.substring(0, 100) + (apt.description.length > 100 ? '...' : '')) : '<em>Brak</em>'}</p>
                        <p><strong>Sypialnie:</strong> ${apt.numberOfBedrooms ?? '<em>N/A</em>'}, <strong>Łazienki:</strong> ${apt.numberOfBathrooms ?? '<em>N/A</em>'}</p>
                        <p><strong>Udogodnienia:</strong> ${(apt.amenities && apt.amenities.length > 0) ? apt.amenities.join(', ') : '<em>Brak</em>'}</p>
                `;

                if (currentUserRole === 'Admin' && apt.databaseId) {
                    const apartmentNameForJsSafe = String(apt.name || 'Mieszkanie').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                    const apartmentIdForJsSafe = String(apt.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");

                    html += `<div class="admin-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">`;
                    // UWAGA: Przekazywanie obiektu jako string do funkcji w onclick jest nieidealne.
                    // Lepiej byłoby przypisać event listener w JS.
                    // Funkcja prepareEditApartmentForm będzie musiała sparsować ten string.
                    // Lub, jeśli onclick obsługuje literały obiektowe, można by spróbować:
                    // onclick='window.prepareEditApartmentForm(${JSON.stringify(apt)})'
                    // Ale prepareEditApartmentForm musi być wtedy w window.
                    html += `<button onclick='prepareEditApartmentForm(${apartmentDataString})' class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #3498db; color:white; border:none; border-radius:3px; cursor:pointer;">Edytuj</button>`;
                    html += `<button onclick="confirmDeleteApartment('${apartmentIdForJsSafe}', '${apartmentNameForJsSafe}')" class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń</button>`;
                    html += `</div>`;
                }

                if (apt.reviews?.nodes && apt.reviews.nodes.length > 0) {
                    html += `<div class="reviews-list" style="margin-top:10px;"><h5>Recenzje (${apt.reviews.totalCount}):</h5>`;
                    apt.reviews.nodes.forEach((review: Review) => {
                        const reviewIdForActions = review.id; // Globalne ID Relay
                        // Użycie Math.random do ID jest niezalecane, lepiej polegać na review.id
                        const reviewDisplayId = review.id.replace(/[^a-zA-Z0-9_-]/g, "");
                        html += `<div class="review-item" id="review-item-${reviewDisplayId}">`;
                        html += `<p><strong>Ocena:</strong> ${review.rating}/5</p><p><em>"${review.comment || 'Brak komentarza'}"</em></p><p><small>- ${review.user?.name || 'Anonim'}</small></p>`;
                        if (currentUserRole === 'Admin' && reviewIdForActions) {
                            const reviewIdForJsSafe = String(reviewIdForActions).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            const commentSnippetSafe = (review.comment || "Recenzja").substring(0, 20).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                            html += `<button onclick="confirmDeleteReview('${reviewIdForJsSafe}', '${commentSnippetSafe}')" class="action-button-secondary" style="font-size:0.8em; padding:3px 6px; background-color: #f39c12; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń recenzję</button>`;
                        }
                        html += `</div>`;
                    });
                    html += `</div>`;
                } else {
                    html += `<p><small>Brak recenzji.</small></p>`;
                }
                html += `</div>`;
            });
            html += '</div>';
            if (listEl) listEl.innerHTML = html;

        } else if (responseData.errors) {
            const errorMessages = responseData.errors.map(err => `${err.message} (Path: ${err.path?.join(' > ') || 'N/A'})`).join('<br>');
            if (listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd pobierania mieszkań:<br>${errorMessages}</p>`;
            console.error("GraphQL errors (fetchApartments):", responseData.errors);
        } else {
            if (listEl) listEl.innerHTML = `<p style="color:orange; text-align:center;">Brak danych mieszkań w odpowiedzi lub błąd serwera (Status: ${response.status}).</p>`;
            console.warn("Nie znaleziono danych mieszkań (fetchApartments):", responseData, "Status HTTP:", response.status);
        }
    } catch (error: any) {
        console.error('Błąd sieciowy w fetchApartments:', error);
        if (rawEl) rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
        if (listEl) listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd sieciowy podczas pobierania mieszkań: ${error instanceof Error ? error.message : String(error)}</p>`;
    }
}


export async function submitNewApartment(): Promise<void> {
    console.log("submitNewApartment function CALLED");
    const responseEl = document.getElementById('addApartmentResponse') as HTMLPreElement | null;
    if (!responseEl) {
        console.error("Element addApartmentResponse nie znaleziony");
        return;
    }
    responseEl.textContent = 'Dodawanie mieszkania...';

    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Brak uprawnień.');
        responseEl.textContent = 'Brak autoryzacji.';
        window.location.hash = '#/mieszkania';
        return;
    }

    // Pobieranie i typowanie wartości z formularza
    const name = (document.getElementById('apartmentName') as HTMLInputElement).value;
    const description = (document.getElementById('apartmentDescription') as HTMLTextAreaElement).value;
    const location = (document.getElementById('apartmentLocation') as HTMLInputElement).value;
    const numberOfBedrooms = parseInt((document.getElementById('apartmentBedrooms') as HTMLInputElement).value, 10);
    const numberOfBathrooms = parseInt((document.getElementById('apartmentBathrooms') as HTMLInputElement).value, 10);
    const amenitiesText = (document.getElementById('apartmentAmenities') as HTMLInputElement).value;
    const isAvailable = (document.getElementById('apartmentIsAvailable') as HTMLInputElement).checked;
    const pricePerNight = parseFloat((document.getElementById('apartmentPrice') as HTMLInputElement).value);

    const input: AddApartmentInput = {
        name,
        description,
        location,
        numberOfBedrooms,
        numberOfBathrooms,
        amenities: (amenitiesText || "").split(',').map(a => a.trim()).filter(a => a.length > 0),
        isAvailable,
        pricePerNight
    };

    if (!input.name || !input.description || !input.location || isNaN(input.numberOfBedrooms) || isNaN(input.numberOfBathrooms) || isNaN(input.pricePerNight) || input.pricePerNight < 0) {
        alert('Wypełnij poprawnie wszystkie pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
        responseEl.textContent = 'Błędne dane wejściowe.';
        return;
    }

    const mutation = {
        query: `mutation DodajMieszkanie($input: AddApartmentInput!) { addApartment(input: $input) { id name } }`, // Upewnij się, że typ AddApartmentInput na backendzie pasuje
        variables: { input }
    };

    try {
        const res = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });
        const resData = await res.json() as GraphQLResponse<AddApartmentMutationPayload>;
        responseEl.textContent = JSON.stringify(resData, null, 2);

        if (resData.data?.addApartment?.id) {
            alert('Mieszkanie dodane!');
            const addForm = document.getElementById('addApartmentForm') as HTMLFormElement | null;
            addForm?.reset();
            fetchApartments();
            window.location.hash = '#/mieszkania';
        } else if (resData.errors) {
            alert(`Błąd: ${resData.errors.map(e => e.message).join('; ')}`);
        } else {
            alert('Nieznany błąd dodawania mieszkania.');
        }
    } catch (error: any) {
        responseEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
        console.error(error);
        alert('Błąd sieciowy.');
    }
}

// UWAGA: Parametr apartmentData jest przekazywany jako obiekt przez mechanizm onclick,
// mimo że w HTML jest stringiem JSON. Przeglądarka/JS parsuje go jako literał obiektu.
// Dlatego typujemy go jako Apartment.
export function prepareEditApartmentForm(apartmentData: Apartment): void {
    console.log("Przygotowywanie formularza edycji dla:", apartmentData);
    if (!apartmentData || typeof apartmentData !== 'object' || !apartmentData.databaseId) {
        alert("Błąd: Nieprawidłowe dane mieszkania do edycji lub brak ID.");
        console.error("Invalid apartmentData for edit:", apartmentData);
        return;
    }

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

    showSection('editApartmentSection');
}

export function cancelEditApartment(): void {
    const editForm = document.getElementById('editApartmentForm') as HTMLFormElement | null;
    if (editForm) editForm.reset();
    const editApartmentIdEl = document.getElementById('editApartmentId') as HTMLInputElement | null;
    if (editApartmentIdEl) editApartmentIdEl.value = '';

    if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
        handleRouteChange();
    } else {
        window.location.hash = '#/mieszkania';
    }
}

export async function submitUpdateApartment(): Promise<void> {
    console.log("submitUpdateApartment function CALLED");
    const responseEl = document.getElementById('editApartmentResponse') as HTMLPreElement | null;
    if (!responseEl) { console.error("Brakuje elementu editApartmentResponse"); return; }
    responseEl.textContent = 'Aktualizowanie mieszkania...';

    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Brak uprawnień do aktualizacji mieszkania.');
        responseEl.textContent = 'Brak autoryzacji.';
        return;
    }

    const apartmentId = (document.getElementById('editApartmentId') as HTMLInputElement).value;
    if (!apartmentId) {
        alert('Błąd: ID mieszkania do aktualizacji nie zostało znalezione.');
        responseEl.textContent = 'Błąd: Brak ID mieszkania.';
        return;
    }

    const name = (document.getElementById('editApartmentName') as HTMLInputElement).value;
    const description = (document.getElementById('editApartmentDescription') as HTMLTextAreaElement).value;
    const location = (document.getElementById('editApartmentLocation') as HTMLInputElement).value;
    const numberOfBedrooms = parseInt((document.getElementById('editApartmentBedrooms') as HTMLInputElement).value, 10);
    const numberOfBathrooms = parseInt((document.getElementById('editApartmentBathrooms') as HTMLInputElement).value, 10);
    const amenitiesText = (document.getElementById('editApartmentAmenities') as HTMLInputElement).value;
    const isAvailable = (document.getElementById('editApartmentIsAvailable') as HTMLInputElement).checked;
    const pricePerNight = parseFloat((document.getElementById('editApartmentPrice') as HTMLInputElement).value);


    const input: UpdateApartmentInput = {
        id: apartmentId,
        name: (document.getElementById('editApartmentName') as HTMLInputElement).value,
        description: (document.getElementById('editApartmentDescription') as HTMLTextAreaElement).value,
        location: (document.getElementById('editApartmentLocation') as HTMLInputElement).value,
        numberOfBedrooms: parseInt((document.getElementById('editApartmentBedrooms') as HTMLInputElement).value, 10),
        numberOfBathrooms: parseInt((document.getElementById('editApartmentBathrooms') as HTMLInputElement).value, 10),
        amenities: ((document.getElementById('editApartmentAmenities') as HTMLInputElement).value || "").split(',').map(a => a.trim()).filter(a => a.length > 0),
        isAvailable: (document.getElementById('editApartmentIsAvailable') as HTMLInputElement).checked,
        pricePerNight: parseFloat((document.getElementById('editApartmentPrice') as HTMLInputElement).value)
    };

    if (
        !input.name || // name jest string | undefined; !undefined jest true
        !input.description ||
        !input.location ||
        (typeof input.numberOfBedrooms === 'undefined' || isNaN(input.numberOfBedrooms)) ||
        (typeof input.numberOfBathrooms === 'undefined' || isNaN(input.numberOfBathrooms)) ||
        (typeof input.pricePerNight === 'undefined' || isNaN(input.pricePerNight) || input.pricePerNight < 0)
        // Dla pricePerNight < 0: jeśli pricePerNight jest undefined, pierwszy warunek (typeof) będzie true,
        // a dzięki short-circuiting (||), reszta (w tym input.pricePerNight < 0) nie zostanie wykonana dla undefined.
    ) {
        alert('Wypełnij poprawnie wszystkie wymagane pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
        if (responseEl) responseEl.textContent = 'Błędne dane wejściowe.'; // Upewnij się, że responseEl jest sprawdzany
        return;
    }

    const mutation = {
        query: `
            mutation AktualizujMieszkanie($input: UpdateApartmentInput!) {
              updateApartment(input: $input) {
                id name description location numberOfBedrooms numberOfBathrooms amenities isAvailable pricePerNight # Upewnij się, że backend zwraca te pola (zgodne z typem Apartment)
              }
            }
        `,
        variables: { input } // Upewnij się, że typ UpdateApartmentInput na backendzie pasuje
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
            const editForm = document.getElementById('editApartmentForm') as HTMLFormElement | null;
            editForm?.reset();
            const editApartmentIdEl = document.getElementById('editApartmentId') as HTMLInputElement | null;
            if (editApartmentIdEl) editApartmentIdEl.value = '';

            if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
                handleRouteChange();
            } else {
                window.location.hash = '#/mieszkania';
            }
        } else if (resData.errors) {
            const errorMsg = resData.errors.map(e => e.message).join('; ');
            alert(`Błąd aktualizacji mieszkania: ${errorMsg}`);
        } else {
            alert('Nie udało się zaktualizować mieszkania. Nieznany błąd odpowiedzi serwera.');
        }
    } catch (error: any) {
        if (responseEl) responseEl.textContent = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
        console.error('Błąd sieciowy (submitUpdateApartment):', error);
        alert('Wystąpił błąd sieciowy podczas aktualizacji mieszkania.');
    }
}

export function confirmDeleteApartment(apartmentDbId: string, apartmentName: string): void {
    if (confirm(`Czy na pewno chcesz usunąć mieszkanie "${apartmentName}" (ID: ${apartmentDbId})?`)) {
        deleteApartment(apartmentDbId);
    }
}

export async function deleteApartment(apartmentDbId: string): Promise<void> {
    console.log("deleteApartment CALLED for ID:", apartmentDbId);
    const currentJwtToken = getJwtToken();
    const currentUserRole = getUserRole();

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Brak uprawnień.');
        return;
    }
    if (!apartmentDbId) {
        alert('Brak ID.');
        return;
    }

    const mutation = {
        query: `mutation UsunMieszkanie($id: UUID!) { deleteApartment(id: $id) }`, // Upewnij się, że $id to UUID na backendzie
        variables: { id: apartmentDbId }
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
            body: JSON.stringify(mutation)
        });

        let resData: GraphQLResponse<DeleteApartmentMutationPayload>;
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType && contentType.includes("application/json")) {
            resData = await response.json() as GraphQLResponse<DeleteApartmentMutationPayload>;
        } else if (response.ok) {
            const text = await response.text();
            if (text.trim().toLowerCase() === "true" || response.status === 204 || text.trim() === "") {
                // Symulujemy poprawną odpowiedź, jeśli backend zwraca true lub jest pusty (204)
                resData = { data: { deleteApartment: true } };
            } else {
                // Próba sparsowania jako JSON, jeśli Content-Type był zły, ale ciało mogło być JSON
                try {
                    const parsedText = JSON.parse(text);
                    // Jeśli to obiekt z polem 'errors', traktujemy jako błąd GraphQL
                    if (parsedText && Array.isArray(parsedText.errors)) {
                        resData = parsedText as GraphQLResponse<DeleteApartmentMutationPayload>;
                    } else {
                        // Inaczej, to nieoczekiwana odpowiedź
                        resData = { errors: [{ message: `Niespodziewana odpowiedź serwera (status ${response.status}): ${text}` }] };
                    }
                } catch (e) {
                    resData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa serwera (status ${response.status}): ${text}` }] };
                }
            }
        } else {
            // Błąd HTTP
            const errorText = await response.text();
            try {
                resData = JSON.parse(errorText) as GraphQLResponse<DeleteApartmentMutationPayload>;
                if (!resData.errors) { // Jeśli sparsowano, ale nie ma pola errors
                    resData = { errors: [{ message: `Błąd serwera (status ${response.status}): ${errorText}` }] };
                }
            } catch (e) {
                resData = { errors: [{ message: `Błąd serwera (status ${response.status}): ${errorText}` }] };
            }
        }


        if (resData.data?.deleteApartment === true) {
            alert('Mieszkanie usunięte!');
            fetchApartments();
        } else if (resData.errors) {
            alert(`Błąd usuwania: ${resData.errors.map(e => e.message).join('; ')}`);
        } else {
            alert('Nie udało się usunąć mieszkania lub serwer zwrócił nieoczekiwane dane.');
        }
    } catch (error: any) {
        console.error('Delete apartment error:', error);
        alert(`Błąd sieciowy: ${error instanceof Error ? error.message : String(error)}`);
    }
}