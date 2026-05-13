import { authService } from './authService';

const GATEWAY_URL = 'http://localhost:5065';

const fetchWithAuth = async (url, options = {}) => {
    try {
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(`${GATEWAY_URL}${url}`, {
            cache: 'no-store',
            signal: controller.signal,
            ...options,
            headers
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorText = '';
            try { errorText = await response.text(); } catch(e) {}
            throw new Error(errorText || `API request failed with status ${response.status}`);
        }

        const text = await response.text();
        if (!text) return null;
        
        try {
            return JSON.parse(text);
        } catch {
            return text; // Return plain text if not JSON
        }
    } catch (error) {
        console.error(`API Error on ${url}:`, error);
        throw new Error(error.name === 'AbortError' ? 'Request timed out. Please try again later.' : 'Something went wrong, please try again later.');
    }
};

export const apiService = {
    // Users
    getUsers: () => fetchWithAuth('/userSvc'),
    getUser: (id) => fetchWithAuth(`/userSvc/${id}`),
    updateUser: (id, user) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
    }),
    deleteUser: (id) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'DELETE'
    }),

    // Rooms
    getRooms: () => fetchWithAuth('/roomSvc'),
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
    getTemperaturesByRoom: (roomId) => fetchWithAuth(`/temperatureSvc/room/${roomId}`),
    setTemperature: (temperature) => fetchWithAuth('/temperatureSvc', {
        method: 'POST',
        body: JSON.stringify(temperature)
    }),

    // Alerts
    getAlerts: () => fetchWithAuth('/alertSvc'),
    getAlertsByRoom: (roomId) => fetchWithAuth(`/alertSvc/room/${roomId}`),
    createAlert: (alert) => fetchWithAuth('/alertSvc', {
        method: 'POST',
        body: JSON.stringify(alert)
    })
};
