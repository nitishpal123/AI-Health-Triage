import React, { useState, useEffect } from 'react';
import IntakeForm from './components/IntakeForm';
import PatientList from './components/PatientList';
import { Activity } from 'lucide-react';

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // Poll every 30 seconds for real-time vibe
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePatientAdded = () => {
    fetchPatients();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`http://localhost:3001/api/patients/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchPatients();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const dischargedPatients = patients.filter(p => p.status === 'treated');

  const stats = {
    critical: waitingPatients.filter(p => p.triageLevel === 'Critical').length,
    urgent: waitingPatients.filter(p => p.triageLevel === 'Urgent').length,
    standard: waitingPatients.filter(p => p.triageLevel === 'Standard').length,
    total: waitingPatients.length
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <Activity size={28} color="var(--accent-blue)" /> 
          AI Health Triage
        </h1>
        <div style={{display:'flex', alignItems:'center', gap: '1rem', color: 'var(--text-secondary)'}}>
          Live System • {new Date().toLocaleDateString()}
        </div>
      </header>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div className="stats-grid">
          <div className="stat-box critical">
            <h4>Critical</h4>
            <div className="count">{stats.critical}</div>
          </div>
          <div className="stat-box urgent">
            <h4>Urgent</h4>
            <div className="count">{stats.urgent}</div>
          </div>
          <div className="stat-box standard">
            <h4>Standard</h4>
            <div className="count">{stats.standard}</div>
          </div>
          <div className="stat-box">
            <h4>Total Waiting</h4>
            <div className="count">{stats.total}</div>
          </div>
        </div>
        
        <IntakeForm onPatientAdded={handlePatientAdded} />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '1.5rem'}}>
        {loading ? (
          <div className="glass-panel" style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'200px'}}>
            Loading AI Triage System...
          </div>
        ) : (
          <>
            <PatientList patients={waitingPatients} onStatusUpdate={handleStatusUpdate} />
            <PatientList patients={dischargedPatients} isHistory={true} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
