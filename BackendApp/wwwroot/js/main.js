var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkLoginOnLoad, loginUser, logoutUser, submitRegistration } from './authService.js';
import { submitNewApartment, prepareEditApartmentForm, cancelEditApartment, submitUpdateApartment, confirmDeleteApartment, } from './apartmentService.js';
import { calculateTotalPrice, submitBooking, confirmDeleteBooking, } from './bookingService.js';
import { submitReview, confirmDeleteReview } from './reviewService.js';
import { handleRouteChange } from './router.js';
import { submitNewTicket, fetchTicketById, submitTicketReply, } from './ticketApiService.js';
import { renderAdminTicketDetail, renderMyTicketDetail } from './uiService.js';
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] DOMContentLoaded event fired.");
    const viewTicketDetailsGlobal = (ticketId) => {
        console.log("[INFO] main.ts: viewTicketDetailsGlobal (admin onclick) navigating to ticket ID:", ticketId);
        window.location.hash = `#/admin/tickety/${ticketId}`;
    };
    const viewMyTicketDetailsGlobal = (ticketId) => {
        console.log("[INFO] main.ts: viewMyTicketDetailsGlobal (user onclick) navigating to ticket ID:", ticketId);
        window.location.hash = `#/moje-zgloszenia/${ticketId}`;
    };
    const handleGenericPageChangeGlobal = (page, containerId) => {
        console.log(`[INFO] main.ts: handleGenericPageChange called for page ${page}, containerId ${containerId}`);
        const paginationContainer = document.getElementById(containerId);
        if (paginationContainer && typeof paginationContainer._onPageChangeCallback === 'function') {
            paginationContainer._onPageChangeCallback(page);
        }
        else {
            console.error(`[ERROR] main.ts: Callback _onPageChangeCallback not found or not a function on container ${containerId}`);
        }
    };
    window.loginUser = loginUser;
    window.logoutUser = logoutUser;
    window.submitRegistration = submitRegistration;
    window.submitNewApartment = submitNewApartment;
    window.prepareEditApartmentForm = prepareEditApartmentForm;
    window.cancelEditApartment = cancelEditApartment;
    window.submitUpdateApartment = submitUpdateApartment;
    window.confirmDeleteApartment = confirmDeleteApartment;
    window.submitReview = submitReview;
    window.submitBooking = submitBooking;
    window.calculateTotalPrice = calculateTotalPrice;
    window.confirmDeleteReview = confirmDeleteReview;
    window.confirmDeleteBooking = confirmDeleteBooking;
    window.viewTicketDetails = viewTicketDetailsGlobal;
    window.viewMyTicketDetails = viewMyTicketDetailsGlobal;
    window.handleGenericPageChange = handleGenericPageChangeGlobal;
    console.log("[DEBUG] main.ts: Global functions for onclick have been assigned to window.");
    const bookingApartmentSelectEl = document.getElementById('bookingApartmentSelect');
    const bookingCheckInDateEl = document.getElementById('bookingCheckInDate');
    const bookingCheckOutDateEl = document.getElementById('bookingCheckOutDate');
    if (bookingApartmentSelectEl)
        bookingApartmentSelectEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckInDateEl)
        bookingCheckInDateEl.addEventListener('change', calculateTotalPrice);
    if (bookingCheckOutDateEl)
        bookingCheckOutDateEl.addEventListener('change', calculateTotalPrice);
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginUser();
        });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitRegistration();
        });
    }
    const logoutButtonEl = document.getElementById('logoutButton');
    if (logoutButtonEl) {
        logoutButtonEl.addEventListener('click', logoutUser);
    }
    const addApartmentForm = document.getElementById('addApartmentForm');
    if (addApartmentForm) {
        addApartmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitNewApartment();
        });
    }
    const addReviewForm = document.getElementById('addReviewForm');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitReview();
        });
    }
    const addBookingForm = document.getElementById('addBookingForm');
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBooking();
        });
    }
    const editApartmentForm = document.getElementById('editApartmentForm');
    if (editApartmentForm) {
        editApartmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitUpdateApartment();
        });
    }
    const cancelEditButton = document.getElementById('cancelEditApartmentButton');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', cancelEditApartment);
    }
    const submitTicketFormEl = document.getElementById('submitTicketForm');
    if (submitTicketFormEl) {
        submitTicketFormEl.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const subjectEl = document.getElementById('ticketSubject');
            const descriptionEl = document.getElementById('ticketDescription');
            const responseEl = document.getElementById('submitTicketResponse');
            if (!subjectEl || !descriptionEl || !responseEl) {
                console.error("Brakuje elementów formularza ticketu.");
                if (responseEl)
                    responseEl.innerHTML = `<p style="color: red;">Błąd wewnętrzny formularza.</p>`;
                return;
            }
            const subject = subjectEl.value.trim();
            const description = descriptionEl.value.trim();
            if (!subject || !description) {
                responseEl.innerHTML = `<p style="color: red;">Temat i opis są wymagane.</p>`;
                return;
            }
            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie zgłoszenia...</p>`;
            const ticketData = { subject, description };
            const createdTicket = yield submitNewTicket(ticketData);
            if (createdTicket) {
                responseEl.innerHTML = `<p style="color: green;">Zgłoszenie wysłane pomyślnie! ID Twojego zgłoszenia: ${createdTicket.id}</p>`;
                submitTicketFormEl.reset();
            }
            else {
                if (responseEl.innerHTML.includes("Wysyłanie zgłoszenia...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać zgłoszenia. Spróbuj ponownie.</p>`;
                }
            }
        }));
    }
    const backToTicketsListBtnEl = document.getElementById('backToTicketsListBtn');
    if (backToTicketsListBtnEl) {
        backToTicketsListBtnEl.addEventListener('click', () => {
            window.location.hash = '#/admin/tickety';
        });
    }
    const backToMyTicketsListBtnEl = document.getElementById('backToMyTicketsListBtn');
    if (backToMyTicketsListBtnEl) {
        backToMyTicketsListBtnEl.addEventListener('click', () => {
            window.location.hash = '#/moje-zgloszenia';
        });
    }
    const adminReplyToTicketFormEl = document.getElementById('adminReplyToTicketForm');
    if (adminReplyToTicketFormEl) {
        adminReplyToTicketFormEl.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const ticketIdEl = document.getElementById('replyTicketId');
            const replyTextEl = document.getElementById('adminTicketReplyText');
            const responseEl = document.getElementById('adminReplyTicketResponse');
            if (!ticketIdEl || !replyTextEl || !responseEl) {
                return;
            }
            const ticketId = ticketIdEl.value;
            const replyText = replyTextEl.value.trim();
            if (!replyText || !ticketId) {
                responseEl.innerHTML = `<p style="color: red;">ID ticketu i treść odpowiedzi są wymagane.</p>`;
                return;
            }
            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie odpowiedzi...</p>`;
            const replyData = { message: replyText };
            const createdReply = yield submitTicketReply(ticketId, replyData);
            if (createdReply) {
                responseEl.innerHTML = `<p style="color: green;">Odpowiedź wysłana pomyślnie!</p>`;
                replyTextEl.value = '';
                if (window.location.hash.includes(`#/admin/tickety/${ticketId}`)) {
                    fetchTicketById(ticketId)
                        .then((ticketWithReplies) => {
                        if (ticketWithReplies)
                            renderAdminTicketDetail(ticketWithReplies);
                        else if (responseEl)
                            responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu (nie znaleziono ticketu).</p>`;
                    })
                        .catch((error) => {
                        console.error(`[ERROR] main.ts: Błąd odświeżania szczegółów ticketu ${ticketId} po odpowiedzi admina:`, error);
                        if (responseEl)
                            responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu: ${error.message}</p>`;
                    });
                }
            }
            else {
                if (responseEl.innerHTML.includes("Wysyłanie odpowiedzi...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać odpowiedzi. Spróbuj ponownie.</p>`;
                }
            }
        }));
    }
    const userReplyToTicketFormEl = document.getElementById('userReplyToTicketForm');
    if (userReplyToTicketFormEl) {
        userReplyToTicketFormEl.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const ticketIdEl = document.getElementById('userReplyTicketId');
            const replyTextEl = document.getElementById('userTicketReplyText');
            const responseEl = document.getElementById('userReplyTicketResponse');
            if (!ticketIdEl || !replyTextEl || !responseEl) {
                return;
            }
            const ticketId = ticketIdEl.value;
            const replyText = replyTextEl.value.trim();
            if (!replyText || !ticketId) {
                return;
            }
            responseEl.innerHTML = `<p style="color: blue;">Wysyłanie Twojej odpowiedzi...</p>`;
            const replyData = { message: replyText };
            const createdReply = yield submitTicketReply(ticketId, replyData);
            if (createdReply) {
                responseEl.innerHTML = `<p style="color: green;">Twoja odpowiedź została wysłana!</p>`;
                replyTextEl.value = '';
                if (window.location.hash.includes(`#/moje-zgloszenia/${ticketId}`)) {
                    fetchTicketById(ticketId)
                        .then((ticketWithReplies) => {
                        if (ticketWithReplies)
                            renderMyTicketDetail(ticketWithReplies);
                        else if (responseEl)
                            responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu.</p>`;
                    })
                        .catch((error) => {
                        console.error(`[ERROR] main.ts: Błąd odświeżania szczegółów ticketu ${ticketId} po odpowiedzi użytkownika:`, error);
                        if (responseEl)
                            responseEl.innerHTML += `<br><p style="color: orange;">Nie udało się odświeżyć widoku ticketu: ${error.message}</p>`;
                    });
                }
            }
            else {
                if (responseEl.innerHTML.includes("Wysyłanie Twojej odpowiedzi...")) {
                    responseEl.innerHTML = `<p style="color: red;">Nie udało się wysłać Twojej odpowiedzi. Spróbuj ponownie.</p>`;
                }
            }
        }));
    }
    checkLoginOnLoad();
    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    console.log("Aplikacja zainicjalizowana, moduły załadowane.");
});
//# sourceMappingURL=main.js.map