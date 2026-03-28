import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPatients, updatePatientStatus, updatePatientReport } from '../api/patientService';
import { Clock, Activity, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const PatientList = () => {
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalReport, setMedicalReport] = useState("");

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients
  });

  const statusMutation = useMutation({
    mutationFn: updatePatientStatus,
    onSuccess: () => queryClient.invalidateQueries(['patients'])
  });

  const reportMutation = useMutation({
    mutationFn: updatePatientReport,
    onSuccess: () => {
        queryClient.invalidateQueries(['patients']);
        setSelectedPatient(null);
        setMedicalReport("");
    }
  });

  const getTriageColor = (level) => {
    switch(level) {
      case 'Critical': return '#ef4444';
      case 'Urgent': return '#f59e0b';
      case 'Standard': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getWaitBadgeColor = (level) => {
    switch(level) {
      case 'Critical': return { bg: '#fee2e2', text: '#b91c1c' };
      case 'Urgent': return { bg: '#fef3c7', text: '#d97706' };
      case 'Standard': return { bg: '#d1fae5', text: '#059669' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Patient Triage Data...</div>;
  if (isError) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error loading patients</div>;

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {patients.map(patient => {
          const waitColors = getWaitBadgeColor(patient.triageLevel);
          
          return (
          <div key={patient.id} style={{ 
            background: 'white', borderRadius: '1rem', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
            borderTop: `4px solid ${getTriageColor(patient.triageLevel)}`,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{patient.name}</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>ID: {patient.id.substring(0,8)} • {patient.age} yrs</p>
                </div>
                <span style={{ 
                  background: waitColors.bg, color: waitColors.text,
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600'
                }}>
                  {patient.triageLevel} ({patient.score}/100)
                </span>
              </div>

              {patient.estimatedWaitTime !== undefined && (
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                    <Clock size={16} /> 
                    Wait Time: {patient.estimatedWaitTime === 0 ? 'Immediate Action Required' : `~${patient.estimatedWaitTime} mins`}
                </div>
              )}

              {/* Vitals Summary */}
              {patient.vitals && (
                <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '0.875rem' }}>
                    <Activity size={16} color="#3b82f6" /> {patient.vitals.heartRate} bpm
                  </div>
                  <div style={{ color: '#0f172a', fontSize: '0.875rem' }}>
                    BP: {patient.vitals.bloodPressure}
                  </div>
                  <div style={{ color: '#0f172a', fontSize: '0.875rem' }}>
                    O2: {patient.vitals.oxygenLevel}%
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {patient.triageReasoning && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.375rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1d4ed8', marginBottom: '0.25rem' }}>AI ASSESSMENT:</div>
                      <span style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>{patient.triageReasoning}</span>
                  </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Symptoms:</div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563' }}>{patient.symptoms}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Status: <span style={{ fontWeight: '500', color: patient.status === 'waiting' ? '#f59e0b' : '#10b981' }}>{patient.status.toUpperCase()}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {patient.status === 'waiting' && (
                    <button 
                      onClick={() => statusMutation.mutate({ id: patient.id, status: 'treated' })}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}
                    >
                      Mark Treated
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { setSelectedPatient(patient); setMedicalReport(patient.medicalReport || ""); }}
                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <FileText size={16} /> Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Report Modal */}
      {selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Medical Report: {selectedPatient.name}</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Clinical Notes</label>
              <textarea 
                value={medicalReport}
                onChange={(e) => setMedicalReport(e.target.value)}
                style={{ width: '100%', minHeight: '150px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', resize: 'vertical' }}
                placeholder="Enter examination details, diagnosis, and treatment plan..."
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedPatient(null)}
                style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => reportMutation.mutate({ id: selectedPatient.id, report: medicalReport })}
                style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500' }}
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
