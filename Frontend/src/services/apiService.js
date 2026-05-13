import { authService } from './authService';

const GATEWAY_URL = 'http://localhost:5065';

const fetchWithAuth = async (url, options = {}) => {
    const token = authService.getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers
    };

    try {
        const response = await fetch(`${GATEWAY_URL}${url}`, {
            cache: 'no-store',
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'API request failed with status ' + response.status);
        }

        const text = await response.text();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch {
            return text; // Return plain text if not JSON
        }
    } catch (err) {
        console.error("API Fetch Error:", err);
        throw new Error(err.message === "Failed to fetch" ? "Network error: Server might be offline." : err.message);
    }
};

export const apiService = {
    // Users
    getUsers: () => fetchWithAuth('/userSvc').then(data => Array.isArray(data) ? data : []).catch(() => []),
    getUser: (id) => fetchWithAuth(`/userSvc/${id}`),
    updateUser: (id, user) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
    }),
    deleteUser: (id) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'DELETE'
    }),

    // Rooms
    getRooms: () => fetchWithAuth('/roomSvc').then(data => Array.isArray(data) ? data : []).catch(() => []),
    getRoom: (id) => fetchWithAuth(`/roomSvc/${id}`),
    createRoom: (room) => fetchWithAuth('/roomSvc', {
        method: 'POST',
        body: JSON.stringify(room)
    }),
    updateRoom: (id, room) => fetchWithAuth(`/roomSvc/${id}`, {
        method: 'PUT',
        body: JSON.stringify(room)
    }),
    deleteRoom: (id) => fetchWithAuth(`/roomSvc/${id}`, {
        method: 'DELETE'
    }),

    // Temperatures
    getTemperaturesByRoom: (roomId) => fetchWithAuth(`/temperatureSvc/room/${roomId}`).then(data => Array.isArray(data) ? data : []).catch(() => []),
    setTemperature: (temperature) => fetchWithAuth('/temperatureSvc', {
        method: 'POST',
        body: JSON.stringify(temperature)
    }),

    // Alerts
    getAlerts: () => fetchWithAuth('/alertSvc').then(data => Array.isArray(data) ? data : []).catch(() => []),
    getAlertsByRoom: (roomId) => fetchWithAuth(`/alertSvc/room/${roomId}`).then(data => Array.isArray(data) ? data : []).catch(() => []),
    createAlert: (alert) => fetchWithAuth('/alertSvc', {
        method: 'POST',
        body: JSON.stringify(alert)
    })
};
