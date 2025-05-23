import { allPageSections } from './config.js';
import { getUserRole, getJwtToken } from './state.js';
import { fetchApartmentsForSelect } from './apartmentService.js';
import { fetchAllTicketsForAdmin, fetchMyTickets } from './ticketApiService.js';
const _logger = {
    LogInformation: (...args) => console.log('[INFO] uiService:', ...args),
    LogWarning: (...args) => console.warn('[WARN] uiService:', ...args),
    LogError: (...args) => console.error('[ERROR] uiService:', ...args),
};
export function showSection(sectionIdToShow) {
    allPageSections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.toggle('hidden-section', id !== sectionIdToShow);
        }
    });
}
export function updateLoginState() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
    const isLoggedIn = !!getJwtToken();
    const currentUserRole = getUserRole();
    const elements = {
        loginStatusEl: document.getElementById('loginStatus'),
        userRoleDisplayEl: document.getElementById('userRoleDisplay'),
        logoutButtonEl: document.getElementById('logoutButton'),
        navLogin: document.getElementById('navLogin'),
        navRegister: document.getElementById('navRegister'),
        navMyProfile: document.getElementById('navMyProfile'),
        navAddReview: document.getElementById('navAddReview'),
        navBookApartment: document.getElementById('navBookApartment'),
        navSubmitTicket: document.getElementById('navSubmitTicket'),
        navMyTickets: document.getElementById('navMyTickets'),
        navAddApartment: document.getElementById('navAddApartment'),
        navAdminBookings: document.getElementById('navAdminBookings'),
        navAdminUsers: document.getElementById('navAdminUsers'),
        navAdminTickets: document.getElementById('navAdminTickets'),
        reviewApartmentSelectEl: document.getElementById('reviewApartmentSelect'),
        bookingApartmentSelectEl: document.getElementById('bookingApartmentSelect'),
        totalPriceEl: document.getElementById('bookingTotalPrice'),
        myProfileFormattedEl: document.getElementById('myProfileFormatted')
    };
    if (isLoggedIn && currentUserRole) {
        if (elements.loginStatusEl)
            elements.loginStatusEl.textContent = 'Zalogowany';
        if (elements.userRoleDisplayEl)
            elements.userRoleDisplayEl.textContent = currentUserRole;
        if (elements.logoutButtonEl)
            elements.logoutButtonEl.classList.remove('hidden-section');
        (_a = elements.navLogin) === null || _a === void 0 ? void 0 : _a.classList.add('hidden-section');
        (_b = elements.navRegister) === null || _b === void 0 ? void 0 : _b.classList.add('hidden-section');
        (_c = elements.navMyProfile) === null || _c === void 0 ? void 0 : _c.classList.remove('hidden-section');
        (_d = elements.navAddReview) === null || _d === void 0 ? void 0 : _d.classList.remove('hidden-section');
        (_e = elements.navBookApartment) === null || _e === void 0 ? void 0 : _e.classList.remove('hidden-section');
        (_f = elements.navSubmitTicket) === null || _f === void 0 ? void 0 : _f.classList.remove('hidden-section');
        (_g = elements.navMyTickets) === null || _g === void 0 ? void 0 : _g.classList.remove('hidden-section');
        if (currentUserRole === 'Admin') {
            (_h = elements.navAddApartment) === null || _h === void 0 ? void 0 : _h.classList.remove('hidden-section');
            (_j = elements.navAdminBookings) === null || _j === void 0 ? void 0 : _j.classList.remove('hidden-section');
            (_k = elements.navAdminUsers) === null || _k === void 0 ? void 0 : _k.classList.remove('hidden-section');
            (_l = elements.navAdminTickets) === null || _l === void 0 ? void 0 : _l.classList.remove('hidden-section');
        }
        else {
            (_m = elements.navAddApartment) === null || _m === void 0 ? void 0 : _m.classList.add('hidden-section');
            (_o = elements.navAdminBookings) === null || _o === void 0 ? void 0 : _o.classList.add('hidden-section');
            (_p = elements.navAdminUsers) === null || _p === void 0 ? void 0 : _p.classList.add('hidden-section');
            (_q = elements.navAdminTickets) === null || _q === void 0 ? void 0 : _q.classList.add('hidden-section');
        }
        fetchApartmentsForSelect();
    }
    else {
        if (elements.loginStatusEl)
            elements.loginStatusEl.textContent = 'Niezalogowany';
        if (elements.userRoleDisplayEl)
            elements.userRoleDisplayEl.textContent = '-';
        if (elements.logoutButtonEl)
            elements.logoutButtonEl.classList.add('hidden-section');
        (_r = elements.navLogin) === null || _r === void 0 ? void 0 : _r.classList.remove('hidden-section');
        (_s = elements.navRegister) === null || _s === void 0 ? void 0 : _s.classList.remove('hidden-section');
        (_t = elements.navMyProfile) === null || _t === void 0 ? void 0 : _t.classList.add('hidden-section');
        (_u = elements.navAddReview) === null || _u === void 0 ? void 0 : _u.classList.add('hidden-section');
        (_v = elements.navBookApartment) === null || _v === void 0 ? void 0 : _v.classList.add('hidden-section');
        (_w = elements.navSubmitTicket) === null || _w === void 0 ? void 0 : _w.classList.add('hidden-section');
        (_x = elements.navMyTickets) === null || _x === void 0 ? void 0 : _x.classList.add('hidden-section');
        (_y = elements.navAddApartment) === null || _y === void 0 ? void 0 : _y.classList.add('hidden-section');
        (_z = elements.navAdminBookings) === null || _z === void 0 ? void 0 : _z.classList.add('hidden-section');
        (_0 = elements.navAdminUsers) === null || _0 === void 0 ? void 0 : _0.classList.add('hidden-section');
        (_1 = elements.navAdminTickets) === null || _1 === void 0 ? void 0 : _1.classList.add('hidden-section');
        const reviewSelect = elements.reviewApartmentSelectEl;
        const bookingSelect = elements.bookingApartmentSelectEl;
        if (reviewSelect)
            reviewSelect.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (bookingSelect)
            bookingSelect.innerHTML = '<option value="">Zaloguj się, aby wybrać mieszkanie</option>';
        if (elements.totalPriceEl)
            elements.totalPriceEl.value = "";
        if (elements.myProfileFormattedEl)
            elements.myProfileFormattedEl.innerHTML = '';
    }
    const adminJsonContainers = document.querySelectorAll('.admin-json-container');
    adminJsonContainers.forEach((containerNode) => {
        if (containerNode instanceof HTMLElement) {
            containerNode.style.display = (currentUserRole === 'Admin') ? 'block' : 'none';
        }
    });
}
function escapeHtml(unsafeInput) {
    if (unsafeInput === null || typeof unsafeInput === 'undefined') {
        return '';
    }
    const unsafeString = String(unsafeInput);
    return unsafeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
export function renderAdminTicketsList(tickets, totalCount, currentPage, pageSize) {
    const listEl = document.getElementById('adminTicketsListFormatted');
    const paginationControlsEl = document.getElementById('adminTicketsPaginationControls');
    if (!listEl) {
        _logger.LogError("Element adminTicketsListFormatted nie został znaleziony w DOM.");
        return;
    }
    if (!tickets || tickets.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;">Brak zgłoszeń do wyświetlenia.</p>';
        if (paginationControlsEl)
            paginationControlsEl.innerHTML = '';
        return;
    }
    let html = `<h4 style="text-align:center;">Znaleziono zgłoszeń: ${totalCount}</h4>`;
    html += `<table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Temat</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Utworzenia</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Akcje</th></tr></thead><tbody>`;
    tickets.forEach(ticket => {
        const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Brak danych';
        html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;" title="${ticket.id}">${ticket.id ? ticket.id.substring(0, 8) + '...' : 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.subject)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.userEmail)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.status)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${createdAtDate}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button class="action-button-secondary" style="font-size: 0.8em; padding: 3px 6px;" onclick="window.viewTicketDetails('${ticket.id}')">Zobacz</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    listEl.innerHTML = html;
    if (paginationControlsEl) {
        renderGenericPagination(paginationControlsEl, currentPage, Math.ceil(totalCount / pageSize), (page) => {
            fetchAllTicketsForAdmin(page, pageSize)
                .then(ticketData => {
                if (ticketData)
                    renderAdminTicketsList(ticketData.items, ticketData.totalCount, ticketData.pageNumber, ticketData.pageSize);
            })
                .catch(error => {
                if (listEl)
                    listEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania zgłoszeń: ${error.message}</p>`;
            });
        });
    }
}
export function renderAdminTicketDetail(ticket) {
    const detailEl = document.getElementById('adminTicketDetailFormatted');
    const replyFormTicketIdEl = document.getElementById('replyTicketId');
    if (!detailEl) {
        _logger.LogError("Element adminTicketDetailFormatted nie został znaleziony w DOM.");
        return;
    }
    if (!ticket) {
        detailEl.innerHTML = '<p style="color: red; text-align:center;">Nie udało się załadować szczegółów zgłoszenia lub zgłoszenie nie istnieje.</p>';
        if (replyFormTicketIdEl)
            replyFormTicketIdEl.value = '';
        return;
    }
    if (replyFormTicketIdEl)
        replyFormTicketIdEl.value = ticket.id;
    const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
    const lastUpdatedAtDate = ticket.lastUpdatedAt ? new Date(ticket.lastUpdatedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak aktualizacji';
    let html = `<h4>Temat: ${escapeHtml(ticket.subject)}</h4>
        <p><strong>ID Zgłoszenia:</strong> ${escapeHtml(ticket.id)}</p>
        <p><strong>Zgłaszający (Email):</strong> ${escapeHtml(ticket.userEmail)}</p>
        <p><strong>ID Zgłaszającego:</strong> ${escapeHtml(ticket.userId)}</p>
        <p><strong>Status:</strong> ${escapeHtml(ticket.status)}</p>
        <p><strong>Data Utworzenia:</strong> ${createdAtDate}</p>
        <p><strong>Ostatnia Aktualizacja:</strong> ${lastUpdatedAtDate}</p>
        <div style="margin-top: 15px; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Opis:</strong><p style="white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>`;
    if (ticket.replies && ticket.replies.length > 0) {
        html += `<div style="margin-top: 30px;"><h5>Odpowiedzi:</h5>`;
        ticket.replies.sort((a, b) => new Date(a.repliedAt).getTime() - new Date(b.repliedAt).getTime())
            .forEach((reply) => {
            const repliedAtDate = reply.repliedAt ? new Date(reply.repliedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
            html += `<div class="ticket-reply" style="border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px;">
                    <p><strong>${escapeHtml(reply.replierUserEmail || reply.replierUserId)}</strong> (${repliedAtDate}):</p>
                    <p style="white-space: pre-wrap; background-color: #f0f0f0; padding: 8px; border-radius: 4px;">${escapeHtml(reply.message)}</p>
                </div>`;
        });
        html += `</div>`;
    }
    else {
        html += `<p style="margin-top: 20px;"><i>Brak odpowiedzi.</i></p>`;
    }
    detailEl.innerHTML = html;
}
export function renderMyTicketsList(ticketData, listContainerId, paginationContainerId) {
    const listEl = document.getElementById(listContainerId);
    const paginationControlsEl = document.getElementById(paginationContainerId);
    if (!listEl) {
        _logger.LogError(`Element ${listContainerId} nie znaleziony.`);
        return;
    }
    if (!ticketData || !ticketData.items || ticketData.items.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;">Nie masz żadnych zgłoszeń.</p>';
        if (paginationControlsEl)
            paginationControlsEl.innerHTML = '';
        return;
    }
    const { items, totalCount, pageNumber, pageSize } = ticketData;
    let html = `<h4 style="text-align:center;">Twoje zgłoszenia (Znaleziono: ${totalCount})</h4>`;
    html += `<table class="user-table" style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Temat</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Utworzenia</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Akcje</th></tr></thead><tbody>`;
    items.forEach((ticket) => {
        const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : 'Brak danych';
        html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;" title="${ticket.id}">${ticket.id ? ticket.id.substring(0, 8) + '...' : 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.subject)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(ticket.status)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${createdAtDate}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button class="action-button-secondary" style="font-size: 0.8em; padding: 3px 6px;" onclick="window.viewMyTicketDetails('${ticket.id}')">Zobacz</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    listEl.innerHTML = html;
    if (paginationControlsEl) {
        renderGenericPagination(paginationControlsEl, pageNumber, Math.ceil(totalCount / pageSize), (page) => {
            fetchMyTickets(page, pageSize).then(newData => {
                if (newData)
                    renderMyTicketsList(newData, listContainerId, paginationContainerId);
            }).catch(err => {
                if (listEl)
                    listEl.innerHTML = `<p style="color: red; text-align:center;">Błąd ładowania Twoich zgłoszeń: ${err.message}</p>`;
            });
        });
    }
}
export function renderMyTicketDetail(ticket) {
    const detailEl = document.getElementById('myTicketDetailFormatted');
    const replyFormTicketIdEl = document.getElementById('userReplyTicketId');
    if (!detailEl) {
        _logger.LogError("Element myTicketDetailFormatted nie został znaleziony.");
        return;
    }
    if (!ticket) {
        detailEl.innerHTML = '<p style="color: red; text-align:center;">Nie udało się załadować szczegółów zgłoszenia lub zgłoszenie nie istnieje.</p>';
        if (replyFormTicketIdEl)
            replyFormTicketIdEl.value = '';
        return;
    }
    if (replyFormTicketIdEl)
        replyFormTicketIdEl.value = ticket.id;
    const createdAtDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
    const lastUpdatedAtDate = ticket.lastUpdatedAt ? new Date(ticket.lastUpdatedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak aktualizacji';
    let html = `<h4>Temat: ${escapeHtml(ticket.subject)}</h4>
        <p><strong>ID Zgłoszenia:</strong> ${escapeHtml(ticket.id)}</p>
        <p><strong>Status:</strong> ${escapeHtml(ticket.status)}</p>
        <p><strong>Data Utworzenia:</strong> ${createdAtDate}</p>
        <p><strong>Ostatnia Aktualizacja:</strong> ${lastUpdatedAtDate}</p>
        <div style="margin-top: 15px; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Twój Opis:</strong><p style="white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>`;
    if (ticket.replies && ticket.replies.length > 0) {
        html += `<div style="margin-top: 30px;"><h5>Historia Korespondencji:</h5>`;
        ticket.replies.sort((a, b) => new Date(a.repliedAt).getTime() - new Date(b.repliedAt).getTime())
            .forEach((reply) => {
            const repliedAtDate = reply.repliedAt ? new Date(reply.repliedAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }) : 'Brak danych';
            const isClientReply = reply.replierUserId === ticket.userId;
            const replierDisplayName = escapeHtml(reply.replierUserEmail || reply.replierUserId);
            const alignStyle = isClientReply
                ? "text-align: left; background-color: #e6f7ff; border-left: 3px solid #1890ff;"
                : "text-align: right; background-color: #f0f0f0; border-right: 3px solid #555;";
            const authorPrefix = isClientReply ? (ticket.userEmail === reply.replierUserEmail ? "Ty" : replierDisplayName) : "Support (Admin)";
            html += `
                    <div class="ticket-reply" style="border: 1px solid #ddd; padding: 10px; margin-top: 10px; border-radius: 4px; ${alignStyle}"> 
                        <p style="margin-bottom: 5px;"><strong>${authorPrefix}</strong> (${repliedAtDate}):</p>
                        <p style="white-space: pre-wrap; margin-top:0;">${escapeHtml(reply.message)}</p>
                    </div>`;
        });
        html += `</div>`;
    }
    else {
        html += `<p style="margin-top: 20px;"><i>Brak odpowiedzi w tym zgłoszeniu.</i></p>`;
    }
    detailEl.innerHTML = html;
}
export function renderGenericPagination(container, currentPage, totalPages, onPageChange) {
    if (!container)
        return;
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }
    let paginationHtml = `<div style="margin-top: 20px; text-align: center; padding-bottom: 20px;">`;
    paginationHtml += `<button class="action-button-secondary" style="margin-right: 5px;" 
                        ${currentPage <= 1 ? 'disabled' : ''} 
                        onclick="window.handleGenericPageChange(${currentPage - 1}, '${container.id}')">
                       &laquo; Poprzednia
                       </button>`;
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if ((endPage - startPage + 1 < maxPagesToShow) && totalPages > maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    else if (totalPages < maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    }
    if (startPage > 1) {
        paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(1, '${container.id}')">1</button>`;
        if (startPage > 2)
            paginationHtml += `<span style="margin: 0 2px;">...</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `<button style="margin: 0 2px; font-weight: bold; background-color: #ddd;" disabled>${i}</button>`;
        }
        else {
            paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(${i}, '${container.id}')">${i}</button>`;
        }
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1)
            paginationHtml += `<span style="margin: 0 2px;">...</span>`;
        paginationHtml += `<button style="margin: 0 2px;" onclick="window.handleGenericPageChange(${totalPages}, '${container.id}')">${totalPages}</button>`;
    }
    paginationHtml += `<button class="action-button-secondary" style="margin-left: 5px;" 
                        ${currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="window.handleGenericPageChange(${currentPage + 1}, '${container.id}')">
                       Następna &raquo;
                       </button>`;
    paginationHtml += `</div>`;
    container.innerHTML = paginationHtml;
    container._onPageChangeCallback = onPageChange;
}
//# sourceMappingURL=uiService.js.map