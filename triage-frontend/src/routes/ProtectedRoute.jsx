import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-2 border-sky-500/10 rounded-full"></div>
                    <div className="absolute inset-4 border-2 border-transparent border-t-sky-400 rounded-full animate-reverse-spin"></div>
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">
                  Verifying Credentials
                </h2>
                <p className="text-slate-500 text-xs mt-3 font-bold tracking-widest uppercase opacity-50">
                  Establishing secure tunnel to HIE Network...
                </p>
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
