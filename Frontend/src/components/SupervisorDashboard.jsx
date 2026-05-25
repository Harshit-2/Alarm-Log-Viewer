import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import './Dashboards.css';// --- Extracted Room Card Component with Carousel Logic ---
const SupervisorRoomCard = ({ room, alerts, temperatures, onResolve, onDelete, fetchAllData }) => {
    // Sort alerts: newest first
    const sortedAlerts = [...alerts].sort((a, b) => new Date(b.alertTime) - new Date(a.alertTime));
    
    // State for carousel pagination
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasAlert = sortedAlerts.length > 0;
    
    // Reset index if alerts change and current index is out of bounds
    useEffect(() => {
        if (currentIndex >= sortedAlerts.length) {
            setCurrentIndex(Math.max(0, sortedAlerts.length - 1));
        }
    }, [sortedAlerts.length, currentIndex]);

    // The currently viewed alert determines the background and animation
    const currentAlert = hasAlert ? sortedAlerts[currentIndex] : null;
    const statusClass = hasAlert
        ? (currentAlert.status === "Too Hot" ? "too-hot" : "too-cold")
        : "safe-active";

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedAlerts.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < sortedAlerts.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className={`room-card stacked-card ${hasAlert ? 'alert-active' : ''} ${statusClass}`}>
            {/* The stacked visual effect if multiple alerts exist */}
            {sortedAlerts.length > 1 && (
                <>
                    <div className="card-stack-layer layer-1"></div>
                    <div className="card-stack-layer layer-2"></div>
                </>
            )}

            <div className="room-header">
                <h3>{room.roomName}</h3>
                {hasAlert && (
                    <div className="alert-badge-container">
                        <div className="blinking-alert-indicator">
                            <span className="pulse-red"></span> {sortedAlerts.length > 1 ? `${sortedAlerts.length} ALERTS` : 'ALERT'}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="room-details">
                <p><strong>ID:</strong> {room.roomId}</p>
                <p><strong>Safe Range:</strong> {room.minTemp}°C - {room.maxTemp}°C</p>

                {temperatures[room.roomId] ? (
                    <p><strong>Latest Temp:</strong> {temperatures[room.roomId].temperatureValue}°C
                        <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '0.4rem' }}>
                            at {new Date(temperatures[room.roomId].recordedAt).toLocaleTimeString()}
                        </span>
                    </p>
                ) : (
                    <p style={{ color: '#718096', fontSize: '0.85rem' }}>No temperature recorded yet</p>
                )}

                {/* Only display the current alert in the carousel */}
                {hasAlert && (
                    <div className="alert-carousel-viewport">
                        <div key={currentAlert.alertId} className="alert-details animate-fadeIn">
                            <p className="text-red"><strong>Status:</strong> {currentAlert.status}</p>
                            <p className="text-red"><strong>Recorded Temp:</strong> {currentAlert.temperature}°C</p>
                            <p className="alert-time">At: {new Date(currentAlert.alertTime).toLocaleString()}</p>
                            
                            {currentAlert.reason ? (
                                <p style={{ color: '#D97706', marginTop: '0.4rem' }}>
                                    <strong>Technician reason:</strong> {currentAlert.reason}
                                </p>
                            ) : (
                                <p style={{ color: '#718096', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                                    No reason filed yet by technician.
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button
                                    className="action-btn"
                                    style={{ flex: 1, marginTop: 0, fontSize: '0.8rem', padding: '0.5rem', borderColor: '#16A34A', color: '#16A34A', background: 'transparent' }}
                                    onClick={() => onResolve(currentAlert)}
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    className="action-btn"
                                    style={{ flex: 1, marginTop: 0, fontSize: '0.8rem', padding: '0.5rem', borderColor: '#E53E3E', color: '#E53E3E', background: 'transparent' }}
                                    onClick={() => onDelete(currentAlert)}
                                >
                                    Delete Alert
                                </button>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {sortedAlerts.length > 1 && (
                            <div className="carousel-controls">
                                <button className="carousel-btn" onClick={handlePrev} aria-label="Previous alert">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <div className="carousel-dots">
                                    {sortedAlerts.map((_, i) => (
                                        <span key={i} className={`dot ${i === currentIndex ? 'active' : ''}`} />
                                    ))}
                                </div>
                                <button className="carousel-btn" onClick={handleNext} aria-label="Next alert">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Extracted Component ---

const SupervisorDashboard = () => {
    const { user: currentUser } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [temperatures, setTemperatures] = useState({}); // Map of roomId -> latest temp reading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState(''); // Error shown when deleting a user fails
    const [warnings, setWarnings] = useState([]); // Tracks which services failed
    const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'users'

    // Resolve Alert Modal state
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [alertToResolve, setAlertToResolve] = useState(null); // Which alert is being resolved
    const [resolveNote, setResolveNote] = useState('');          // Supervisor's resolution note
    const [resolveError, setResolveError] = useState('');

    useEffect(() => {
        fetchAllData();

        // Polling for updates every 5 seconds to see new alerts dynamically
        const interval = setInterval(() => {
            fetchAllData();
        }, 5000);

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

        // Fetch Activity Logs — optional
        try {
            const logsData = await apiService.getActivityLogs();
            setActivityLogs(logsData || []);
        } catch (err) {
            newWarnings.push('⚠️ Alert Service (Logs) is unavailable: ' + err.message);
            setActivityLogs([]);
        }

        // Fetch Temperatures for each room — using Promise.allSettled so one
        // room with no data doesn't crash the rest
        if (fetchedRooms.length > 0) {
            // Promise.allSettled waits for ALL fetches to finish,
            // whether they succeed or fail — no crash!
            const tempResults = await Promise.allSettled(
                fetchedRooms.map(room => apiService.getTemperaturesByRoom(room.roomId))
            );

            // Build a map: roomId -> latest temperature reading
            const tempMap = {};
            let failedCount = 0;

            fetchedRooms.forEach((room, index) => {
                const result = tempResults[index];

                if (result.status === 'fulfilled') {
                    // ✅ Success — store the latest reading if any exist
                    const readings = result.value;
                    if (readings && readings.length > 0) {
                        tempMap[room.roomId] = readings[readings.length - 1];
                    }
                    // If readings is empty [], that just means no temp recorded yet — totally fine
                } else {
                    // ❌ This room's fetch failed (no data or service error)
                    failedCount++;
                }
            });

            setTemperatures(tempMap);

            // Only warn if ALL rooms failed — that means the service is truly down
            // If only some failed, it just means those rooms have no temperature data yet
            if (failedCount === fetchedRooms.length) {
                newWarnings.push('⚠️ Temperature Service is unavailable: ' + tempResults[0].reason?.message);
            }
        }

        setWarnings(newWarnings);
        setError(''); // Clear any old global error
        setLoading(false);
    };

    if (loading && rooms.length === 0) return <div className="loading-state">Loading global monitoring dashboard...</div>;

    // Helper to find if a room has ACTIVE (unresolved) alerts
    // Alerts with status "Resolved" are ignored — the room is back to normal
    const getRoomAlerts = (roomId) => {
        return alerts.filter(a => a.roomId === roomId && a.status !== "Resolved");
    };

    // Count only active (unresolved) alerts for rooms that still exist
    const activeAlerts = alerts.filter(a =>
        a.status !== "Resolved" && rooms.some(r => r.roomId === a.roomId)
    );

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
                        <button
                            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('logs')}
                        >
                            Logs
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
                            <h3>Active Alerts</h3>
                            <div className="stat-value text-red">{activeAlerts.length}</div>
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
                                return (
                                    <SupervisorRoomCard 
                                        key={room.roomId}
                                        room={room}
                                        alerts={roomAlerts}
                                        temperatures={temperatures}
                                        onResolve={(alert) => {
                                            setAlertToResolve(alert);
                                            setResolveNote('');
                                            setResolveError('');
                                            setShowResolveModal(true);
                                        }}
                                        onDelete={async (alert) => {
                                            if (!window.confirm('Delete this alert permanently?')) return;
                                            try {
                                                await apiService.deleteAlert(alert.alertId);
                                                fetchAllData();
                                            } catch (err) {
                                                setDeleteError('Failed to delete alert: ' + err.message);
                                            }
                                        }}
                                        fetchAllData={fetchAllData}
                                    />
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
                        <div className="users-table-container">
                            {/* Floating Decorative Icons */}
                            <svg className="floating-icon float-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <svg className="floating-icon float-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <svg className="floating-icon float-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            <svg className="floating-icon float-at" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>

                            <table className="custom-table">
                                <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Created On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.userId}>
                                        <td>{u.userId}</td>
                                        <td>{u.username}</td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td>{u.createdAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="users-management">
                    <h3>Activity Logs</h3>
                    {activityLogs.length === 0 ? (
                        <p>No activity logs found.</p>
                    ) : (
                        <div className="users-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLogs.map(log => (
                                        <tr key={log.logId}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td><span className="role-badge Supervisor">{log.action}</span></td>
                                            <td>{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Resolve Alert Modal — supervisor writes what steps they took to fix the issue */}
            {showResolveModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Resolve Alert</h3>
                        <p className="modal-subtitle">
                            Please describe what the issue was and the steps taken to fix it.
                        </p>
                        {resolveError && <div className="error-message" style={{ marginBottom: '1rem' }}>{resolveError}</div>}
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setResolveError('');
                            try {
                                await apiService.updateAlert(alertToResolve.alertId, {
                                    ...alertToResolve,
                                    status: 'Resolved',
                                    resolutionNote: resolveNote
                                });
                                setShowResolveModal(false);
                                setResolveNote('');
                                fetchAllData();
                            } catch (err) {
                                setResolveError('Failed to resolve: ' + err.message);
                            }
                        }}>
                            <div className="form-group">
                                <label>Resolution Notes <span style={{ color: '#718096', fontSize: '0.8rem' }}>(optional)</span></label>
                                <textarea
                                    rows={4}
                                    value={resolveNote}
                                    onChange={(e) => setResolveNote(e.target.value)}
                                    placeholder="e.g. The AC unit was overheating due to a clogged filter. The filter was cleaned and the unit was restarted. Temperature returned to normal."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#F7F8FA', color: '#2D3748', border: '1px solid #E2E8F0', resize: 'vertical' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowResolveModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Submit Resolution</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
