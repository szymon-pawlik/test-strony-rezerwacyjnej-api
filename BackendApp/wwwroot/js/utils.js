export function parseJwt(token) {
    if (!token) {
        return null;
    }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error("Invalid JWT format: token does not have 3 parts.");
            return null;
        }
        const base64Url = parts[1];
        if (!base64Url) {
            console.error("Invalid JWT format: payload part is missing.");
            return null;
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (e) {
        console.error("Error parsing JWT token:", e.message || e);
        try {
            localStorage.removeItem('jwtToken');
        }
        catch (storageError) {
            console.error("Error removing token from localStorage:", storageError);
        }
        return null;
    }
}
//# sourceMappingURL=utils.js.map