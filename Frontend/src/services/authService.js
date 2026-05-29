const GATEWAY_URL = 'http://localhost:5065';
const SECRET_KEY = 'I am Bond, James Bond. I am the best spy in the world. I am invincible.';


const generateUserId = () => {
    return 'U' + Math.floor(10000 + Math.random() * 90000); 
};

export const authService = {
    async login(email, password) {
        
        let userRes;
        try {
            userRes = await fetch(`${GATEWAY_URL}/userSvc/credentials?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        } catch {
            throw new Error('Cannot connect to the server. Please make sure all backend services are running.');
        }
        
        if (!userRes.ok) {
            throw new Error('Invalid email or password.');
        }
        
        const userData = await userRes.json();
        
        
        let authRes;
        try {
            authRes = await fetch(`${GATEWAY_URL}/authSvc/${encodeURIComponent(userData.username)}/${encodeURIComponent(userData.role)}/${encodeURIComponent(SECRET_KEY)}`);
        } catch {
            throw new Error('Cannot connect to the authentication service. Please try again.');
        }
        
        if (!authRes.ok) {
            throw new Error('Failed to generate authentication token.');
        }
        
        const token = await authRes.text();
        
        return {
            user: userData,
            token: token
        };
    },

    async register(fullName, email, password, role, adminKey) {
        const currentDate = new Date().toISOString().split('T')[0];

        const newUser = {
            userId: generateUserId(),
            username: email,
            password: password,
            role: role || "Technician",
            createdAt: currentDate
        };

        const url = adminKey ? `${GATEWAY_URL}/userSvc?adminKey=${encodeURIComponent(adminKey)}` : `${GATEWAY_URL}/userSvc`;

        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
        } catch {
            throw new Error('Cannot connect to the server. Please make sure all backend services are running.');
        }

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Registration failed. Please try again.');
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
