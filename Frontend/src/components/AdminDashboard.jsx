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

        const interval = setInterval(() => {
            fetchUsers();
        }, 5000); // Poll for updates every 5 seconds

        return () => clearInterval(interval);
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
