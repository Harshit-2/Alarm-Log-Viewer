import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const SupervisorDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            const [roomsData, alertsData] = await Promise.all([
                apiService.getRooms(),
                apiService.getAlerts()
            ]);
            setRooms(roomsData);
            setAlerts(alertsData || []);
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

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-flex">
                <h2>Global Monitoring System</h2>
                <div className="status-badge">
                    <span className="dot pulse-green"></span> System Active
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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

                        return (
                            <div key={room.roomId} className={`room-card ${hasAlert ? 'alert-active' : ''}`}>
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
        </div>
    );
};

export default SupervisorDashboard;
