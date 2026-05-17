import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TechnicianDashboard from '../components/TechnicianDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import './Auth.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    const role = user?.role;

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
                {role === 'Admin' ? (
                    <AdminDashboard />
                ) : role === 'Supervisor' ? (
                    <SupervisorDashboard />
                ) : (
                    <TechnicianDashboard userId={user?.userId} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
