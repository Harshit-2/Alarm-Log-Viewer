import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TechnicianDashboard from '../components/TechnicianDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import './Auth.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    // We only have two roles: Technician and Supervisor
    const isSupervisor = user?.role === 'Supervisor';

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Alarm Log Viewer</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#a5b4fc', fontWeight: '500' }}>
                        {user?.username} ({user?.role})
                    </span>
                    <button onClick={logout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                {isSupervisor ? (
                    <SupervisorDashboard />
                ) : (
                    <TechnicianDashboard userId={user?.userId} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
