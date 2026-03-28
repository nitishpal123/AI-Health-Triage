import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList'; // Using the existing component for now
import { LogOut, Building2 } from 'lucide-react';

const TenantDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Building2 size={24} color="#38bdf8" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Hospital Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>Welcome, {user?.name} (Tenant: {user?.tenantId})</span>
          <button 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155' }}>Facility Overview</h2>
          <p style={{ color: '#64748b' }}>Manage all departments, doctors, passing patients, and pathology integrations across your entire facility here.</p>
        </div>
        
        {/* We attach the existing patient list here as proof of concept */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>All Facility Patients</h3>
            <PatientList />
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
