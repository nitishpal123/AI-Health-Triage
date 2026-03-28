import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList'; 
import { LogOut, Stethoscope } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#047857', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Stethoscope size={24} color="#a7f3d0" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Doctor Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>Dr. {user?.name} | Dept: {user?.departmentId}</span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>My Assigned Patients</h2>
          <p style={{ color: '#64748b' }}>Here you will see patients currently triaged into your department.</p>
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <PatientList />
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
