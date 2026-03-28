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

  const getTriageTheme = (level) => {
    switch(level) {
      case 'Critical': return { border: 'border-t-red-600', badge: 'badge-critical', bg: 'bg-red-50/50' };
      case 'Urgent': return { border: 'border-t-orange-500', badge: 'badge-urgent', bg: 'bg-orange-50/50' };
      case 'Standard': return { border: 'border-t-emerald-500', badge: 'badge-standard', bg: 'bg-emerald-50/50' };
      default: return { border: 'border-t-slate-400', badge: 'badge-non-urgent', bg: 'bg-slate-50' };
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Synchronizing Triage Data...</p>
    </div>
  );
  
  if (isError) return (
    <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100">
      <AlertTriangle className="mx-auto text-red-500 mb-2" />
      <p className="text-red-700 font-bold">Clinical Data Connection Failure</p>
      <p className="text-red-600/60 text-xs mt-1">Please verify backend service status.</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {patients.map(patient => {
          const theme = getTriageTheme(patient.triageLevel);
          
          return (
          <div key={patient.id} className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-200 border-t-4 ${theme.border} overflow-hidden transition-all duration-300`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight leading-none">{patient.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded italic">ID: {patient.id.substring(0,8)}</span> 
                    &bull; {patient.age} YEARS OLD
                  </p>
                </div>
                <div className={`badge ${theme.badge} shadow-sm border border-current/10`}>
                  {patient.triageLevel} <span className="opacity-50 mx-1">|</span> {patient.score}
                </div>
              </div>

              {patient.estimatedWaitTime !== undefined && (
                <div className={`mb-4 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wider ${patient.estimatedWaitTime === 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                    <Clock size={14} /> 
                    {patient.estimatedWaitTime === 0 ? 'Immediate Intervention' : `ETD: ${patient.estimatedWaitTime} min`}
                </div>
              )}

              {/* Vitals Summary */}
              {patient.vitals && (
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 mb-4 font-mono">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50 group/vital">
                    <Activity size={12} className="text-blue-500 mb-1 group-hover/vital:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals.heartRate}</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">BPM</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50">
                    <span className="text-blue-500 text-[8px] font-black mb-1 uppercase tracking-tighter">B/P</span>
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals.bloodPressure}</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">mmHg</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50">
                     <span className="text-emerald-500 text-[8px] font-black mb-1 uppercase tracking-tighter">SpO2</span>
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals.oxygenLevel}%</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">SAT</span>
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {patient.triageReasoning && (
                  <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl group/ai">
                      <div className="text-[8px] font-black text-blue-600 mb-1.5 flex items-center gap-1 uppercase tracking-widest">
                        <Activity size={10} /> AI Clinical Insight
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed font-bold">{patient.triageReasoning}</p>
                  </div>
              )}

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Symptoms Identified</p>
                <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">{patient.symptoms}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                {patient.status === 'waiting' ? (
                  <button 
                    onClick={() => statusMutation.mutate({ id: patient.id, status: 'treated' })}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[.15em] py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Handle Patient
                  </button>
                ) : (
                  <div className="flex-1 bg-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Treatment Done
                  </div>
                )}
                
                <button 
                  onClick={() => { setSelectedPatient(patient); setMedicalReport(patient.medicalReport || ""); }}
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 p-3 rounded-xl transition-all shadow-sm active:scale-95 hover:border-slate-300"
                  title="Medical Report"
                >
                  <FileText size={18} />
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Report Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] transition-opacity animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Clinical Report Submission</h2>
              <p className="text-sky-400 text-xs font-bold tracking-widest mt-1 opacity-80 uppercase">Patient: {selectedPatient.name} // Ref: {selectedPatient.id.substring(0,8)}</p>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Examination & Assessment Notes</label>
                <textarea 
                  value={medicalReport}
                  onChange={(e) => setMedicalReport(e.target.value)}
                  className="w-full min-h-[220px] bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all text-sm leading-relaxed"
                  placeholder="Summarize physical exam findings, confirmed diagnosis, and discharge/referral instructions..."
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-500 font-bold py-4 rounded-2xl border border-slate-200 transition-colors uppercase text-xs tracking-widest"
                >
                  Discard
                </button>
                <button 
                  onClick={() => reportMutation.mutate({ id: selectedPatient.id, report: medicalReport })}
                  className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-sky-600/20 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95"
                >
                  Finalize & Secure Report <CheckCircle size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
