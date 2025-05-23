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
import { showSection } from './uiService.js';
import { handleRouteChange } from './router.js';
import { calculateTotalPrice } from './bookingService.js';
let currentApartmentsPageInfo = null;
const APARTMENTS_PER_PAGE = 10;
let currentApartmentPageNumber = 1;
export function fetchApartmentsForSelect() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("[INFO] fetchApartmentsForSelect function CALLED");
        const localReviewApartmentSelectEl = document.getElementById('reviewApartmentSelect');
        const localBookingApartmentSelectEl = document.getElementById('bookingApartmentSelect');
        const selectsToPopulate = [localReviewApartmentSelectEl, localBookingApartmentSelectEl]
            .filter((el) => el !== null);
        if (selectsToPopulate.length === 0)
            return;
        selectsToPopulate.forEach(selectEl => {
            selectEl.innerHTML = '<option value="">Ładowanie mieszkań...</option>';
        });
        const graphqlQuery = { query: `query PobierzMieszkaniaDlaSelect { apartments(first: 49) { nodes { databaseId name pricePerNight } } }` };
        try {
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphqlQuery)
            });
            const responseData = yield response.json();
            const populateSelect = (selectEl, apartments) => {
                selectEl.innerHTML = '<option value="">-- Wybierz mieszkanie --</option>';
                if (apartments && apartments.length > 0) {
                    apartments.forEach((apt) => {
                        const option = document.createElement('option');
                        option.value = apt.databaseId;
                        option.textContent = `${apt.name} (${apt.pricePerNight !== null ? apt.pricePerNight.toFixed(2) + ' PLN/noc' : 'Cena nieznana'})`;
                        if (apt.pricePerNight !== null) {
                            option.dataset.pricePerNight = apt.pricePerNight.toString();
                        }
                        selectEl.appendChild(option);
                    });
                }
                else {
                    selectEl.innerHTML = '<option value="">Brak mieszkań do wyboru</option>';
                }
            };
            if ((_b = (_a = responseData.data) === null || _a === void 0 ? void 0 : _a.apartments) === null || _b === void 0 ? void 0 : _b.nodes) {
                selectsToPopulate.forEach(selectEl => populateSelect(selectEl, responseData.data.apartments.nodes));
                const bookingSelect = document.getElementById('bookingApartmentSelect');
                if (bookingSelect === null || bookingSelect === void 0 ? void 0 : bookingSelect.value) {
                    calculateTotalPrice();
                }
            }
            else {
                const errorMsg = ((_c = responseData.errors) === null || _c === void 0 ? void 0 : _c.map(e => e.message).join(', ')) || "No data or unexpected error structure";
                selectsToPopulate.forEach(selectEl => {
                    selectEl.innerHTML = '<option value="">Nie załadowano mieszkań</option>';
                });
                console.error("[ERROR] Error fetching apartments for select:", errorMsg, responseData.errors);
            }
        }
        catch (error) {
            console.error('[ERROR] Fetch apartments for select error:', error);
            selectsToPopulate.forEach(selectEl => {
                selectEl.innerHTML = '<option value="">Błąd ładowania</option>';
            });
        }
    });
}
export function fetchApartments() {
    return __awaiter(this, arguments, void 0, function* (direction = 'first', cursor) {
        var _a, _b;
        if (direction === 'first') {
            currentApartmentPageNumber = 1;
        }
        else if (direction === 'next' && (currentApartmentsPageInfo === null || currentApartmentsPageInfo === void 0 ? void 0 : currentApartmentsPageInfo.hasNextPage)) {
            currentApartmentPageNumber++;
        }
        else if (direction === 'previous' && (currentApartmentsPageInfo === null || currentApartmentsPageInfo === void 0 ? void 0 : currentApartmentsPageInfo.hasPreviousPage)) {
            currentApartmentPageNumber--;
            if (currentApartmentPageNumber < 1)
                currentApartmentPageNumber = 1;
        }
        console.log(`[INFO] fetchApartments function CALLED - Page: ${currentApartmentPageNumber}, Direction: ${direction}, Cursor: ${cursor}`);
        const rawEl = document.getElementById('apartmentsResponseRaw');
        const listEl = document.getElementById('apartmentsListFormatted');
        const paginationControlsEl = document.getElementById('apartmentsPaginationControls');
        const currentUserRole = getUserRole();
        if (!rawEl || !listEl || !paginationControlsEl) {
            console.error("[ERROR] fetchApartments: Brakuje elementów DOM: apartmentsResponseRaw, apartmentsListFormatted lub apartmentsPaginationControls.");
            if (listEl)
                listEl.innerHTML = '<p style="color:red; text-align:center;">Błąd wewnętrzny strony.</p>';
            return;
        }
        rawEl.textContent = 'Pobieranie mieszkań...';
        listEl.innerHTML = '<p style="text-align:center;">Ładowanie listy mieszkań...</p>';
        paginationControlsEl.innerHTML = '';
        let gqlVariables = {
            first: undefined, after: null, last: undefined, before: null
        };
        if (direction === 'next' && cursor) {
            gqlVariables = { first: APARTMENTS_PER_PAGE, after: cursor, last: undefined, before: null };
        }
        else if (direction === 'previous' && cursor) {
            gqlVariables = { last: APARTMENTS_PER_PAGE, before: cursor, first: undefined, after: null };
        }
        else {
            gqlVariables = { first: APARTMENTS_PER_PAGE, after: null, last: undefined, before: null };
        }
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
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphqlQuery)
            });
            const responseData = yield response.json().catch(e => {
                console.error("[ERROR] Błąd parsowania JSON w fetchApartments:", e);
                return { errors: [{ message: "Odpowiedź serwera nie jest poprawnym formatem JSON." }] };
            });
            if (rawEl)
                rawEl.textContent = JSON.stringify(responseData, null, 2);
            if (response.ok && ((_a = responseData.data) === null || _a === void 0 ? void 0 : _a.apartments)) {
                const connection = responseData.data.apartments;
                const apartments = connection.nodes || ((_b = connection.edges) === null || _b === void 0 ? void 0 : _b.map(edge => edge.node)) || [];
                currentApartmentsPageInfo = connection.pageInfo;
                if (connection.totalCount === 0 || (apartments.length === 0 && direction === 'first')) {
                    listEl.innerHTML = '<p style="text-align:center;">Nie znaleziono żadnych mieszkań w systemie.</p>';
                }
                else if (apartments.length === 0 && (direction === 'next' || direction === 'previous')) {
                    if (!listEl.innerHTML.includes("Nie znaleziono żadnych mieszkań w systemie.")) {
                        listEl.innerHTML += '<p style="text-align:center; color: orange;">Brak więcej mieszkań w tym kierunku.</p>';
                    }
                }
                else {
                    let html = `<h4 style="text-align:center;">Znaleziono mieszkań: ${connection.totalCount} (Wyświetlono na tej stronie: ${apartments.length})</h4>`;
                    html += '<div class="apartment-list-container" style="display: flex; flex-direction: column; gap: 15px;">';
                    apartments.forEach((apt) => {
                        var _a, _b, _c;
                        const apartmentDataString = JSON.stringify(apt).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                        html += `
                        <div class="data-card apartment-card" id="apartment-card-${apt.databaseId}">
                            <h4>${apt.name || '<em>Nazwa nieznana</em>'}</h4>
                            <p><strong>ID (Baza):</strong> ${apt.databaseId || '<em>N/A</em>'}</p>
                            <p><strong>Lokalizacja:</strong> ${apt.location || '<em>Brak</em>'}</p>
                            <p><strong>Cena/noc:</strong> ${typeof apt.pricePerNight === 'number' ? apt.pricePerNight.toFixed(2) : '<em>N/A</em>'} PLN</p>
                            <p><strong>Dostępne:</strong> ${apt.isAvailable ? 'Tak' : 'Nie'}</p>
                            <p><strong>Opis:</strong> ${apt.description ? (apt.description.substring(0, 100) + (apt.description.length > 100 ? '...' : '')) : '<em>Brak</em>'}</p>
                            <p><strong>Sypialnie:</strong> ${(_a = apt.numberOfBedrooms) !== null && _a !== void 0 ? _a : '<em>N/A</em>'}, <strong>Łazienki:</strong> ${(_b = apt.numberOfBathrooms) !== null && _b !== void 0 ? _b : '<em>N/A</em>'}</p>
                            <p><strong>Udogodnienia:</strong> ${(apt.amenities && apt.amenities.length > 0) ? apt.amenities.join(', ') : '<em>Brak</em>'}</p>`;
                        if (currentUserRole === 'Admin' && apt.databaseId) {
                            const apartmentNameForJsSafe = String(apt.name || 'Mieszkanie').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            const apartmentIdForJsSafe = String(apt.databaseId).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            html += `<div class="admin-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">`;
                            html += `<button onclick='prepareEditApartmentForm(${apartmentDataString})' class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #3498db; color:white; border:none; border-radius:3px; cursor:pointer;">Edytuj</button>`;
                            html += `<button onclick="confirmDeleteApartment('${apartmentIdForJsSafe}', '${apartmentNameForJsSafe}')" class="action-button-secondary" style="font-size:0.85em; padding:4px 8px; background-color: #e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń</button>`;
                            html += `</div>`;
                        }
                        if (((_c = apt.reviews) === null || _c === void 0 ? void 0 : _c.nodes) && apt.reviews.nodes.length > 0) {
                            html += `<div class="reviews-list" style="margin-top:10px;"><h5>Recenzje (${apt.reviews.totalCount}):</h5>`;
                            apt.reviews.nodes.forEach((review) => {
                                var _a;
                                const reviewIdForActions = review.id;
                                const reviewDisplayId = review.id.replace(/[^a-zA-Z0-9_-]/g, "");
                                html += `<div class="review-item" id="review-item-${reviewDisplayId}"><p><strong>Ocena:</strong> ${review.rating}/5</p><p><em>"${review.comment || 'Brak komentarza'}"</em></p><p><small>- ${((_a = review.user) === null || _a === void 0 ? void 0 : _a.name) || 'Anonim'}</small></p>`;
                                if (currentUserRole === 'Admin' && reviewIdForActions) {
                                    const reviewIdForJsSafe = String(reviewIdForActions).replace(/'/g, "\\'").replace(/"/g, "&quot;");
                                    const commentSnippetSafe = (review.comment || "Recenzja").substring(0, 20).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                                    html += `<button onclick="confirmDeleteReview('${reviewIdForJsSafe}', '${commentSnippetSafe}')" class="action-button-secondary" style="font-size:0.8em; padding:3px 6px; background-color: #f39c12; color:white; border:none; border-radius:3px; cursor:pointer;">Usuń recenzję</button>`;
                                }
                                html += `</div>`;
                            });
                            html += `</div>`;
                        }
                        else {
                            html += `<p><small>Brak recenzji.</small></p>`;
                        }
                        html += `</div>`;
                    });
                    html += '</div>';
                    listEl.innerHTML = html;
                }
                renderPaginationControls(paginationControlsEl, currentApartmentsPageInfo, connection.totalCount);
            }
            else if (responseData.errors) {
                const errorMessages = responseData.errors.map(err => { var _a; return `${err.message} (Path: ${((_a = err.path) === null || _a === void 0 ? void 0 : _a.join(' > ')) || 'N/A'})`; }).join('<br>');
                if (listEl)
                    listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd pobierania mieszkań:<br>${errorMessages}</p>`;
                console.error("[ERROR] GraphQL errors (fetchApartments):", responseData.errors);
            }
            else {
                if (listEl)
                    listEl.innerHTML = `<p style="color:orange; text-align:center;">Brak danych mieszkań w odpowiedzi lub błąd serwera (Status: ${response.status}).</p>`;
                console.warn("[WARN] Nie znaleziono danych mieszkań (fetchApartments):", responseData, "Status HTTP:", response.status);
            }
        }
        catch (error) {
            console.error('[ERROR] Błąd sieciowy w fetchApartments:', error);
            if (rawEl)
                rawEl.textContent = 'Błąd: ' + (error instanceof Error ? error.message : String(error));
            if (listEl)
                listEl.innerHTML = `<p style="color:red; text-align:center;">Błąd sieciowy podczas pobierania mieszkań: ${error instanceof Error ? error.message : String(error)}</p>`;
        }
    });
}
function renderPaginationControls(container, pageInfo, totalCount) {
    if (!pageInfo || !container) {
        if (container)
            container.innerHTML = "";
        return;
    }
    let paginationHtml = `<div style="margin-top: 20px; text-align: center; padding-bottom: 20px;">`;
    paginationHtml += `<button id="apartmentsPrevPageBtn" class="action-button-secondary" style="margin-right: 10px;" ${!pageInfo.hasPreviousPage ? 'disabled' : ''}>Poprzednia</button>`;
    const totalPagesEst = Math.ceil(totalCount / APARTMENTS_PER_PAGE);
    paginationHtml += `<span style="margin: 0 10px;"> Strona ${currentApartmentPageNumber} z ${totalPagesEst > 0 ? totalPagesEst : 1} (Łącznie: ${totalCount}) </span>`;
    paginationHtml += `<button id="apartmentsNextPageBtn" class="action-button-secondary" style="margin-left: 10px;" ${!pageInfo.hasNextPage ? 'disabled' : ''}>Następna</button>`;
    paginationHtml += `</div>`;
    container.innerHTML = paginationHtml;
    const prevBtn = document.getElementById('apartmentsPrevPageBtn');
    if (prevBtn && pageInfo.hasPreviousPage) {
        prevBtn.onclick = () => {
            if ((currentApartmentsPageInfo === null || currentApartmentsPageInfo === void 0 ? void 0 : currentApartmentsPageInfo.hasPreviousPage) && currentApartmentsPageInfo.startCursor) {
                fetchApartments('previous', currentApartmentsPageInfo.startCursor);
            }
        };
    }
    const nextBtn = document.getElementById('apartmentsNextPageBtn');
    if (nextBtn && pageInfo.hasNextPage) {
        nextBtn.onclick = () => {
            if ((currentApartmentsPageInfo === null || currentApartmentsPageInfo === void 0 ? void 0 : currentApartmentsPageInfo.hasNextPage) && currentApartmentsPageInfo.endCursor) {
                fetchApartments('next', currentApartmentsPageInfo.endCursor);
            }
        };
    }
}
export function submitNewApartment() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("[INFO] submitNewApartment function CALLED");
        const responseEl = document.getElementById('addApartmentResponse');
        if (!responseEl) {
            console.error("[ERROR] Element addApartmentResponse nie znaleziony");
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
        const name = document.getElementById('apartmentName').value;
        const description = document.getElementById('apartmentDescription').value;
        const location = document.getElementById('apartmentLocation').value;
        const numberOfBedrooms = parseInt(document.getElementById('apartmentBedrooms').value, 10);
        const numberOfBathrooms = parseInt(document.getElementById('apartmentBathrooms').value, 10);
        const amenitiesText = document.getElementById('apartmentAmenities').value;
        const isAvailable = document.getElementById('apartmentIsAvailable').checked;
        const pricePerNight = parseFloat(document.getElementById('apartmentPrice').value);
        const input = {
            name, description, location, numberOfBedrooms, numberOfBathrooms,
            amenities: (amenitiesText || "").split(',').map(a => a.trim()).filter(a => a.length > 0),
            isAvailable, pricePerNight
        };
        if (!input.name || !input.description || !input.location ||
            isNaN(input.numberOfBedrooms) || isNaN(input.numberOfBathrooms) ||
            isNaN(input.pricePerNight) || input.pricePerNight < 0) {
            alert('Wypełnij poprawnie wszystkie pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
            responseEl.textContent = 'Błędne dane wejściowe.';
            return;
        }
        const mutation = {
            query: `mutation DodajMieszkanie($input: AddApartmentInput!) { addApartment(input: $input) { id name } }`,
            variables: { input }
        };
        console.log("[INFO] Wysyłanie mutacji (submitNewApartment):", JSON.stringify(mutation, null, 2));
        try {
            const res = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(mutation)
            });
            const resData = yield res.json();
            if (responseEl)
                responseEl.textContent = JSON.stringify(resData, null, 2);
            if ((_b = (_a = resData.data) === null || _a === void 0 ? void 0 : _a.addApartment) === null || _b === void 0 ? void 0 : _b.id) {
                alert('Mieszkanie dodane pomyślnie!');
                (_c = document.getElementById('addApartmentForm')) === null || _c === void 0 ? void 0 : _c.reset();
                yield fetchApartments('first');
                yield fetchApartmentsForSelect();
                window.location.hash = '#/mieszkania';
            }
            else if (resData.errors) {
                alert(`Błąd GraphQL: ${resData.errors.map(e => e.message).join('; ')}`);
            }
            else {
                alert('Nieznany błąd podczas dodawania mieszkania.');
            }
        }
        catch (error) {
            if (responseEl)
                responseEl.textContent = 'Błąd sieciowy: ' + (error instanceof Error ? error.message : String(error));
            console.error("[ERROR]", error);
            alert('Wystąpił błąd sieciowy.');
        }
    });
}
export function prepareEditApartmentForm(apartmentData) {
    var _a, _b, _c;
    console.log("[INFO] Przygotowywanie formularza edycji dla:", apartmentData);
    if (!apartmentData || typeof apartmentData !== 'object' || !apartmentData.databaseId) {
        alert("Błąd: Nieprawidłowe dane mieszkania do edycji lub brak ID.");
        console.error("[ERROR] Invalid apartmentData for edit:", apartmentData);
        return;
    }
    document.getElementById('editApartmentId').value = apartmentData.databaseId;
    document.getElementById('editApartmentName').value = apartmentData.name || '';
    document.getElementById('editApartmentDescription').value = apartmentData.description || '';
    document.getElementById('editApartmentLocation').value = apartmentData.location || '';
    document.getElementById('editApartmentBedrooms').value = ((_a = apartmentData.numberOfBedrooms) !== null && _a !== void 0 ? _a : 0).toString();
    document.getElementById('editApartmentBathrooms').value = ((_b = apartmentData.numberOfBathrooms) !== null && _b !== void 0 ? _b : 0).toString();
    document.getElementById('editApartmentAmenities').value = Array.isArray(apartmentData.amenities) ? apartmentData.amenities.join(', ') : (apartmentData.amenities || '');
    document.getElementById('editApartmentIsAvailable').checked = apartmentData.isAvailable || false;
    document.getElementById('editApartmentPrice').value = ((_c = apartmentData.pricePerNight) !== null && _c !== void 0 ? _c : 0).toString();
    const responseEl = document.getElementById('editApartmentResponse');
    if (responseEl)
        responseEl.textContent = 'Wprowadź zmiany i zapisz.';
    showSection('editApartmentSection');
}
export function cancelEditApartment() {
    const editForm = document.getElementById('editApartmentForm');
    if (editForm)
        editForm.reset();
    const editApartmentIdEl = document.getElementById('editApartmentId');
    if (editApartmentIdEl)
        editApartmentIdEl.value = '';
    if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
        handleRouteChange();
    }
    else {
        window.location.hash = '#/mieszkania';
    }
}
export function submitUpdateApartment() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("[INFO] submitUpdateApartment function CALLED");
        const responseEl = document.getElementById('editApartmentResponse');
        if (!responseEl) {
            console.error("[ERROR] Brakuje elementu editApartmentResponse");
            return;
        }
        responseEl.textContent = 'Aktualizowanie mieszkania...';
        const currentJwtToken = getJwtToken();
        const currentUserRole = getUserRole();
        if (!currentJwtToken || currentUserRole !== 'Admin') {
            alert('Brak uprawnień...');
            responseEl.textContent = 'Brak autoryzacji.';
            return;
        }
        const apartmentId = document.getElementById('editApartmentId').value;
        if (!apartmentId) {
            alert('Błąd: Brak ID mieszkania.');
            responseEl.textContent = 'Błąd: Brak ID mieszkania.';
            return;
        }
        const input = {
            id: apartmentId,
            name: document.getElementById('editApartmentName').value,
            description: document.getElementById('editApartmentDescription').value,
            location: document.getElementById('editApartmentLocation').value,
            numberOfBedrooms: parseInt(document.getElementById('editApartmentBedrooms').value, 10),
            numberOfBathrooms: parseInt(document.getElementById('editApartmentBathrooms').value, 10),
            amenities: (document.getElementById('editApartmentAmenities').value || "").split(',').map(a => a.trim()).filter(a => a.length > 0),
            isAvailable: document.getElementById('editApartmentIsAvailable').checked,
            pricePerNight: parseFloat(document.getElementById('editApartmentPrice').value)
        };
        if ((input.name !== undefined && !input.name) ||
            (input.description !== undefined && !input.description) ||
            (input.location !== undefined && !input.location) ||
            (typeof input.numberOfBedrooms !== 'undefined' && isNaN(input.numberOfBedrooms)) ||
            (typeof input.numberOfBathrooms !== 'undefined' && isNaN(input.numberOfBathrooms)) ||
            (typeof input.pricePerNight !== 'undefined' && (isNaN(input.pricePerNight) || input.pricePerNight < 0))) {
            alert('Wypełnij poprawnie wszystkie zmieniane pola. Pola numeryczne muszą być liczbami, a cena nie może być ujemna.');
            if (responseEl)
                responseEl.textContent = 'Błędne dane wejściowe.';
            return;
        }
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
            const res = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(mutation)
            });
            const resData = yield res.json();
            if (responseEl)
                responseEl.textContent = JSON.stringify(resData, null, 2);
            if ((_a = resData.data) === null || _a === void 0 ? void 0 : _a.updateApartment) {
                alert('Mieszkanie zaktualizowane pomyślnie!');
                (_b = document.getElementById('editApartmentForm')) === null || _b === void 0 ? void 0 : _b.reset();
                const editApartmentIdEl = document.getElementById('editApartmentId');
                if (editApartmentIdEl)
                    editApartmentIdEl.value = '';
                if (window.location.hash === '#/mieszkania' || window.location.hash === '#mieszkania') {
                    handleRouteChange();
                }
                else {
                    window.location.hash = '#/mieszkania';
                }
            }
            else if (resData.errors) {
                alert(`Błąd aktualizacji mieszkania: ${resData.errors.map(e => e.message).join('; ')}`);
            }
            else {
                alert('Nie udało się zaktualizować mieszkania.');
            }
        }
        catch (error) {
            if (responseEl)
                responseEl.textContent = 'Błąd sieci lub serwera: ' + (error instanceof Error ? error.message : String(error));
            console.error('[ERROR] Błąd sieciowy (submitUpdateApartment):', error);
            alert('Wystąpił błąd sieciowy.');
        }
    });
}
export function confirmDeleteApartment(apartmentDbId, apartmentName) {
    if (confirm(`Czy na pewno chcesz usunąć mieszkanie "${apartmentName}" (ID: ${apartmentDbId})?`)) {
        deleteApartment(apartmentDbId);
    }
}
export function deleteApartment(apartmentDbId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("[INFO] deleteApartment CALLED for ID:", apartmentDbId);
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
            query: `mutation UsunMieszkanie($id: UUID!) { deleteApartment(id: $id) }`,
            variables: { id: apartmentDbId }
        };
        let resData = null;
        try {
            const response = yield fetch(`${backendAppUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentJwtToken}` },
                body: JSON.stringify(mutation)
            });
            const responseText = yield response.text();
            if (response.ok) {
                try {
                    const parsedJson = JSON.parse(responseText);
                    if (parsedJson.data && typeof parsedJson.data.deleteApartment === 'boolean') {
                        resData = { data: { deleteApartment: parsedJson.data.deleteApartment } };
                    }
                    else if (parsedJson.errors && Array.isArray(parsedJson.errors)) {
                        resData = { errors: parsedJson.errors };
                    }
                    else {
                        console.warn("[WARN] Poprawnie sparsowano JSON, ale struktura nie jest oczekiwanym payloadem GraphQL (deleteApartment):", responseText);
                        resData = { errors: [{ message: `Nieoczekiwana struktura danych JSON od serwera (status ${response.status}): ${responseText}` }] };
                    }
                }
                catch (e) {
                    if (responseText.trim().toLowerCase() === "true" || response.status === 204 || responseText.trim() === "") {
                        resData = { data: { deleteApartment: true } };
                    }
                    else {
                        console.error("[ERROR]", e, "Błąd parsowania odpowiedzi jako JSON, a odpowiedź nie jest 'true' ani pusta (deleteApartment):", responseText);
                        resData = { errors: [{ message: `Niespodziewana odpowiedź tekstowa serwera (status ${response.status}): ${responseText}` }] };
                    }
                }
            }
            else {
                console.error("[ERROR] Błąd HTTP w deleteApartment. Status:", response.status, "Odpowiedź:", responseText);
                try {
                    const parsedError = JSON.parse(responseText);
                    if (parsedError && Array.isArray(parsedError.errors)) {
                        resData = { errors: parsedError.errors };
                    }
                    else {
                        resData = { errors: [{ message: `Błąd serwera (status ${response.status}): ${responseText}` }] };
                    }
                }
                catch (e) {
                    resData = { errors: [{ message: `Błąd serwera (status ${response.status}), odpowiedź nie jest JSON: ${responseText}` }] };
                }
            }
            if (((_a = resData === null || resData === void 0 ? void 0 : resData.data) === null || _a === void 0 ? void 0 : _a.deleteApartment) === true) {
                alert('Mieszkanie usunięte pomyślnie!');
                console.log("[INFO] Delete successful, fetching apartments...");
                yield fetchApartments('first');
            }
            else if ((resData === null || resData === void 0 ? void 0 : resData.errors) && resData.errors.length > 0) {
                const errorMessages = resData.errors.map(e => e.message).join('; ');
                alert(`Błąd usuwania: ${errorMessages}`);
                console.error("[ERROR] GraphQL errors/Frontend processing error (deleteApartment):", JSON.parse(JSON.stringify(resData.errors)));
            }
            else {
                alert('Nie udało się usunąć mieszkania lub serwer zwrócił nieoczekiwane/puste dane.');
                console.warn("[WARN] Unexpected response or no data in deleteApartment:", JSON.stringify(resData, null, 2));
            }
        }
        catch (error) {
            console.error('[ERROR] Delete apartment network error:', error);
            alert(`Błąd sieciowy: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
//# sourceMappingURL=apartmentService.js.map