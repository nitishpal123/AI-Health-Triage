import React from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle, Flame, User, Stethoscope } from 'lucide-react';

export default function PatientList({ patients, onStatusUpdate, isHistory }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="glass-panel" style={{height:'100%'}}>
        <h2>{isHistory ? 'Patient History' : 'Active Triage Queue'}</h2>
        <div className="empty-state">
          <CheckCircle size={48} style={{marginBottom:'1rem', opacity: 0.5}} />
          <h3>{isHistory ? 'No History' : 'All clear!'}</h3>
          <p>{isHistory ? 'No past patients found.' : 'No patients currently in the active triage queue.'}</p>
        </div>
      </div>
    );
  }

  const getTriageIcon = (level) => {
    switch(level) {
      case 'Critical': return <AlertTriangle size={14} />;
      case 'Urgent': return <Flame size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getTriageClass = (level) => {
    return level.toLowerCase().replace(' ', '-');
  };

  const getTimeElapsed = (timestamp) => {
    const mins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div className="glass-panel" style={{height:'100%', overflow: 'hidden', display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
        <h2>{isHistory ? 'Patient History Records' : 'Active Triage Queue'}</h2>
        <div style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>
          {isHistory ? 'Chronological Record' : 'Sorted dynamically by AI Priority Score'}
        </div>
      </div>
      
      <div className="patient-list">
        {patients.map((patient) => (
          <div key={patient.id} className={`patient-card ${getTriageClass(patient.triageLevel)}`}>
            
            <div className="patient-info" style={{flex: 1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '0.5rem'}}>
                <div>
                  <h3>
                    <User size={18} /> {patient.name} <span style={{fontWeight:'400', fontSize:'0.875rem', color:'var(--text-secondary)'}}>({patient.age}y)</span>
                  </h3>
                  <div className={`badge ${getTriageClass(patient.triageLevel)}`}>
                    {getTriageIcon(patient.triageLevel)} {patient.triageLevel} (Score: {patient.score})
                  </div>
                </div>
                
                <div style={{display:'flex', alignItems:'center', gap: '0.5rem', color:'var(--text-secondary)', fontSize:'0.75rem'}}>
                  <Clock size={12} /> {getTimeElapsed(patient.timestamp)}
                </div>
              </div>
              
              <p><strong>Symptoms:</strong> {patient.symptoms}</p>
              {patient.history && <p style={{marginTop: '0.25rem'}}><strong>History:</strong> {patient.history}</p>}
              {patient.recommendedDoctor && (
                <p style={{marginTop: '0.35rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Stethoscope size={14} /> <strong>Suggested Doctor:</strong> {patient.recommendedDoctor}
                </p>
              )}
              
              <div className="vitals-tags">
                {patient.vitals?.heartRate && (
                  <div className="vital-tag"><Activity size={12}/> HR: {patient.vitals.heartRate}</div>
                )}
                {patient.vitals?.bloodPressure && (
                  <div className="vital-tag">BP: {patient.vitals.bloodPressure}</div>
                )}
                {patient.vitals?.oxygenLevel && (
                  <div className="vital-tag">SpO2: {patient.vitals.oxygenLevel}%</div>
                )}
              </div>
            </div>
            
            <div style={{marginLeft: '1rem', display:'flex', flexDirection:'column', gap: '0.5rem', justifyContent: 'center'}}>
              {!isHistory ? (
                <button 
                  className="action-btn success"
                  title="Mark as Treated / Discharge"
                  onClick={() => onStatusUpdate(patient.id, 'treated')}
                >
                  <CheckCircle size={20} />
                </button>
              ) : (
                <div style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(39, 174, 96, 0.1)',
                  color: '#27ae60',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(39, 174, 96, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <CheckCircle size={14} /> Treated
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
