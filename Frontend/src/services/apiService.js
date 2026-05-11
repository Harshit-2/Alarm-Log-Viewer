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
        ...options.headers
    };

    const response = await fetch(`${GATEWAY_URL}${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'API request failed');
    }

    return response.json();
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
