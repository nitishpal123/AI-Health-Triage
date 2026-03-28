import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, FlaskConical } from 'lucide-react';

const PathologyDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#7c3aed', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FlaskConical size={24} color="#c4b5fd" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Pathology Lab Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>Lab Tech, {user?.name}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#6d28d9' }}>Pending Lab Orders</h2>
          <p style={{ color: '#64748b' }}>Manage test requests routed from hospital doctors here.</p>
        </div>
        
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8' }}>No pending lab orders found.</p>
        </div>
      </main>
    </div>
  );
};

export default PathologyDashboard;
