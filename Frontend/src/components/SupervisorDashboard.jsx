import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const SupervisorDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'users'

    useEffect(() => {
        fetchAllData();
        
        // Polling for updates every 10 seconds to see new alerts dynamically
        const interval = setInterval(() => {
            fetchAllData();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            const [roomsData, alertsData, usersData] = await Promise.all([
                apiService.getRooms(),
                apiService.getAlerts(),
                apiService.getUsers().catch(() => []) // Catch error if User API fails
            ]);
            setRooms(roomsData);
            setAlerts(alertsData || []);
            setUsers(usersData || []);
        } catch (err) {
            setError('Failed to load dashboard data. Ensure all services are running.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && rooms.length === 0) return <div className="loading-state">Loading global monitoring dashboard...</div>;

    // Helper to find if a room has alerts
    const getRoomAlerts = (roomId) => {
        return alerts.filter(a => a.roomId === roomId);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiService.deleteUser(userId);
            fetchAllData(); // Refresh the list
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-flex">
                <h2>Global System Dashboard</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="tabs-container">
                        <button 
                            className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
                            onClick={() => setActiveTab('monitoring')}
                        >
                            Monitoring
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                    </div>
                    <div className="status-badge">
                        <span className="dot pulse-green"></span> System Active
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {activeTab === 'monitoring' && (
                <>
                    <div className="supervisor-stats">
                        <div className="stat-card">
                            <h3>Total Rooms Monitored</h3>
                            <div className="stat-value">{rooms.length}</div>
                        </div>
                        <div className="stat-card alert-stat">
                            <h3>Total Alerts Detected</h3>
                            <div className="stat-value text-red">{alerts.length}</div>
                        </div>
                    </div>

                    <h3>Room Overview</h3>
                    {rooms.length === 0 ? (
                        <div className="empty-state">
                            <p>No rooms are currently registered in the system.</p>
                        </div>
                    ) : (
                        <div className="rooms-grid">
                            {rooms.map(room => {
                                const roomAlerts = getRoomAlerts(room.roomId);
                                const hasAlert = roomAlerts.length > 0;
                                const latestAlert = hasAlert ? roomAlerts[roomAlerts.length - 1] : null;

                                const statusClass = hasAlert 
                                    ? (latestAlert.status === "Too Hot" ? "too-hot" : "too-cold") 
                                    : "safe-active";

                                return (
                                    <div key={room.roomId} className={`room-card ${hasAlert ? 'alert-active' : ''} ${statusClass}`}>
                                        <div className="room-header">
                                            <h3>{room.roomName}</h3>
                                            {hasAlert && (
                                                <div className="blinking-alert-indicator">
                                                    <span className="pulse-red"></span> ALERT
                                                </div>
                                            )}
                                        </div>
                                        <div className="room-details">
                                            <p><strong>ID:</strong> {room.roomId}</p>
                                            <p><strong>Safe Range:</strong> {room.minTemp}°C - {room.maxTemp}°C</p>
                                            
                                            {hasAlert && (
                                                <div className="alert-details">
                                                    <p className="text-red"><strong>Status:</strong> {latestAlert.status}</p>
                                                    <p className="text-red"><strong>Recorded Temp:</strong> {latestAlert.temperature}°C</p>
                                                    <p className="alert-time">At: {new Date(latestAlert.alertTime).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'users' && (
                <div className="users-management">
                    <h3>User Management</h3>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.userId}>
                                        <td>{u.userId}</td>
                                        <td>{u.username}</td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td>{u.createdAt}</td>
                                        <td>
                                            <button 
                                                className="action-btn"
                                                style={{ padding: '0.4rem 0.8rem', marginTop: 0, borderColor: '#ef4444', color: '#ef4444' }}
                                                onClick={() => handleDeleteUser(u.userId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
