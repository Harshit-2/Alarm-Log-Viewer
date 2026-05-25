import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    const handleLogin = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="logo">AlarmLog System</div>
                <div>
                    <button className="cancel-btn" onClick={handleLogin} style={{ marginRight: '1rem', border: 'none' }}>
                        {user ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                    <button className="primary-btn" onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="landing-hero">
                {/* Left Side: Copy & CTA */}
                <div className="landing-copy">
                    <span className="badge-pill">Enterprise Monitoring 2.0</span>
                    <h1>
                        Next-Gen Alarm &<br />
                        <span>Temperature</span> Monitoring
                    </h1>
                    <p>
                        Keep your critical infrastructure safe with real-time alerts,
                        role-based access control, and stunning visual dashboards. 
                        Detect anomalies before they become emergencies.
                    </p>
                    <div className="landing-actions">
                        <button className="primary-btn" onClick={handleGetStarted} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Start Monitoring
                        </button>
                        <button className="cancel-btn" onClick={handleLogin} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Right Side: 3D Isometric Animation */}
                <div className="landing-3d-wrapper">
                    <div className="scene-3d">
                        {/* Floor shadow giving depth */}
                        <div className="floor-shadow"></div>

                        {/* Base Layer: Dashboard Mockup */}
                        <div className="glass-layer-3d layer-base">
                            <div className="mock-header"></div>
                            <div className="mock-grid">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="mock-card">
                                        <div className={`mock-line ${i === 1 ? 'red' : 'accent'}`}></div>
                                        <div className="mock-line short"></div>
                                        <div className="mock-line"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Layer 1: Alert Mockup */}
                        <div className="glass-layer-3d layer-float-1">
                            <div className="mock-alert-icon"></div>
                            <div className="mock-line red" style={{ width: '80%' }}></div>
                            <div className="mock-line short"></div>
                        </div>

                        {/* Floating Layer 2: Stat Widget Mockup */}
                        <div className="glass-layer-3d layer-float-2">
                            <div className="mock-line accent" style={{ width: '60%' }}></div>
                            <div className="mock-stat">24.5°</div>
                            <div className="mock-line short"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
