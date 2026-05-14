import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const TechnicianDashboard = ({ userId }) => {
    const [rooms, setRooms] = useState([]);
    const [allAlerts, setAllAlerts] = useState([]); // All alerts for all rooms
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newRoom, setNewRoom] = useState({ id: null, name: '', minTemp: 0, maxTemp: 100 });
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'
    const [modalError, setModalError] = useState(''); // Error shown inside Create/Edit modal

    // Set Temp Modal State
    const [showTempModal, setShowTempModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [tempError, setTempError] = useState(''); // Error shown inside Set Temp modal

    // File Reason Modal State
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [alertForReason, setAlertForReason] = useState(null); // The alert being explained
    const [reasonValue, setReasonValue] = useState('');
    const [reasonError, setReasonError] = useState('');

    useEffect(() => {
        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 50000); // Refresh data every 50 seconds to keep alerts up-to-date
        return () => clearInterval(interval);
    }, []);


    const fetchData = async () => {
        try {
            const data = await apiService.getRooms();
            setRooms(data);
        } catch (err) {
            setError('Failed to load rooms. ' + err.message);
        }
        try {
            const alertData = await apiService.getAlerts();
            setAllAlerts(alertData || []);
        } catch {
            // Alerts not critical — rooms still show even if alert fetch fails
        }
        setLoading(false);
    };

    // Returns the latest ACTIVE (unresolved) alert for a given room, or null
    const getActiveAlert = (roomId) => {
        return allAlerts.find(a => a.roomId === roomId && a.status !== 'Resolved') || null;
    };

    const handleCreateOrUpdateRoom = async (e) => {
        e.preventDefault();
        setModalError(''); // Clear any previous error

        // Validate: max temperature must be greater than min temperature
        if (parseFloat(newRoom.maxTemp) <= parseFloat(newRoom.minTemp)) {
            setModalError('Maximum temperature must be greater than minimum temperature.');
            return; // Stop here — do not call the API
        }

        try {
            if (isEditing) {
                await apiService.updateRoom(newRoom.id, {
                    roomId: newRoom.id,
                    roomName: newRoom.name,
                    minTemp: newRoom.minTemp,
                    maxTemp: newRoom.maxTemp,
                    createdByUserId: userId,
                    createdAt: new Date().toISOString().split('T')[0]
                });
            } else {
                const roomId = 'R' + Math.floor(10000 + Math.random() * 90000); // Generate R12345
                await apiService.createRoom({
                    roomId: roomId,
                    roomName: newRoom.name,
                    minTemp: newRoom.minTemp,
                    maxTemp: newRoom.maxTemp,
                    createdByUserId: userId,
                    createdAt: new Date().toISOString().split('T')[0]
                });
            }
            setShowCreateModal(false);
            setNewRoom({ id: null, name: '', minTemp: 0, maxTemp: 100 });
            setIsEditing(false);
            setModalError('');
            fetchData(); // Refresh the list
        } catch (err) {
            // Show error inside the modal instead of a browser alert popup
            setModalError(`Failed to ${isEditing ? 'update' : 'create'} room: ` + err.message);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
        try {
            // First, clean up all alerts associated with this room
            try {
                const roomAlerts = await apiService.getAlertsByRoom(roomId);
                if (roomAlerts && roomAlerts.length > 0) {
                    for (const existingAlert of roomAlerts) {
                        await apiService.deleteAlert(existingAlert.alertId);
                    }
                }
            } catch {
                // If alert cleanup fails, still proceed with room deletion
            }

            await apiService.deleteRoom(roomId);
            fetchData();
        } catch (err) {
            // Show the delete error in the main error banner (no modal is open during delete)
            setError('Failed to delete room: ' + err.message);
        }
    };

    // Handles filing a reason for an active alert
    const handleFileReason = async (e) => {
        e.preventDefault();
        setReasonError('');
        try {
            await apiService.updateAlert(alertForReason.alertId, {
                ...alertForReason,
                reason: reasonValue
            });
            setShowReasonModal(false);
            setReasonValue('');
            fetchData(); // Refresh so the filed reason appears
        } catch (err) {
            setReasonError('Failed to file reason: ' + err.message);
        }
    };

    const handleSetTemperature = async (e) => {
        e.preventDefault();
        setTempError(''); // Clear any previous error
        try {
            const tempVal = parseFloat(tempValue);
            
            // 1. Save Temperature Reading
            const readingId = 'T' + Math.floor(10000 + Math.random() * 90000);
            await apiService.setTemperature({
                readingId: readingId,
                roomId: selectedRoom.roomId,
                temperatureValue: tempVal,
                recordedAt: new Date().toISOString()
            });

            // 2. Check if it violates min/max bounds
            if (tempVal < selectedRoom.minTemp || tempVal > selectedRoom.maxTemp) {
                // Temperature is OUT OF RANGE — create a new alert
                const alertId = 'A' + Math.floor(10000 + Math.random() * 90000);
                const status = tempVal < selectedRoom.minTemp ? "Too Cold" : "Too Hot";
                
                await apiService.createAlert({
                    alertId: alertId,
                    roomId: selectedRoom.roomId,
                    temperature: tempVal,
                    status: status,
                    alertTime: new Date().toISOString()
                });
                alert(`⚠️ Warning! Temperature is ${status}. An alert has been generated for supervisors.`);
            } else {
                // Temperature is BACK IN RANGE — resolve any existing alerts for this room
                try {
                    const roomAlerts = await apiService.getAlertsByRoom(selectedRoom.roomId);
                    
                    // Update each unresolved alert to "Resolved" status
                    if (roomAlerts && roomAlerts.length > 0) {
                        for (const existingAlert of roomAlerts) {
                            // Only resolve alerts that are not already resolved
                            if (existingAlert.status !== "Resolved") {
                                await apiService.updateAlert(existingAlert.alertId, {
                                    ...existingAlert,
                                    status: "Resolved"
                                });
                            }
                        }
                    }
                } catch {
                    // If fetching/updating alerts fails, it's not critical — temp was still saved
                }
                alert('✅ Temperature recorded successfully. All systems normal.');
            }

            setShowTempModal(false);
            setTempValue('');
            setTempError('');
        } catch (err) {
            // Show error inside the modal instead of a browser alert popup
            setTempError('Failed to record temperature: ' + err.message);
        }
    };

    if (loading) return <div className="loading-state">Loading your rooms...</div>;

    const displayedRooms = viewMode === 'all' 
        ? rooms 
        : rooms.filter(room => room.createdByUserId === userId);

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-flex">
                <h2>{viewMode === 'all' ? 'All Rooms' : 'My Rooms'}</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="tabs-container">
                        <button 
                            className={`tab-btn ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => setViewMode('all')}
                        >
                            All Rooms
                        </button>
                        <button 
                            className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
                            onClick={() => setViewMode('mine')}
                        >
                            My Rooms
                        </button>
                    </div>
                    <button className="primary-btn" onClick={() => {
                        setIsEditing(false);
                        setNewRoom({ id: null, name: '', minTemp: 0, maxTemp: 100 });
                        setModalError('');
                        setShowCreateModal(true);
                    }}>
                        + Create New Room
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {displayedRooms.length === 0 ? (
                <div className="empty-state">
                    <p>{viewMode === 'all' ? 'There are no rooms registered in the system yet.' : "You haven't created any rooms yet."}</p>
                </div>
            ) : (
                <div className="rooms-grid">
                    {displayedRooms.map(room => {
                        const activeAlert = getActiveAlert(room.roomId);
                        return (
                        <div key={room.roomId} className="room-card safe-active">
                            <div className="room-header">
                                <h3>{room.roomName}</h3>
                                <span className="room-id">{room.roomId}</span>
                            </div>
                            <div className="room-details">
                                <p><strong>Min Temp:</strong> {room.minTemp}°C</p>
                                <p><strong>Max Temp:</strong> {room.maxTemp}°C</p>
                                {/* Show if a reason has already been filed for an active alert */}
                                {activeAlert && activeAlert.reason && (
                                    <p style={{ color: '#facc15', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        <strong>Reason filed:</strong> {activeAlert.reason}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button 
                                    className="action-btn"
                                    style={{ marginTop: 0, flex: 1 }}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setShowTempModal(true);
                                    }}
                                >
                                    Set Temp
                                </button>
                                {room.createdByUserId === userId && (
                                    <>
                                        <button 
                                            className="action-btn"
                                            style={{ marginTop: 0, flex: 1, borderColor: '#a5b4fc', color: '#a5b4fc', background: 'transparent' }}
                                            onClick={() => {
                                                setIsEditing(true);
                                                setNewRoom({ id: room.roomId, name: room.roomName, minTemp: room.minTemp, maxTemp: room.maxTemp });
                                                setShowCreateModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="action-btn"
                                            style={{ marginTop: 0, flex: 1, borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}
                                            onClick={() => handleDeleteRoom(room.roomId)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                                {/* File Reason button — only shown when there is an active (unresolved) alert */}
                                {activeAlert && (
                                    <button
                                        className="action-btn"
                                        style={{ marginTop: 0, flex: 1, borderColor: '#f97316', color: '#f97316', background: 'transparent' }}
                                        onClick={() => {
                                            setAlertForReason(activeAlert);
                                            setReasonValue(activeAlert.reason || '');
                                            setReasonError('');
                                            setShowReasonModal(true);
                                        }}
                                    >
                                        📋 File Reason
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                    })}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Room' : 'Create a New Room'}</h3>
                        {/* Show error inside the modal so the user sees it without the modal closing */}
                        {modalError && <div className="error-message" style={{ marginBottom: '1rem' }}>{modalError}</div>}
                        <form onSubmit={handleCreateOrUpdateRoom}>
                            <div className="form-group">
                                <label>Room Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                                    placeholder="e.g. Server Room A"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Min Temp (°C)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={newRoom.minTemp}
                                        onChange={(e) => setNewRoom({...newRoom, minTemp: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Temp (°C)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={newRoom.maxTemp}
                                        onChange={(e) => setNewRoom({...newRoom, maxTemp: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Create Room'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Temperature Modal */}
            {showTempModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Set Temperature for {selectedRoom?.roomName}</h3>
                        <p className="modal-subtitle">Safe range: {selectedRoom?.minTemp}°C - {selectedRoom?.maxTemp}°C</p>
                        {/* Show error inside the modal so the user sees it without the modal closing */}
                        {tempError && <div className="error-message" style={{ marginBottom: '1rem' }}>{tempError}</div>}
                        <form onSubmit={handleSetTemperature}>
                            <div className="form-group">
                                <label>Current Temperature (°C)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    required 
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="Enter current reading..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowTempModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Record Reading</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* File Reason Modal — appears when technician clicks "File Reason" on a room with an active alert */}
            {showReasonModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>📋 File Reason for Alert</h3>
                        <p className="modal-subtitle">
                            Room alert: <strong>{alertForReason?.status}</strong> at {alertForReason?.temperature}°C
                        </p>
                        {reasonError && <div className="error-message" style={{ marginBottom: '1rem' }}>{reasonError}</div>}
                        <form onSubmit={handleFileReason}>
                            <div className="form-group">
                                <label>Select Reason</label>
                                <select
                                    required
                                    value={reasonValue}
                                    onChange={(e) => setReasonValue(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
                                >
                                    <option value="">-- Choose a reason --</option>
                                    <option value="Equipment malfunction">Equipment malfunction</option>
                                    <option value="Power outage">Power outage</option>
                                    <option value="AC / Cooling failure">AC / Cooling failure</option>
                                    <option value="Ventilation issue">Ventilation issue</option>
                                    <option value="External heat source">External heat source</option>
                                    <option value="Human error">Human error</option>
                                    <option value="Under investigation">Under investigation</option>
                                    <option value="Other">Other (see notes below)</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowReasonModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Submit Reason</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianDashboard;
