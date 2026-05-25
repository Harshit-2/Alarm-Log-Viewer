import React from 'react';
import { useAuth } from '../context/AuthContext';
import TechnicianDashboard from '../components/TechnicianDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import './Auth.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    const role = user?.role;

    return (
        <>
            {/* Ambient Background Layer — sits behind everything */}
            <div className="ambient-bg">
                <div className="ambient-orb ambient-orb--primary"></div>
                <div className="ambient-orb ambient-orb--secondary"></div>
                <div className="ambient-orb ambient-orb--accent"></div>
            </div>

            <div className="dashboard-container">
                <nav className="dashboard-nav glass-navbar">
                    <h1>Alarm Log Viewer</h1>
                    <div className="nav-user-info">
                        <div className="nav-user-meta">
                            <span className="nav-user-name">{user?.username}</span>
                            <span className={`nav-role-pill ${user?.role}`}>{user?.role}</span>
                        </div>
                        <div className="nav-divider"></div>
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
        </>
    );
};

export default Dashboard;
