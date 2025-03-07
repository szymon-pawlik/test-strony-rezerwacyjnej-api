// API Base URL - now relative since we're serving from same origin
const API_BASE_URL = '/api';

// Common functions
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        return null;
    }
}

async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        return null;
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Apartments page functionality
if (window.location.pathname.endsWith('apartments.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadApartments();

        document.getElementById('searchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await loadApartments();
        });

        document.getElementById('apartmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await createApartment();
        });
    });

    async function loadApartments() {
        const params = new URLSearchParams();
        const location = document.getElementById('location').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        const bedrooms = document.getElementById('bedrooms').value;

        if (location) params.append('location', location);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (bedrooms) params.append('bedrooms', bedrooms);

        const apartments = await fetchData(`${API_BASE_URL}/apartments/search?${params}`);
        if (apartments) displayApartments(apartments);
    }

    function displayApartments(apartments) {
        const container = document.getElementById('apartmentsList');
        container.innerHTML = '';

        if (!apartments || apartments.length === 0) {
            container.innerHTML = '<p>No apartments found</p>';
            return;
        }

        apartments.forEach(apartment => {
            const card = document.createElement('div');
            card.className = 'apartment-card';
            card.innerHTML = `
                <h3>${apartment.name}</h3>
                <p><strong>Location:</strong> ${apartment.location}</p>
                <p><strong>Price:</strong> $${apartment.pricePerNight}/night</p>
                <p><strong>Bedrooms:</strong> ${apartment.numberOfBedrooms}</p>
                <p><strong>Bathrooms:</strong> ${apartment.numberOfBathrooms}</p>
                <p><strong>Amenities:</strong> ${apartment.amenities.join(', ')}</p>
                <p><strong>Available:</strong> ${apartment.isAvailable ? 'Yes' : 'No'}</p>
            `;
            container.appendChild(card);
        });
    }

    async function createApartment() {
        const apartment = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            location: document.getElementById('apartmentLocation').value,
            pricePerNight: parseFloat(document.getElementById('price').value),
            numberOfBedrooms: parseInt(document.getElementById('bedroomsCount').value),
            numberOfBathrooms: parseInt(document.getElementById('bathrooms').value),
            amenities: document.getElementById('amenities').value.split(',').map(a => a.trim()),
            isAvailable: document.getElementById('isAvailable').checked
        };

        const result = await postData(`${API_BASE_URL}/apartments`, apartment);
        if (result) {
            alert('Apartment created successfully!');
            document.getElementById('apartmentForm').reset();
            await loadApartments();
        }
    }
}

// Bookings page functionality
if (window.location.pathname.endsWith('bookings.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadBookings();

        document.getElementById('bookingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await createBooking();
        });
    });

    async function loadBookings() {
        // In a real app, you'd get userId from authentication
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const bookings = await fetchData(`${API_BASE_URL}/bookings/${userId}`);
        if (bookings) displayBookings(bookings);
    }

    function displayBookings(bookings) {
        const container = document.getElementById('bookingsList');
        container.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            container.innerHTML = '<p>No bookings found</p>';
            return;
        }

        bookings.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            card.innerHTML = `
                <h3>Booking #${booking.id.substring(0, 8)}</h3>
                <p><strong>Apartment ID:</strong> ${booking.apartmentId.substring(0, 8)}</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
            `;
            container.appendChild(card);
        });
    }

    async function createBooking() {
        const booking = {
            apartmentId: document.getElementById('apartmentId').value,
            userId: document.getElementById('userId').value,
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            totalPrice: parseFloat(document.getElementById('totalPrice').value)
        };

        const result = await postData(`${API_BASE_URL}/bookings`, booking);
        if (result) {
            alert('Booking created successfully!');
            document.getElementById('bookingForm').reset();
            await loadBookings();
        }
    }
}