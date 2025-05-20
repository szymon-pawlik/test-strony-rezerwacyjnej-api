let currentJwtToken = null;
let currentUserRole = null;
const backendAppUrl = 'http://localhost:5235';

const loginStatusEl = document.getElementById('loginStatus');
const userRoleDisplayEl = document.getElementById('userRoleDisplay');
const addReviewSectionEl = document.getElementById('addReviewSection');
const myProfileSectionEl = document.getElementById('myProfileSection');
const logoutButtonEl = document.getElementById('logoutButton');
const loginButtonEl = document.getElementById('loginButton');
const registerSectionEl = document.getElementById('registerSection');
const loginSectionContainerEl = document.getElementById('loginSectionContainer');
const reviewApartmentSelectEl = document.getElementById('reviewApartmentSelect');
const addApartmentSectionEl = document.getElementById('addApartmentSection');

function parseJwt(token) {
    if (!token) { return null; }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT token:", e);
        localStorage.removeItem('jwtToken');
        return null;
    }
}

function updateLoginState(isLoggedIn) {
    if (!loginStatusEl || !addReviewSectionEl || !myProfileSectionEl || !logoutButtonEl || !loginButtonEl || !registerSectionEl || !loginSectionContainerEl || !addApartmentSectionEl || !userRoleDisplayEl) {
        console.error("Niektóre elementy UI do aktualizacji stanu logowania nie zostały znalezione! Sprawdź wszystkie ID w HTML i JavaScript.");
        return;
    }

    if (isLoggedIn && currentUserRole) {
        loginStatusEl.textContent = 'Zalogowany';
        userRoleDisplayEl.textContent = currentUserRole;
        addReviewSectionEl.classList.remove('hidden-section');
        myProfileSectionEl.classList.remove('hidden-section');
        logoutButtonEl.classList.remove('hidden-section');
        loginSectionContainerEl.classList.add('hidden-section');
        registerSectionEl.classList.add('hidden-section');

        if (currentUserRole === 'Admin') {
            addApartmentSectionEl.classList.remove('hidden-section');
        } else {
            addApartmentSectionEl.classList.add('hidden-section');
        }
        fetchApartmentsForSelect();
    } else {
        loginStatusEl.textContent = 'Niezalogowany';
        userRoleDisplayEl.textContent = '-';
        addReviewSectionEl.classList.add('hidden-section');
        myProfileSectionEl.classList.add('hidden-section');
        logoutButtonEl.classList.add('hidden-section');
        addApartmentSectionEl.classList.add('hidden-section');
        loginSectionContainerEl.classList.remove('hidden-section');
        registerSectionEl.classList.remove('hidden-section');

        const myProfileFormattedEl = document.getElementById('myProfileFormatted');
        if(myProfileFormattedEl) myProfileFormattedEl.innerHTML = '';

        const myProfileResponseRawEl = document.getElementById('myProfileResponseRaw');
        if(myProfileResponseRawEl) myProfileResponseRawEl.textContent = 'Tutaj pojawi się surowy profil użytkownika...';

        const addReviewResponseEl = document.getElementById('addReviewResponse');
        if(addReviewResponseEl) addReviewResponseEl.textContent = 'Tutaj pojawi się odpowiedź dodawania recenzji...';

        const loginResponseRawEl = document.getElementById('loginResponseRaw');
        if(loginResponseRawEl) loginResponseRawEl.textContent = 'Tutaj pojawi się surowa odpowiedź logowania...';

        if (reviewApartmentSelectEl) {
            reviewApartmentSelectEl.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        }
    }
}

async function loginUser() {
    console.log("loginUser function CALLED");
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginResponseRawEl = document.getElementById('loginResponseRaw');

    if (!loginResponseRawEl) {
        console.error("Element loginResponseRaw nie znaleziony!");
        return;
    }

    loginResponseRawEl.textContent = 'Logowanie...';
    currentJwtToken = null;
    currentUserRole = null;
    localStorage.removeItem('jwtToken');

    try {
        const response = await fetch(`${backendAppUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const responseData = await response.json();
            loginResponseRawEl.textContent = JSON.stringify(responseData, null, 2);
            if (responseData.token) {
                currentJwtToken = responseData.token;
                localStorage.setItem('jwtToken', currentJwtToken);
                const decodedToken = parseJwt(currentJwtToken);
                if (decodedToken) {
                    currentUserRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role || 'User';
                    if (Array.isArray(currentUserRole) && currentUserRole.length > 0) {
                        currentUserRole = currentUserRole[0];
                    }
                } else {
                    currentUserRole = 'User';
                    console.warn("Nie udało się zdekodować tokenu lub brak claimu roli. Ustawiono domyślną rolę 'User'.");
                }
                updateLoginState(true);
            } else {
                loginResponseRawEl.textContent += '\nBłąd logowania lub brak tokenu.';
                updateLoginState(false);
            }
        } else {
            let errorMessage = `Błąd logowania. Status: ${response.status}`;
            try {
                const errorBody = await response.text();
                if (errorBody) {
                    try {
                        const errorJson = JSON.parse(errorBody);
                        if (errorJson.message) errorMessage += `: ${errorJson.message}`;
                        else if (errorJson.Message) errorMessage += `: ${errorJson.Message}`;
                        else errorMessage += `. Odpowiedź serwera: ${errorBody}`;
                    } catch (e) {
                        errorMessage += `. Odpowiedź serwera: ${errorBody}`;
                    }
                }
            } catch (e) { console.error("Could not read error response body", e); }
            loginResponseRawEl.textContent = errorMessage;
            updateLoginState(false);
            console.error('Login error, status:', response.status);
        }
    } catch (error) {
        loginResponseRawEl.textContent = 'Błąd sieci lub serwera: ' + error.message;
        updateLoginState(false);
        console.error('Login fetch/network error:', error);
    }
}

function logoutUser() {
    console.log("logoutUser function CALLED");
    currentJwtToken = null;
    currentUserRole = null;
    localStorage.removeItem('jwtToken');
    updateLoginState(false);
    const loginResponseRawEl = document.getElementById('loginResponseRaw');
    if (loginResponseRawEl) {
        loginResponseRawEl.textContent = 'Wylogowano. Strona zostanie odświeżona...';
    }
    setTimeout(() => {
        location.reload();
    }, 500);
}

function checkLoginOnLoad() {
    console.log("checkLoginOnLoad function CALLED");
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
        const decodedToken = parseJwt(storedToken);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            currentJwtToken = storedToken;
            currentUserRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role || 'User';
            if (Array.isArray(currentUserRole) && currentUserRole.length > 0) {
                currentUserRole = currentUserRole[0];
            }
            updateLoginState(true);
            console.log("User is still logged in from stored token. Role:", currentUserRole);
        } else {
            console.log("Stored token found but it's expired or invalid.");
            localStorage.removeItem('jwtToken');
            updateLoginState(false);
        }
    } else {
        updateLoginState(false);
    }
}

async function submitRegistration() {
    console.log("submitRegistration function CALLED");
    const registerResponseEl = document.getElementById('registerResponse');
    if (!registerResponseEl) {
        console.error("Element registerResponse nie znaleziony!");
        return;
    }
    registerResponseEl.textContent = 'Rejestrowanie...';

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        registerResponseEl.textContent = 'Błąd: Hasła nie pasują do siebie.';
        alert('Błąd: Hasła nie pasują do siebie.');
        return;
    }

    try {
        const response = await fetch(`${backendAppUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        const responseData = await response.json().catch(() => null);

        if (response.status === 201 && responseData) {
            registerResponseEl.textContent = JSON.stringify(responseData, null, 2);
            alert('Rejestracja pomyślna! Możesz się teraz zalogować.');
            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.reset();
        } else {
            let errorMessage = `Błąd rejestracji. Status: ${response.status}`;
            if (responseData && responseData.errors) {
                errorMessage = "Błędy walidacji:\n" + Object.entries(responseData.errors)
                    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
            } else if (responseData && responseData.Message) {
                errorMessage = responseData.Message;
            } else if (responseData && typeof responseData === 'object' && Object.keys(responseData).length > 0) {
                registerResponseEl.textContent = JSON.stringify(responseData, null, 2);
            } else if (!responseData && response.statusText) {
                errorMessage += `: ${response.statusText}`;
                registerResponseEl.textContent = errorMessage;
            }
            else {
                registerResponseEl.textContent = errorMessage;
            }
            alert(errorMessage);
        }
    } catch (error) {
        registerResponseEl.textContent = 'Błąd sieci lub serwera: ' + error;
        console.error('Registration error:', error);
        alert('Wystąpił błąd sieciowy podczas rejestracji.');
    }
}

async function fetchApartmentsForSelect() {
    console.log("fetchApartmentsForSelect function CALLED");
    if (!reviewApartmentSelectEl) {
        console.warn("Element reviewApartmentSelect nie znaleziony, pomijam ładowanie mieszkań do selecta.");
        return;
    }
    reviewApartmentSelectEl.innerHTML = '<option value="">Ładowanie mieszkań...</option>';

    const graphqlQuery = {
        query: `
            query PobierzMieszkaniaDlaSelect {
              apartments {
                nodes {
                  databaseId 
                  name
                }
              }
            }
        `
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery),
        });
        const responseData = await response.json();

        if (responseData.data && responseData.data.apartments && responseData.data.apartments.nodes) {
            reviewApartmentSelectEl.innerHTML = '<option value="">-- Wybierz mieszkanie --</option>';
            if (responseData.data.apartments.nodes.length > 0) {
                responseData.data.apartments.nodes.forEach(apartment => {
                    const option = document.createElement('option');
                    console.log("Apartment for select - Name:", apartment.name, "databaseId:", apartment.databaseId);
                    option.value = apartment.databaseId;
                    option.textContent = apartment.name;
                    reviewApartmentSelectEl.appendChild(option);
                });
            } else {
                reviewApartmentSelectEl.innerHTML = '<option value="">Brak mieszkań do wyboru</option>';
            }
        } else {
            reviewApartmentSelectEl.innerHTML = '<option value="">Nie udało się załadować mieszkań</option>';
            console.error("Error fetching apartments for select:", responseData.errors || "No data returned");
        }
    } catch (error) {
        console.error('Fetch apartments for select error:', error);
        reviewApartmentSelectEl.innerHTML = '<option value="">Błąd ładowania mieszkań</option>';
    }
}

async function submitReview() {
    console.log("submitReview function CALLED");
    const addReviewResponseEl = document.getElementById('addReviewResponse');
    if (!addReviewResponseEl) {
        console.error("Element addReviewResponse nie znaleziony!");
        return;
    }
    addReviewResponseEl.textContent = 'Wysyłanie recenzji...';

    if (!currentJwtToken) {
        addReviewResponseEl.textContent = 'Musisz być zalogowany, aby dodać recenzję.';
        alert('Musisz być zalogowany, aby dodać recenzję.');
        return;
    }

    const apartmentId = document.getElementById('reviewApartmentSelect').value;
    const rating = parseInt(document.getElementById('reviewRating').value, 10);
    const comment = document.getElementById('reviewComment').value;

    console.log("Apartment ID from select (raw value) for submitReview:", `'${apartmentId}'`);

    if (!apartmentId || apartmentId === "") {
        addReviewResponseEl.textContent = 'Musisz wybrać mieszkanie z listy.';
        alert('Musisz wybrać mieszkanie z listy.');
        return;
    }
    if (!rating || rating < 1 || rating > 5) {
        addReviewResponseEl.textContent = 'Ocena musi być liczbą od 1 do 5.';
        alert('Ocena musi być liczbą od 1 do 5.');
        return;
    }

    const graphqlMutation = {
        query: `
            mutation DodajRecenzje($input: AddReviewInput!) {
              addReview(input: $input) {
                review { id comment rating reviewDate user { id name } apartment { id name } }
                errors { message code }
              }
            }
        `,
        variables: { input: { apartmentId: apartmentId, rating: rating, comment: comment } }
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentJwtToken}`,
            },
            body: JSON.stringify(graphqlMutation),
        });
        const responseData = await response.json();
        addReviewResponseEl.textContent = JSON.stringify(responseData, null, 2);
        if (responseData.data && responseData.data.addReview && responseData.data.addReview.review) {
            alert('Recenzja została pomyślnie dodana!');
            fetchApartments();
        } else if (responseData.errors) {
            let errorMessages = responseData.errors.map(err => err.message).join('; ');
            alert(`Błąd dodawania recenzji: ${errorMessages}`);
        }
    } catch (error) {
        addReviewResponseEl.textContent = 'Błąd sieci lub serwera: ' + error;
        console.error('Submit review error:', error);
        alert('Wystąpił błąd sieciowy przy dodawaniu recenzji.');
    }
}

async function fetchApartments() {
    console.log("fetchApartments function CALLED");
    const apartmentsResponseRawEl = document.getElementById('apartmentsResponseRaw');
    const apartmentsListFormattedEl = document.getElementById('apartmentsListFormatted');

    if (!apartmentsResponseRawEl || !apartmentsListFormattedEl) {
        console.error("Elementy do wyświetlania mieszkań nie zostały znalezione!");
        return;
    }

    apartmentsResponseRawEl.textContent = 'Pobieranie mieszkań...';
    apartmentsListFormattedEl.innerHTML = '';

    const graphqlQuery = {
        query: `
            query PobierzMieszkaniaZRecenzjami {
              apartments {
                nodes {
                  id
                  name
                  location
                  pricePerNight
                  databaseId 
                  reviews {
                    nodes { id comment rating user { name } }
                    totalCount
                  }
                }
                totalCount
                pageInfo { hasNextPage }
              }
            }
        `
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery),
        });
        const responseData = await response.json();
        apartmentsResponseRawEl.textContent = JSON.stringify(responseData, null, 2);
        if (responseData.data && responseData.data.apartments && responseData.data.apartments.nodes) {
            if (responseData.data.apartments.nodes.length === 0) {
                apartmentsListFormattedEl.innerHTML = '<p>Nie znaleziono żadnych mieszkań.</p>';
                return;
            }
            let html = `<h4>Znaleziono mieszkań: ${responseData.data.apartments.totalCount}</h4>`;
            responseData.data.apartments.nodes.forEach(apartment => {
                html += `<div class="data-card" id="apartment-card-${apartment.databaseId}">`;
                html += `<h4>${apartment.name || 'Brak nazwy'}</h4><p><strong>ID (GraphQL):</strong> ${apartment.id || 'N/A'}</p><p><strong>ID (Baza):</strong> ${apartment.databaseId || 'N/A'}</p><p><strong>Lokalizacja:</strong> ${apartment.location || 'N/A'}</p><p><strong>Cena za noc:</strong> ${apartment.pricePerNight !== null ? apartment.pricePerNight : 'N/A'}</p>`;
                if (apartment.reviews && apartment.reviews.nodes && apartment.reviews.nodes.length > 0) {
                    html += `<div class="reviews-list"><h5>Recenzje (${apartment.reviews.totalCount}):</h5>`;
                    apartment.reviews.nodes.forEach(review => {
                        html += `<div class="review-item"><p><strong>Ocena:</strong> ${review.rating}/5</p><p><em>"${review.comment || 'Brak komentarza'}"</em></p><p><small>- ${review.user ? review.user.name : 'Anonim'}</small></p></div>`;
                    });
                    html += `</div>`;
                } else {
                    html += `<p><small>Brak recenzji.</small></p>`;
                }
                if (currentUserRole === 'Admin' && apartment.databaseId) {
                    html += `<button onclick="confirmDeleteApartment('${apartment.databaseId}', '${apartment.name}')" style="background-color: #c0392b; margin-top: 10px;">Usuń Mieszkanie</button>`;
                }
                html += `</div>`;
            });
            apartmentsListFormattedEl.innerHTML = html;
        } else if (responseData.errors) {
            let errorMessages = responseData.errors.map(err => err.message).join('; ');
            apartmentsListFormattedEl.innerHTML = `<p style="color: red;">Wystąpił błąd przy pobieraniu mieszkań: ${errorMessages}</p>`;
        } else {
            apartmentsListFormattedEl.innerHTML = '<p>Brak danych lub nieoczekiwana odpowiedź.</p>';
        }
    } catch (error) {
        apartmentsResponseRawEl.textContent = 'Błąd sieci lub serwera: ' + error;
        apartmentsListFormattedEl.innerHTML = '<p style="color: red;">Błąd sieci lub serwera.</p>';
        console.error('Fetch apartments error:', error);
    }
}

async function fetchMyProfile() {
    console.log("fetchMyProfile function CALLED");
    const myProfileResponseRawEl = document.getElementById('myProfileResponseRaw');
    const myProfileFormattedEl = document.getElementById('myProfileFormatted');

    if (!myProfileResponseRawEl || !myProfileFormattedEl) {
        console.error("Elementy do wyświetlania profilu nie zostały znalezione!");
        return;
    }

    myProfileResponseRawEl.textContent = 'Pobieranie profilu...';
    myProfileFormattedEl.innerHTML = '';

    if (!currentJwtToken) {
        myProfileFormattedEl.innerHTML = '<p style="color: orange;">Nie jesteś zalogowany lub brak tokenu. Zaloguj się najpierw.</p>';
        myProfileResponseRawEl.textContent = 'Czeka na zalogowanie...';
        return;
    }

    const graphqlQuery = {
        query: ` query MojeDaneProfilowe { myProfile { id name email } } `
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentJwtToken}`,
            },
            body: JSON.stringify(graphqlQuery),
        });
        const responseData = await response.json();
        myProfileResponseRawEl.textContent = JSON.stringify(responseData, null, 2);
        if (responseData.data && responseData.data.myProfile) {
            const profile = responseData.data.myProfile;
            let html = `<div class="data-card"><h4>Profil: ${profile.name || 'Brak nazwy'}</h4><p><strong>ID (GraphQL):</strong> ${profile.id || 'N/A'}</p><p><strong>Email:</strong> ${profile.email || 'N/A'}</p></div>`;
            myProfileFormattedEl.innerHTML = html;
        } else if (responseData.errors) {
            let errorMessages = responseData.errors.map(err => err.message).join('; ');
            myProfileFormattedEl.innerHTML = `<p style="color: red;">Wystąpił błąd przy pobieraniu profilu: ${errorMessages}</p>`;
        } else {
            myProfileFormattedEl.innerHTML = '<p>Nie udało się pobrać danych profilu lub użytkownik nieautoryzowany.</p>';
        }
    } catch (error) {
        myProfileResponseRawEl.textContent = 'Błąd sieci lub serwera: ' + error;
        myProfileFormattedEl.innerHTML = '<p style="color: red;">Błąd sieci lub serwera.</p>';
        console.error('Fetch my profile error:', error);
    }
}

function confirmDeleteApartment(apartmentDatabaseId, apartmentName) {
    console.log("confirmDeleteApartment CALLED for ID:", apartmentDatabaseId, "Name:", apartmentName);
    if (confirm(`Czy na pewno chcesz usunąć mieszkanie "${apartmentName}" (ID: ${apartmentDatabaseId})? Tej operacji nie można cofnąć.`)) {
        deleteApartment(apartmentDatabaseId);
    }
}

async function deleteApartment(apartmentDatabaseId) {
    console.log("deleteApartment CALLED for ID:", apartmentDatabaseId);

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        alert('Musisz być zalogowany jako Administrator, aby usunąć mieszkanie.');
        return;
    }

    if (!apartmentDatabaseId) {
        alert('Brak ID mieszkania do usunięcia.');
        return;
    }

    const graphqlMutation = {
        query: `
            mutation UsunMieszkanie($id: UUID!) {
              deleteApartment(id: $id)
            }
        `,
        variables: { id: apartmentDatabaseId }
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentJwtToken}`,
            },
            body: JSON.stringify(graphqlMutation),
        });

        const contentType = response.headers.get("content-type");
        let responseData;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseData = await response.json();
        } else {
            if (response.ok) {
                responseData = { data: { deleteApartment: true } };
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        }

        console.log("Delete apartment response:", responseData);

        if (responseData.data && (responseData.data.deleteApartment === true || typeof responseData.data.deleteApartment === 'string' || typeof responseData.data.deleteApartment === 'object')) {
            alert('Mieszkanie zostało pomyślnie usunięte!');
            fetchApartments();
        } else if (responseData.errors) {
            let errorMessages = responseData.errors.map(err => err.message).join('; ');
            alert(`Błąd usuwania mieszkania: ${errorMessages}`);
        } else {
            alert('Nie udało się usunąć mieszkania. Nieoczekiwana odpowiedź od serwera.');
        }
    } catch (error) {
        console.error('Delete apartment error:', error);
        alert(`Wystąpił błąd sieciowy lub serwera przy usuwaniu mieszkania: ${error.message}`);
    }
}

async function submitNewApartment() {
    console.log("submitNewApartment function CALLED");
    const addApartmentResponseEl = document.getElementById('addApartmentResponse');
    if (!addApartmentResponseEl) {
        console.error("Element addApartmentResponse nie znaleziony!");
        return;
    }
    addApartmentResponseEl.textContent = 'Dodawanie mieszkania...';

    if (!currentJwtToken || currentUserRole !== 'Admin') {
        addApartmentResponseEl.textContent = 'Musisz być zalogowany jako Administrator, aby dodać mieszkanie.';
        alert('Musisz być zalogowany jako Administrator, aby dodać mieszkanie.');
        return;
    }

    const name = document.getElementById('apartmentName').value;
    const description = document.getElementById('apartmentDescription').value;
    const location = document.getElementById('apartmentLocation').value;
    const numberOfBedrooms = parseInt(document.getElementById('apartmentBedrooms').value, 10);
    const numberOfBathrooms = parseInt(document.getElementById('apartmentBathrooms').value, 10);
    const amenitiesText = document.getElementById('apartmentAmenities').value;
    const amenities = amenitiesText ? amenitiesText.split(',').map(a => a.trim()).filter(a => a) : [];
    const isAvailable = document.getElementById('apartmentIsAvailable').checked;
    const pricePerNight = parseFloat(document.getElementById('apartmentPrice').value);

    if (!name || !description || !location || isNaN(numberOfBedrooms) || isNaN(numberOfBathrooms) || isNaN(pricePerNight)) {
        addApartmentResponseEl.textContent = 'Wszystkie pola (oprócz udogodnień) są wymagane i muszą być poprawne.';
        alert('Wszystkie pola (oprócz udogodnień) są wymagane i muszą być poprawne.');
        return;
    }

    const graphqlMutation = {
        query: `
            mutation DodajMieszkanie($input: AddApartmentInput!) {
              addApartment(input: $input) {
                id
                name
                location
              }
            }
        `,
        variables: {
            input: {
                name: name,
                description: description,
                location: location,
                numberOfBedrooms: numberOfBedrooms,
                numberOfBathrooms: numberOfBathrooms,
                amenities: amenities,
                isAvailable: isAvailable,
                pricePerNight: pricePerNight
            }
        }
    };

    try {
        const response = await fetch(`${backendAppUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentJwtToken}`,
            },
            body: JSON.stringify(graphqlMutation),
        });
        const responseData = await response.json();
        addApartmentResponseEl.textContent = JSON.stringify(responseData, null, 2);

        if (responseData.data && responseData.data.addApartment) {
            alert('Mieszkanie zostało pomyślnie dodane!');
            document.getElementById('addApartmentForm').reset();
            fetchApartments();
        } else if (responseData.errors) {
            let errorMessages = responseData.errors.map(err => err.message).join('; ');
            alert(`Błąd dodawania mieszkania: ${errorMessages}`);
        }
    } catch (error) {
        addApartmentResponseEl.textContent = 'Błąd sieci lub serwera: ' + error;
        console.error('Submit new apartment error:', error);
        alert('Wystąpił błąd sieciowy przy dodawaniu mieszkania.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const initialLoginStatusEl = document.getElementById('loginStatus');
    const initialUserRoleDisplayEl = document.getElementById('userRoleDisplay');
    const initialAddReviewSectionEl = document.getElementById('addReviewSection');
    const initialMyProfileSectionEl = document.getElementById('myProfileSection');
    const initialLogoutButtonEl = document.getElementById('logoutButton');
    const initialLoginSectionContainerEl = document.getElementById('loginSectionContainer');
    const initialRegisterSectionEl = document.getElementById('registerSection');
    const initialAddApartmentSectionEl = document.getElementById('addApartmentSection');


    if (initialLoginStatusEl) initialLoginStatusEl.textContent = 'Niezalogowany';
    if (initialUserRoleDisplayEl) initialUserRoleDisplayEl.textContent = '-';
    if (initialAddReviewSectionEl) initialAddReviewSectionEl.classList.add('hidden-section');
    if (initialMyProfileSectionEl) initialMyProfileSectionEl.classList.add('hidden-section');
    if (initialLogoutButtonEl) initialLogoutButtonEl.classList.add('hidden-section');
    if (initialAddApartmentSectionEl) initialAddApartmentSectionEl.classList.add('hidden-section');

    if (initialLoginSectionContainerEl) initialLoginSectionContainerEl.classList.remove('hidden-section');
    if (initialRegisterSectionEl) initialRegisterSectionEl.classList.remove('hidden-section');

    const initialReviewApartmentSelectEl = document.getElementById('reviewApartmentSelect');
    if (initialReviewApartmentSelectEl) {
        initialReviewApartmentSelectEl.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
    }
    checkLoginOnLoad();
});