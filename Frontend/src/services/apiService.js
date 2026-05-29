import { authService } from './authService';

const GATEWAY_URL = 'http://localhost:5065';

const fetchWithAuth = async (url, options = {}) => {
    const token = authService.getToken();
    
    if (!token) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers
    };

    let response;
    try {
        response = await fetch(`${GATEWAY_URL}${url}`, {
            cache: 'no-store',
            ...options,
            headers
        });
    } catch (networkError) {
        
        throw new Error('Cannot connect to the server. Please make sure all backend services are running.');
    }

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Server error (${response.status}). Please try again.`);
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return text; 
    }
};

export const apiService = {
    
    getUsers: () => fetchWithAuth('/userSvc'),
    getUser: (id) => fetchWithAuth(`/userSvc/${id}`),
    updateUser: (id, user) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
    }),
    deleteUser: (id) => fetchWithAuth(`/userSvc/${id}`, {
        method: 'DELETE'
    }),

    
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

    
    getTemperaturesByRoom: (roomId) => fetchWithAuth(`/temperatureSvc/room/${roomId}`),
    setTemperature: (temperature) => fetchWithAuth('/temperatureSvc', {
        method: 'POST',
        body: JSON.stringify(temperature)
    }),

    
    getAlerts: () => fetchWithAuth('/alertSvc'),
    getAlertsByRoom: (roomId) => fetchWithAuth(`/alertSvc/room/${roomId}`),
    getActivityLogs: () => fetchWithAuth('/alertSvc/logs'),
    createAlert: (alert) => fetchWithAuth('/alertSvc', {
        method: 'POST',
        body: JSON.stringify(alert)
    }),
    updateAlert: (id, alert) => fetchWithAuth(`/alertSvc/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alert)
    }),
    deleteAlert: (id) => fetchWithAuth(`/alertSvc/${id}`, {
        method: 'DELETE'
    })
};
