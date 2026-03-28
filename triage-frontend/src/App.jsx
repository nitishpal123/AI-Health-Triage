import React, { useState, useEffect } from 'react';
import IntakeForm from './components/IntakeForm';
import PatientList from './components/PatientList';
import { Activity, Download, Search } from 'lucide-react';

function App() {
  const [allPatients, setAllPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/patients');
      const data = await res.json();
      setAllPatients(data);
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

  const handleReportUpdate = async (id, report) => {
    try {
      await fetch(`http://localhost:3001/api/patients/${id}/report`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      });
      fetchPatients();
    } catch (err) {
      console.error("Failed to update report", err);
    }
  };

  const allWaiting = allPatients.filter(p => p.status === 'waiting');

  const stats = {
    critical: allWaiting.filter(p => p.triageLevel === 'Critical').length,
    urgent: allWaiting.filter(p => p.triageLevel === 'Urgent').length,
    standard: allWaiting.filter(p => p.triageLevel === 'Standard').length,
    total: allWaiting.length
  };

  const filteredPatients = allPatients.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.symptoms.toLowerCase().includes(term) ||
      (p.history && p.history.toLowerCase().includes(term)) ||
      (p.recommendedDoctor && p.recommendedDoctor.toLowerCase().includes(term))
    );
  });

  const patients = filteredPatients.filter(p => p.status === 'waiting');
  const historyPatients = filteredPatients.filter(p => p.status !== 'waiting');

  const downloadReport = () => {
    window.open('http://localhost:3001/api/reports/history', '_blank');
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <Activity size={28} color="var(--accent-blue)" /> 
          AI Health Triage
        </h1>
        <div style={{display:'flex', alignItems:'center', gap: '1rem', color: 'var(--text-secondary)'}}>
          <button 
            onClick={downloadReport}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.4rem 0.8rem', fontSize: '0.9rem', 
              backgroundColor: 'var(--background-card)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            <Download size={16} /> Export History
          </button>
          <span>Live System • {new Date().toLocaleDateString()}</span>
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

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '0.5rem'}}>
          <button 
            className={`btn ${activeTab === 'waiting' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('waiting')}
            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: activeTab === 'waiting' ? 'var(--accent-blue)' : 'var(--background-card)', color: activeTab === 'waiting' ? '#fff' : 'var(--text-primary)' }}
          >
            Active Queue ({patients.length})
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: activeTab === 'history' ? 'var(--accent-blue)' : 'var(--background-card)', color: activeTab === 'history' ? '#fff' : 'var(--text-primary)' }}
          >
            Patient History ({historyPatients.length})
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search patients by name, symptoms, history, or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem 0.75rem 0.75rem 2.8rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'var(--background-card)', 
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1}}>
          {loading ? (
            <div className="glass-panel" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
              Loading AI Triage System...
            </div>
          ) : (
            <PatientList patients={activeTab === 'waiting' ? patients : historyPatients} onStatusUpdate={handleStatusUpdate} onReportUpdate={handleReportUpdate} isHistory={activeTab === 'history'} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
