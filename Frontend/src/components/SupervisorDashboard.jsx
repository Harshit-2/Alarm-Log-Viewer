import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const SupervisorDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [temperatures, setTemperatures] = useState({}); // Map of roomId -> latest temp reading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState(''); // Error shown when deleting a user fails
    const [warnings, setWarnings] = useState([]); // Tracks which services failed
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
        const newWarnings = [];
        let fetchedRooms = [];

        // Fetch Rooms — required for monitoring
        try {
            fetchedRooms = await apiService.getRooms() || [];
            setRooms(fetchedRooms);
        } catch (err) {
            newWarnings.push('⚠️ Room Service is unavailable: ' + err.message);
            setRooms([]);
        }

        // Fetch Alerts — optional, dashboard still works without them
        try {
            const alertsData = await apiService.getAlerts();
            setAlerts(alertsData || []);
        } catch (err) {
            newWarnings.push('⚠️ Alert Service is unavailable: ' + err.message);
            setAlerts([]);
        }

        // Fetch Users — optional, dashboard still works without them
        try {
            const usersData = await apiService.getUsers();
            setUsers(usersData || []);
        } catch (err) {
            newWarnings.push('⚠️ User Service is unavailable: ' + err.message);
            setUsers([]);
        }

        // Fetch Temperatures for each room — check if temperature service is running
        if (fetchedRooms.length > 0) {
            try {
                // Fetch temperatures for all rooms at the same time
                const tempResults = await Promise.all(
                    fetchedRooms.map(room => apiService.getTemperaturesByRoom(room.roomId))
                );

                // Build a map: roomId -> latest temperature reading
                const tempMap = {};
                fetchedRooms.forEach((room, index) => {
                    const readings = tempResults[index];
                    if (readings && readings.length > 0) {
                        // The last item in the array is the most recent reading
                        tempMap[room.roomId] = readings[readings.length - 1];
                    }
                });
                setTemperatures(tempMap);
            } catch (err) {
                newWarnings.push('⚠️ Temperature Service is unavailable: ' + err.message);
                setTemperatures({});
            }
        }

        setWarnings(newWarnings);
        setError(''); // Clear any old global error
        setLoading(false);
    };

    if (loading && rooms.length === 0) return <div className="loading-state">Loading global monitoring dashboard...</div>;

    // Helper to find if a room has alerts
    const getRoomAlerts = (roomId) => {
        return alerts.filter(a => a.roomId === roomId);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setDeleteError('');
        try {
            await apiService.deleteUser(userId);
            fetchAllData(); // Refresh the list
        } catch (err) {
            // Show inline error instead of a browser alert popup
            setDeleteError('Failed to delete user: ' + err.message);
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

            {/* Show individual service warnings */}
            {warnings.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    {warnings.map((msg, index) => (
                        <div key={index} className="error-message" style={{ marginBottom: '0.5rem' }}>
                            {msg}
                        </div>
                    ))}
                </div>
            )}

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

                                            {/* Show latest temperature reading from Temperature Service */}
                                            {temperatures[room.roomId] ? (
                                                <p><strong>Latest Temp:</strong> {temperatures[room.roomId].temperatureValue}°C
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.4rem' }}>
                                                        at {new Date(temperatures[room.roomId].recordedAt).toLocaleTimeString()}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No temperature recorded yet</p>
                                            )}
                                            
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
                    {/* Show delete error inline instead of a browser popup */}
                    {deleteError && <div className="error-message" style={{ marginBottom: '1rem' }}>{deleteError}</div>}
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
