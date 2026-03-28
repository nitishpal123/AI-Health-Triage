import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle2 } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#2563eb', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UserCircle2 size={24} color="#93c5fd" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Patient Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>{user?.name}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1d4ed8' }}>My Medical Records & Status</h2>
          <p style={{ color: '#64748b' }}>View your AI triage assessment, upcoming appointments, and lab results.</p>
        </div>
        
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a' }}>Waiting Room Status: <span style={{ fontWeight: 800 }}>Standard</span></h3>
            <p style={{ marginTop: '0.5rem', color: '#3b82f6' }}>Estimated Wait Time: 45 Minutes</p>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
