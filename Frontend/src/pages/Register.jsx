import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Technician');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const calculateStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[a-z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return score; // 0 to 5
    };

    const strength = calculateStrength(password);
    const isPasswordValid = strength === 5;

    // Determine bar color based on strength
    const getStrengthColor = () => {
        if (strength <= 1) return '#E53E3E'; // Red
        if (strength === 2) return '#DD6B20'; // Orange
        if (strength === 3) return '#D69E2E'; // Yellow
        if (strength === 4) return '#38A169'; // Light green
        if (strength === 5) return '#16A34A'; // Green
        return '#E2E8F0';
    };

    const validateForm = () => {
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!isPasswordValid) {
            setError('Password must be at least 6 characters, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            await register(fullName, email, password, role);
            // Registration automatically logs in, so we redirect to dashboard
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to create an account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create an Account</h2>
                    <p>Join us to access the Alarm Log Viewer</p>
                </div>
                
                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div className="password-strength-wrapper">
                                <div className="password-strength-bar-bg">
                                    <div 
                                        className="password-strength-bar-fill" 
                                        style={{ 
                                            width: `${(strength / 5) * 100}%`,
                                            backgroundColor: getStrengthColor()
                                        }}
                                    ></div>
                                </div>
                                <p className="password-rules-text" style={{ color: isPasswordValid ? '#16A34A' : '#718096' }}>
                                    {isPasswordValid ? '✅ Strong Password' : 'Requires: 6+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol.'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="auth-select"
                        >
                            <option value="Technician">Technician</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading || (password.length > 0 && !isPasswordValid)}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
