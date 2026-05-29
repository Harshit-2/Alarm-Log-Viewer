import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      {}
      <div className="ambient-bg">
        {}
        <div className="tech-grid-layer"></div>
        
        {}
        <div className="scanner-beam scanner-beam-1"></div>
        <div className="scanner-beam scanner-beam-2"></div>
        
        {}
        <div className="data-node node-1"></div>
        <div className="data-node node-2"></div>
        <div className="data-node node-3"></div>
        <div className="data-node node-4"></div>
        <div className="data-node node-5"></div>
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
