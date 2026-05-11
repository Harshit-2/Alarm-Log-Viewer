const GATEWAY_URL = 'http://localhost:5065';
const SECRET_KEY = 'I am Bond, James Bond. I am the best spy in the world. I am invincible.';

// Simple helper for generating a random user ID for the C# backend which expects VARCHAR(6)
const generateUserId = () => {
    return 'U' + Math.floor(10000 + Math.random() * 90000); // e.g. U12345
};

export const authService = {
    async login(email, password) {
        // 1. Verify credentials with User API
        const userRes = await fetch(`${GATEWAY_URL}/userSvc/credentials?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        
        if (!userRes.ok) {
            throw new Error('Invalid email or password');
        }
        
        const userData = await userRes.json();
        
        // 2. Get JWT Token from Auth API
        const authRes = await fetch(`${GATEWAY_URL}/authSvc/${encodeURIComponent(userData.username)}/${encodeURIComponent(userData.role)}/${encodeURIComponent(SECRET_KEY)}`);
        
        if (!authRes.ok) {
            throw new Error('Failed to generate authentication token');
        }
        
        const token = await authRes.text();
        
        return {
            user: userData,
            token: token
        };
    },

    async register(fullName, email, password, role) {
        const currentDate = new Date().toISOString().split('T')[0];

        const newUser = {
            userId: generateUserId(),
            username: email,
            password: password,
            role: role || "Technician",
            createdAt: currentDate
        };

        const res = await fetch(`${GATEWAY_URL}/userSvc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Registration failed');
        }

        return await res.json();
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
};
