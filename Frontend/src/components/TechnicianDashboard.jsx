import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const TechnicianDashboard = ({ userId }) => {
    const [rooms, setRooms] = useState([]);
    const [allAlerts, setAllAlerts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newRoom, setNewRoom] = useState({ id: null, name: '', minTemp: 0, maxTemp: 100 });
    const [viewMode, setViewMode] = useState('all'); 
    const [modalError, setModalError] = useState(''); 

    
    const [showTempModal, setShowTempModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [tempError, setTempError] = useState(''); 

    
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [alertForReason, setAlertForReason] = useState(null); 
    const [reasonValue, setReasonValue] = useState('');
    const [reasonError, setReasonError] = useState('');

    useEffect(() => {
        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 50000); 
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
            
        }
        setLoading(false);
    };

    
    const getActiveAlert = (roomId) => {
        return allAlerts.find(a => a.roomId === roomId && a.status !== 'Resolved') || null;
    };

    const handleCreateOrUpdateRoom = async (e) => {
        e.preventDefault();
        setModalError(''); 

        
        if (parseFloat(newRoom.maxTemp) <= parseFloat(newRoom.minTemp)) {
            setModalError('Maximum temperature must be greater than minimum temperature.');
            return; 
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
                const roomId = 'R' + Math.floor(10000 + Math.random() * 90000); 
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
            fetchData(); 
        } catch (err) {
            
            setModalError(`Failed to ${isEditing ? 'update' : 'create'} room: ` + err.message);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
        try {
            
            try {
                await apiService.deleteAlertsByRoom(roomId);
            } catch {
                
            }

            await apiService.deleteRoom(roomId);
            fetchData();
        } catch (err) {
            
            setError('Failed to delete room: ' + err.message);
        }
    };

    
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
            fetchData(); 
        } catch (err) {
            setReasonError('Failed to file reason: ' + err.message);
        }
    };

    const handleSetTemperature = async (e) => {
        e.preventDefault();
        setTempError(''); 
        try {
            const tempVal = parseFloat(tempValue);
            
            
            const readingId = 'T' + Math.floor(10000 + Math.random() * 90000);
            await apiService.setTemperature({
                readingId: readingId,
                roomId: selectedRoom.roomId,
                temperatureValue: tempVal,
                recordedAt: new Date().toISOString()
            });

            
            if (tempVal < selectedRoom.minTemp || tempVal > selectedRoom.maxTemp) {
                
                const alertId = 'A' + Math.floor(10000 + Math.random() * 90000);
                const status = tempVal < selectedRoom.minTemp ? "Too Cold" : "Too Hot";
                
                await apiService.createAlert({
                    alertId: alertId,
                    roomId: selectedRoom.roomId,
                    temperature: tempVal,
                    status: status,
                    alertTime: new Date().toISOString()
                });
                alert(`Warning! Temperature is ${status}. An alert has been generated for supervisors.`);
            } else {
                
                try {
                    const roomAlerts = await apiService.getAlertsByRoom(selectedRoom.roomId);
                    
                    
                    if (roomAlerts && roomAlerts.length > 0) {
                        for (const existingAlert of roomAlerts) {
                            
                            if (existingAlert.status !== "Resolved") {
                                await apiService.updateAlert(existingAlert.alertId, {
                                    ...existingAlert,
                                    status: "Resolved"
                                });
                            }
                        }
                    }
                } catch {
                    
                }
                alert('Temperature recorded successfully. All systems normal.');
            }

            setShowTempModal(false);
            setTempValue('');
            setTempError('');
            fetchData();
        } catch (err) {
            
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
                        <div key={room.roomId} className="room-card tech-card">
                            <div className="room-header">
                                <h3>{room.roomName}</h3>
                                <span className="room-id">{room.roomId}</span>
                            </div>
                            <div className="room-details">
                                <p><strong>Min Temp:</strong> {room.minTemp}°C</p>
                                <p><strong>Max Temp:</strong> {room.maxTemp}°C</p>
                                {}
                                {activeAlert && activeAlert.reason && (
                                    <p style={{ color: '#D97706', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        <strong>Reason filed:</strong> {activeAlert.reason}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button 
                                    className="primary-btn"
                                    style={{ marginTop: 0, flex: 1, padding: '0.6rem' }}
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
                                            style={{ marginTop: 0, flex: 1, borderColor: '#5C7CFA', color: '#5C7CFA', background: 'transparent' }}
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
                                            style={{ marginTop: 0, flex: 1, borderColor: '#E53E3E', color: '#E53E3E', background: 'transparent' }}
                                            onClick={() => handleDeleteRoom(room.roomId)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                                {}
                                {activeAlert && (
                                    <button
                                        className="action-btn"
                                        style={{ marginTop: 0, flex: 1, borderColor: '#DD6B20', color: '#DD6B20', background: 'transparent' }}
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

            {}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Room' : 'Create a New Room'}</h3>
                        {}
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

            {}
            {showTempModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Set Temperature for {selectedRoom?.roomName}</h3>
                        <p className="modal-subtitle">Safe range: {selectedRoom?.minTemp}°C - {selectedRoom?.maxTemp}°C</p>
                        {}
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

            {}
            {showReasonModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>File Reason for Alert</h3>
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
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#F7F8FA', color: '#2D3748', border: '1px solid #E2E8F0' }}
                                >
                                    <option value="">-- Choose a reason --</option>
                                    <option value="Equipment malfunction">Equipment malfunction</option>
                                    <option value="Power outage">Power outage</option>
                                    <option value="AC / Cooling failure">AC / Cooling failure</option>
                                    <option value="Ventilation issue">Ventilation issue</option>
                                    <option value="External heat source">External heat source</option>
                                    <option value="Human error">Human error</option>
                                    <option value="Under investigation">Under investigation</option>
                                    <option value="Other">Other</option>
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
