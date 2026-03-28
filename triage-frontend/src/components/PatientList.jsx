import React, { useState } from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle, Flame, User, Search, Phone, MapPin, Stethoscope, FileText, Calendar } from 'lucide-react';

export default function PatientList({ patients, onStatusUpdate, onReportUpdate, isHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReportId, setEditingReportId] = useState(null);
  const [tempReport, setTempReport] = useState('');
  if (!patients || patients.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '100%' }}>
        <h2>{isHistory ? 'Patient History' : 'Active Triage Queue'}</h2>
        <div className="empty-state">
          <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>{isHistory ? 'No History' : 'All clear!'}</h3>
          <p>{isHistory ? 'No past patients found.' : 'No patients currently in the active triage queue.'}</p>
        </div>
      </div>
    );
  }

  const getTriageIcon = (level) => {
    switch (level) {
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

  const formatDischargeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const displayedPatients = searchTerm.trim()
    ? patients.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.symptoms && p.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : patients;

  return (
    <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{isHistory ? 'Patient History Records' : 'Active Triage Queue'}</h2>
          {!isHistory && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Sorted dynamically by AI Priority Score
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder={isHistory ? "Search history..." : "Search active patients..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.4rem 1rem 0.4rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--background-main)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              minWidth: '220px'
            }}
          />
        </div>
      </div>

      <div className="patient-list">
        {displayedPatients.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <Search size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No results found</h3>
            <p>No patients match "{searchTerm}"</p>
          </div>
        ) : (
          displayedPatients.map((patient) => (
            <div key={patient.id} className={`patient-card ${getTriageClass(patient.triageLevel)}`}>

              <div className="patient-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3>
                      <User size={18} /> {patient.name} <span style={{ fontWeight: '400', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>({patient.age}y)</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div className={`badge ${getTriageClass(patient.triageLevel)}`}>
                        {getTriageIcon(patient.triageLevel)} {patient.triageLevel} (Score: {patient.score})
                      </div>
                      {patient.department && (
                        <div className="badge" style={{ backgroundColor: 'var(--background-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                          <Stethoscope size={14} /> {patient.department}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    <Clock size={12} /> {getTimeElapsed(patient.timestamp)}
                    {isHistory && patient.dischargedAt && (
                      <><Calendar size={12} style={{marginLeft: '0.5rem'}}/> Discharged: {formatDischargeTime(patient.dischargedAt)}</>
                    )}
                  </div>
                </div>

                {(patient.phone || patient.address) && (
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {patient.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={14} /> {patient.phone}
                      </div>
                    )}
                    {patient.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {patient.address}
                      </div>
                    )}
                  </div>
                )}

                <p><strong>Symptoms:</strong> {patient.symptoms}</p>
                {patient.history && <p style={{ marginTop: '0.25rem' }}><strong>History:</strong> {patient.history}</p>}
                {patient.recommendedDoctor && (
                  <p style={{ marginTop: '0.35rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Stethoscope size={14} /> <strong>Suggested Doctor:</strong> {patient.recommendedDoctor}
                  </p>
                )}

                <div className="vitals-tags">
                  {patient.vitals?.heartRate && (
                    <div className="vital-tag"><Activity size={12} /> HR: {patient.vitals.heartRate}</div>
                  )}
                  {patient.vitals?.bloodPressure && (
                    <div className="vital-tag">BP: {patient.vitals.bloodPressure}</div>
                  )}
                  {patient.vitals?.oxygenLevel && (
                    <div className="vital-tag">SpO2: {patient.vitals.oxygenLevel}%</div>
                  )}
                </div>

                {isHistory && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--background-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} /> Medical Report
                      </h4>
                      {editingReportId !== patient.id && (
                        <button 
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-card)', color: 'var(--text-primary)', cursor: 'pointer' }} 
                          onClick={() => { setEditingReportId(patient.id); setTempReport(patient.medicalReport || ''); }}
                        >
                          {patient.medicalReport ? 'Edit' : 'Add Report'}
                        </button>
                      )}
                    </div>
                    
                    {editingReportId === patient.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <textarea
                          value={tempReport}
                          onChange={(e) => setTempReport(e.target.value)}
                          placeholder="Type medical report here..."
                          style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-card)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-card)', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setEditingReportId(null)}>Cancel</button>
                          <button style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--accent-blue)', color: 'white', cursor: 'pointer' }} onClick={() => { onReportUpdate(patient.id, tempReport); setEditingReportId(null); }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: patient.medicalReport ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: patient.medicalReport ? 'normal' : 'italic', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                        {patient.medicalReport || "No medical report added yet."}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
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
          ))
        )}
      </div>
    </div>
  );
}
