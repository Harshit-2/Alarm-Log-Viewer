import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Dashboards.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setError('');
            const data = await apiService.getUsers();
            setUsers(data || []);
        } catch (err) {
            setError('⚠️ User Service is unavailable: ' + err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setDeleteError('');
        try {
            await apiService.deleteUser(userId);
            fetchUsers(); // Refresh the list
        } catch (err) {
            setDeleteError('Failed to delete user: ' + err.message);
        }
    };

    if (loading) return <div className="loading-state">Loading user management dashboard...</div>;

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-flex">
                <h2>Admin User Management</h2>
                <div className="status-badge">
                    <span className="dot pulse-green"></span> Admin Mode
                </div>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
            {deleteError && <div className="error-message" style={{ marginBottom: '1rem' }}>{deleteError}</div>}

            <div className="users-management" style={{ marginTop: '1.5rem' }}>
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
                                            style={{ padding: '0.4rem 0.8rem', marginTop: 0, borderColor: '#E53E3E', color: '#E53E3E', background: 'transparent' }}
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
        </div>
    );
};

export default AdminDashboard;
