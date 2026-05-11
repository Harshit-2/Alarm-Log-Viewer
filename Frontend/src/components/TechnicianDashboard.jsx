import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const TechnicianDashboard = ({ userId }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Create Room Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: '', minTemp: 0, maxTemp: 100 });

    // Set Temp Modal State
    const [showTempModal, setShowTempModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await apiService.getRooms();
            // Filter rooms for this technician, though depending on backend it might return all
            // If the backend has a /roomSvc/creator/{userId} we could use that, but we'll just filter here for safety.
            const userRooms = data.filter(r => r.createdByUserId === userId);
            setRooms(userRooms);
        } catch (err) {
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const roomId = 'R' + Math.floor(10000 + Math.random() * 90000); // Generate R12345
            await apiService.createRoom({
                roomId: roomId,
                roomName: newRoom.name,
                minTemp: newRoom.minTemp,
                maxTemp: newRoom.maxTemp,
                createdByUserId: userId,
                createdAt: new Date().toISOString().split('T')[0]
            });
            setShowCreateModal(false);
            setNewRoom({ name: '', minTemp: 0, maxTemp: 100 });
            fetchRooms(); // Refresh the list
        } catch (err) {
            alert('Error creating room: ' + err.message);
        }
    };

    const handleSetTemperature = async (e) => {
        e.preventDefault();
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

            // 2. Check if it violates min/max bounds and create an Alert if so
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
                alert('Temperature recorded successfully. All systems normal.');
            }

            setShowTempModal(false);
            setTempValue('');
        } catch (err) {
            alert('Error setting temperature: ' + err.message);
        }
    };

    if (loading) return <div className="loading-state">Loading your rooms...</div>;

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-flex">
                <h2>My Rooms</h2>
                <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
                    + Create New Room
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {rooms.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't created any rooms yet.</p>
                </div>
            ) : (
                <div className="rooms-grid">
                    {rooms.map(room => (
                        <div key={room.roomId} className="room-card">
                            <div className="room-header">
                                <h3>{room.roomName}</h3>
                                <span className="room-id">{room.roomId}</span>
                            </div>
                            <div className="room-details">
                                <p><strong>Min Temp:</strong> {room.minTemp}°C</p>
                                <p><strong>Max Temp:</strong> {room.maxTemp}°C</p>
                            </div>
                            <button 
                                className="action-btn"
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setShowTempModal(true);
                                }}
                            >
                                Set Temperature
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create a New Room</h3>
                        <form onSubmit={handleCreateRoom}>
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
                                <button type="submit" className="primary-btn">Create Room</button>
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
        </div>
    );
};

export default TechnicianDashboard;
