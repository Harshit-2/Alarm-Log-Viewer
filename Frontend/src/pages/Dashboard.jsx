import React from 'react';
import { useAuth } from '../context/AuthContext';
import TechnicianDashboard from '../components/TechnicianDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import alarmLogo from '../assets/alarm-logo.png';
import './Auth.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    const role = user?.role;

    return (
        <>
            <div className="dashboard-container">
                <nav className="dashboard-nav glass-navbar">
                    <h1>
                        <img src={alarmLogo} alt="Alarm Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        Alarm Log Viewer
                    </h1>
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
