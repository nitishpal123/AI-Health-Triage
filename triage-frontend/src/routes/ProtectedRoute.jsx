import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Clock } from 'lucide-react';

const ROLE_ROUTES = {
    HospitalAdmin: '/tenant',
    SuperAdmin:    '/tenant',
    Doctor:        '/doctor',
    Pathologist:   '/pathology',
    Patient:       '/patient',
};

// Shown on every protected page when session is about to expire
const SessionBanner = () => {
    const { sessionAlert, setSessionAlert, logout } = useAuth();
    if (!sessionAlert) return null;

    return (
        <div className={`fixed top-0 inset-x-0 z-[999] flex items-center justify-between px-6 py-3 text-sm font-bold shadow-lg ${
            sessionAlert === 'expiring'
                ? 'bg-amber-500 text-white'
                : 'bg-red-600 text-white'
        }`}>
            <div className="flex items-center gap-2">
                {sessionAlert === 'expiring'
                    ? <><Clock size={16} /> Session expiring in 2 minutes due to inactivity.</>
                    : <><AlertTriangle size={16} /> Session expired. Please log in again.</>
                }
            </div>
            <div className="flex items-center gap-3">
                {sessionAlert === 'expiring' && (
                    <button
                        onClick={() => setSessionAlert(null)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs uppercase tracking-widest transition-all"
                    >
                        Stay Logged In
                    </button>
                )}
                <button
                    onClick={logout}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs uppercase tracking-widest transition-all"
                >
                    Logout Now
                </button>
            </div>
        </div>
    );
};

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, sessionAlert } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                    Verifying Session
                </p>
            </div>
        );
    }

    // Not logged in → login page
    if (!user) return <Navigate to="/" replace />;

    // Wrong role → redirect to their own dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={ROLE_ROUTES[user.role] || '/'} replace />;
    }

    return (
        <>
            {sessionAlert && <SessionBanner />}
            <div className={sessionAlert ? 'pt-12' : ''}>
                {children}
            </div>
        </>
    );
}

// Wrap the login route — redirect already-authenticated users to their dashboard
export function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to={ROLE_ROUTES[user.role] || '/'} replace />;
    return children;
}

export default ProtectedRoute;
