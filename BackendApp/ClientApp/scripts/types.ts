// ClientApp/src/types.ts

// --- Podstawowe Struktury Błędów i Odpowiedzi ---
export interface ApiError { // Dla błędów GraphQL
    message: string;
    code?: string;
    path?: string[];
    extensions?: any;
    locations?: any[];
}

export interface ApiErrorResponse { // Dla błędów REST API (np. ProblemDetails)
    message?: string;
    Message?: string; // Często używane w ASP.NET
    title?: string;
    errors?: { [key: string]: string[] }; // Błędy walidacji
    [key: string]: any;
}

export interface GraphQLResponse<T> {
    data?: T;
    errors?: ApiError[]; // Używa zdefiniowanego ApiError
}

// --- Typy związane z Użytkownikiem i Autentykacją ---
export interface DecodedJwtToken {
    exp?: number;
    iat?: number;
    sub?: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
    role?: string | string[];
    nameid?: string;
    unique_name?: string;
    email?: string;
    [key: string]: any;
}

export interface LoginSuccessResponse {
    token: string;
    [key: string]: any;
}

export interface RegistrationSuccessResponse {
    [key: string]: any;
}

// --- Typy związane z Recenzjami (Review) ---
export interface Review {
    id: string; // Globalne ID GraphQL
    comment: string;
    rating: number;
    user?: { name: string };
}

export interface AddReviewInput {
    apartmentId: string; // UUID mieszkania (databaseId)
    rating: number;
    comment: string;
}

export interface AddReviewPayload {
    review?: Review | null;
    errors?: ApiError[] | null;
}

export interface AddReviewMutationData { // 'Data' na końcu nazwy dla spójności z innymi typami danych zapytań/mutacji
    addReview: AddReviewPayload;
}

export interface DeleteReviewMutationData {
    deleteReview: boolean | null;
}

// --- Typy związane z Mieszkaniami (Apartment) ---
export interface ApartmentForSelect {
    databaseId: string;
    name: string;
    pricePerNight: number | null;
}

export interface ApartmentsForSelectQueryData {
    apartments: {
        nodes: ApartmentForSelect[];
    };
}

export interface Apartment {
    id: string; // Globalne ID GraphQL
    databaseId: string; // UUID
    name: string;
    description: string;
    location: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    amenities: string[];
    isAvailable: boolean;
    pricePerNight: number;
    reviews?: {
        nodes: Review[]; // Używa zdefiniowanego Review
        totalCount: number;
    };
}

export interface AddApartmentInput {
    name: string;
    description: string;
    location: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    amenities: string[];
    isAvailable: boolean;
    pricePerNight: number;
}

export interface UpdateApartmentInput extends Partial<AddApartmentInput> {
    id: string; // To jest databaseId (UUID) mieszkania do aktualizacji
}

export interface AddApartmentMutationPayload {
    addApartment: {
        id: string; // Globalne ID GraphQL nowo utworzonego mieszkania
        name: string;
    };
}

export interface UpdateApartmentMutationPayload {
    updateApartment: Apartment; // Zakładamy, że mutacja zwraca cały zaktualizowany obiekt Apartment
}

export interface DeleteApartmentMutationPayload {
    deleteApartment: boolean;
}


// --- Typy związane z Rezerwacjami (Booking) ---
export interface BookingApartmentInfo {
    id: string; // Globalne ID GraphQL mieszkania
    name: string;
    location?: string;
}

export interface Booking {
    id: string; // Globalne ID GraphQL
    databaseId: string; // UUID z bazy danych
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    apartment?: BookingApartmentInfo | null;
    user?: { // Informacje o użytkowniku, który dokonał rezerwacji
        id: string; // Globalne ID GraphQL użytkownika
        name: string;
        email?: string;
    };
}

export interface NewBookingRESTInput {
    apartmentId: string; // UUID mieszkania (databaseId)
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
}

export interface NewBookingRESTSuccessResponse {
    id: string; // UUID nowej rezerwacji (databaseId)
    [key: string]: any;
}

export interface AllBookingsAdminQueryData {
    allBookingsForAdmin: {
        nodes: Booking[];
        totalCount: number;
    };
}

export interface DeleteBookingMutationPayload { // Upewnijmy się, że jest zdefiniowany
    deleteBooking: boolean;
}

// --- Typy związane z Profilem Użytkownika ---
export interface UserProfile {
    id: string; // Globalne ID GraphQL użytkownika
    name: string;
    email: string;
    bookings?: {
        nodes: Booking[];
        totalCount: number;
    } | null;
}

export interface MyProfileQueryData {
    myProfile: UserProfile | null;
}