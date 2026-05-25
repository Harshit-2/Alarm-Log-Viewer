import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State for interactive 3D rotations and glare tracking
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, glareX: 0, glareY: 0 });

    // Track mouse movement globally over the container
    const handleMouseMove = (e) => {
        // Find center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Normalize mouse coordinates (-1 to 1)
        const xNormalized = (e.clientX - centerX) / centerX;
        const yNormalized = (e.clientY - centerY) / centerY;
        
        // Calculate max tilt (e.g. 25 degrees)
        const maxTilt = 25;
        
        setMousePos({
            // Tilt X goes up when mouse goes down
            x: -yNormalized * maxTilt,
            // Tilt Y goes right when mouse goes right
            y: xNormalized * maxTilt,
            // Glare moves exactly opposite to create light reflection illusion
            glareX: xNormalized * -50,
            glareY: yNormalized * -50
        });
    };

    // When mouse leaves the window, reset to neutral isometric view
    const handleMouseLeave = () => {
        setMousePos({ x: 45, y: -35, glareX: 0, glareY: 0 }); // Fallback isometric tilt
    };

    // Set initial isometric view on mount
    useEffect(() => {
        handleMouseLeave();
    }, []);

    const handleGetStarted = () => {
        if (user) navigate('/dashboard');
        else navigate('/register');
    };

    const handleLogin = () => {
        if (user) navigate('/dashboard');
        else navigate('/login');
    };

    return (
        <div 
            className="landing-container" 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
        >
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="logo">AlarmLog System</div>
                <div>
                    <button className="cancel-btn" onClick={handleLogin} style={{ marginRight: '1rem', border: 'none', pointerEvents: 'auto' }}>
                        {user ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                    <button className="primary-btn" onClick={handleGetStarted} style={{ pointerEvents: 'auto' }}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="landing-hero">
                
                {/* Left Side: Copy & CTA */}
                <div className="landing-copy">
                    <span className="badge-pill">Immersive UI Engine</span>
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

                {/* Right Side: Interactive 3D Holographic Core */}
                <div className="landing-3d-wrapper">
                    
                    {/* The primary scene that tilts based on state */}
                    <div 
                        className="scene-interactive"
                        style={{
                            transform: `rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg)`
                        }}
                    >
                        
                        {/* Deep Layer (Background Context) */}
                        <div className="core-layer layer-deep" style={{ transform: 'translateZ(-150px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                        </div>

                        {/* Base Ring Layer (Structure) */}
                        <div className="core-layer layer-ring" style={{ transform: 'translateZ(-50px)' }}></div>

                        {/* Middle Layer (Main Dashboard View) */}
                        <div className="core-layer layer-mid" style={{ transform: 'translateZ(50px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
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

                        {/* Top Layer (Floating Alert Context) */}
                        <div className="core-layer layer-top" style={{ transform: 'translateZ(180px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                            <div className="mock-alert-icon"></div>
                            <div style={{ flex: 1 }}>
                                <div className="mock-line red" style={{ width: '80%' }}></div>
                                <div className="mock-line short"></div>
                            </div>
                        </div>

                        {/* Peak Layer (Floating Stat Context) */}
                        <div className="core-layer layer-peak" style={{ transform: 'translateZ(280px)', background: 'rgba(255,255,255,0.95)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                            24°
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Landing;
