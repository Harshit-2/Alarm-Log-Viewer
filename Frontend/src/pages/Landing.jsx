import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, glareX: 0, glareY: 0 });

    const handleMouseMove = (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const xNormalized = (e.clientX - centerX) / centerX;
        const yNormalized = (e.clientY - centerY) / centerY;
        const maxTilt = 20; 
        
        setMousePos({
            x: -yNormalized * maxTilt,
            y: xNormalized * maxTilt,
            glareX: xNormalized * -50,
            glareY: yNormalized * -50
        });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 45, y: -35, glareX: 0, glareY: 0 }); 
    };

    useEffect(() => {
        handleMouseLeave();
    }, []);

    const handleGetStarted = () => {
        if (user) navigate('/dashboard');
        else navigate('/login');
    };

    const handleLogin = () => {
        if (user) navigate('/dashboard');
        else navigate('/login');
    };

    return (
        <div className="landing-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {}
            <nav className="landing-nav">
                <div className="logo">AlarmLog System</div>
                {}
            </nav>

            {}
            <div className="landing-hero">
                {}
                <div className="landing-copy">
                    <span className="badge-pill">Enterprise Command Center</span>
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
                        <button className="primary-btn" onClick={handleGetStarted} style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', pointerEvents: 'auto' }}>
                            {user ? 'Go to Dashboard →' : 'Get Started →'}
                        </button>
                    </div>
                </div>

                {}
                <div className="landing-3d-wrapper">
                    <div 
                        className="scene-interactive"
                        style={{ transform: `rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg)` }}
                    >
                        
                        {}
                        <div className="hf-layer hf-bg-map" style={{ transform: 'translateZ(-150px)' }}>
                            <div className="ms-node ms-node-1"></div>
                            <div className="ms-node ms-node-2"></div>
                            <div className="ms-node ms-node-3"></div>
                            <div className="ms-node ms-node-4"></div>
                            <div className="ms-line ms-line-1"></div>
                            <div className="ms-line ms-line-2"></div>
                        </div>

                        {}
                        <div className="hf-layer hf-main-dash" style={{ transform: 'translateZ(0px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                            
                            {}
                            <div className="hf-sidebar">
                                <div className="hf-nav-item active"></div>
                                <div className="hf-nav-item"></div>
                                <div className="hf-nav-item"></div>
                            </div>

                            {}
                            <div className="hf-content">
                                <div style={{ height: '20px', width: '30%', background: 'var(--slate-200)', borderRadius: '4px' }}></div>
                                
                                <div className="hf-chart-area">
                                    <svg width="0" height="0">
                                        <defs>
                                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <svg className="hf-svg-chart" viewBox="0 0 100 50" preserveAspectRatio="none">
                                        <path d="M0,50 L0,20 C20,10 30,40 50,20 C70,0 80,30 100,10 L100,50 Z" />
                                        <path className="hf-chart-line" d="M0,20 C20,10 30,40 50,20 C70,0 80,30 100,10" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="hf-layer hf-widget-stat" style={{ transform: 'translateZ(100px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                            <svg className="hf-ring-svg" viewBox="0 0 140 140">
                                <circle className="hf-ring-bg" cx="70" cy="70" r="60" />
                                <circle className="hf-ring-progress" cx="70" cy="70" r="60" />
                            </svg>
                            <div className="hf-stat-value">24<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>°C</span></div>
                            <div className="hf-stat-label">Average Temp</div>
                        </div>

                        {}
                        <div className="hf-layer hf-widget-alert" style={{ transform: 'translateZ(180px)' }}>
                            <div className="glare" style={{ transform: `translate(${mousePos.glareX}%, ${mousePos.glareY}%)` }}></div>
                            <div className="hf-radar">
                                <div className="hf-radar-dot"></div>
                            </div>
                            <div className="hf-alert-text">
                                <div className="hf-alert-title">CRITICAL: SERVER_02</div>
                                <div className="hf-alert-sub">Temperature exceeded safe threshold</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Landing;
