import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                Loading session...
            </div>
        );
    }
    
    // User not logged in? Send to login page
    if (!user) {
        return <Navigate to="/" replace />;
    }
    
    // Explicit role authorization passed via props
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but not allowed -> Send to their specific dashboard based on their role
        switch(user.role) {
            case 'HospitalAdmin': return <Navigate to="/tenant" replace />;
            case 'Doctor': return <Navigate to="/doctor" replace />;
            case 'Patient': return <Navigate to="/patient" replace />;
            case 'Pathologist': return <Navigate to="/pathology" replace />;
            default: return <Navigate to="/" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
