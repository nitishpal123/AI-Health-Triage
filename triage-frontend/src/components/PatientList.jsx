import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchPatients, updatePatientStatus, updatePatientReport } from '../api/patientService';
import { 
  Clock, 
  Activity, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  MoreHorizontal, 
  UserCog, 
  Trash2, 
  X,
  Eye,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

const PatientList = ({ isTable = false }) => {
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalReport, setMedicalReport] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [doctorModal, setDoctorModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [newDoctor, setNewDoctor] = useState("");

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients
  });

  // Specialists organized by department
  const specialists = {
    'Cardiology': ['Dr. Alex Hart', 'Dr. Sarah Vance', 'Dr. Michael Stern'],
    'Neurology': ['Dr. Jane Doe', 'Dr. Robert Fisher', 'Dr. Elena Rossi'],
    'Orthopedics': ['Dr. Mark Bone', 'Dr. Susan Joint', 'Dr. Paul Walker'],
    'Emergency / Trauma': ['Dr. Emily ER', 'Dr. David Trauma', 'Dr. Kevin Quick'],
    'Pulmonology': ['Dr. Chris Air', 'Dr. Linda Lung', 'Dr. Brian Breath'],
    'General Practice': ['Dr. John Smith', 'Dr. Alice Brown', 'Dr. Peter Pan']
  };

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

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
        const res = await axios.delete(`/api/patients/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return res.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['patients']);
        setDeleteModal(null);
    }
  });

  const assignDoctorMutation = useMutation({
    mutationFn: async ({ id, doctor }) => {
        const res = await axios.patch(`/api/patients/${id}/doctor`, { recommendedDoctor: doctor }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return res.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['patients']);
        setDoctorModal(null);
        setNewDoctor("");
    }
  });

  const getTriageTheme = (level) => {
    switch(level) {
      case 'Critical': return { border: 'border-t-red-600', badge: 'badge-critical', bg: 'bg-red-50/50', text: 'text-red-700' };
      case 'Urgent': return { border: 'border-t-orange-500', badge: 'badge-urgent', bg: 'bg-orange-50/50', text: 'text-orange-700' };
      case 'Standard': return { border: 'border-t-emerald-500', badge: 'badge-standard', bg: 'bg-emerald-50/50', text: 'text-emerald-700' };
      default: return { border: 'border-t-slate-400', badge: 'badge-non-urgent', bg: 'bg-slate-50', text: 'text-slate-700' };
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

  if (isTable) {
    return (
      <div className="w-full relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 text-white z-10">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">S.No</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Patient Profile</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Triage Prio</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Clinical Type</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Practitioner</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Lab Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient, index) => {
              const theme = getTriageTheme(patient.triageLevel);
              return (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-6 transition-transform group-hover:translate-x-1 duration-300">
                    <span className="bg-slate-100 text-slate-500 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black italic border border-slate-200 shadow-inner">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-medium">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1 group-hover:text-emerald-700 transition-colors uppercase">{patient.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{patient.age} / Bio-Age &bull; {patient.phone || 'NO PHONE'}</p>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.bg} ${theme.text} border border-current/20 font-black text-[10px] uppercase tracking-widest shadow-sm`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')}`}></div>
                      {patient.triageLevel}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                       {patient.department || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
                       {patient.recommendedDoctor || "Doctor Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {patient.testStatus && patient.testStatus !== 'None' ? (
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${
                        patient.testStatus === 'Released' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        patient.testStatus === 'Processing' ? 'bg-violet-50 text-violet-600 border-violet-200 animate-pulse' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {patient.testStatus}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">Unrequested</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right relative">
                    <div className="flex justify-end gap-2 items-center">
                      <button 
                        onClick={() => setViewModal(patient)}
                        className="p-2 text-slate-400 hover:text-sky-600 rounded-xl transition-all"
                        title="View Details"
                      >
                         <Eye size={18} />
                      </button>

                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)}
                          className={`p-2 rounded-xl transition-all ${activeMenu === patient.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        
                        {activeMenu === patient.id && (
                          <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             <button 
                               onClick={() => { setViewModal(patient); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors border-b border-slate-50 uppercase tracking-widest"
                             >
                               <Eye size={14} /> Full Dossier
                             </button>
                             <button 
                               onClick={() => { setSelectedPatient(patient); setMedicalReport(patient.medicalReport || ""); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors border-b border-slate-50 uppercase tracking-widest"
                             >
                               <FileText size={14} /> Submit Report
                             </button>
                             <button 
                               onClick={() => { setDoctorModal(patient); setNewDoctor(patient.recommendedDoctor || ""); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors border-b border-slate-50 uppercase tracking-widest"
                             >
                               <UserCog size={14} /> Assign Doctor
                             </button>
                             <button
                               onClick={() => { setDeleteModal(patient); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors uppercase tracking-widest"
                             >
                               <Trash2 size={14} /> Purge Record
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Backdrop for Menu closing */}
        {activeMenu && <div className="fixed inset-0 z-[90]" onClick={() => setActiveMenu(null)}></div>}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {patients.map((patient, index) => {
          const theme = getTriageTheme(patient.triageLevel);
          return (
          <div key={patient.id} className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-200 border-t-4 ${theme.border} overflow-hidden transition-all duration-300`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{patient.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-500 h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black italic">#{index+1}</span>
                    &bull; {patient.age} YEARS OLD
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <div className={`badge ${theme.badge} shadow-sm border border-current/10`}>
                    {patient.triageLevel} <span className="opacity-50 mx-1">|</span> {patient.score}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 mb-4 font-mono">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50 group/vital">
                    <Activity size={12} className="text-blue-500 mb-1 group-hover/vital:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals?.heartRate}</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">BPM</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50">
                    <span className="text-blue-500 text-[8px] font-black mb-1 uppercase tracking-tighter">B/P</span>
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals?.bloodPressure}</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">mmHg</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50">
                     <span className="text-emerald-500 text-[8px] font-black mb-1 uppercase tracking-tighter">SpO2</span>
                    <span className="text-[10px] font-bold text-slate-900">{patient.vitals?.oxygenLevel}%</span>
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">SAT</span>
                  </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setViewModal(patient)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl transition-all shadow-sm active:scale-95 text-[10px] font-black uppercase tracking-widest"
                >
                  View Details
                </button>
                <div className="relative">
                     <button 
                        onClick={() => setActiveMenu(activeMenu === patient.id ? null : patient.id)}
                        className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                     >
                       <MoreHorizontal size={18} />
                     </button>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* RENDER MODALS OUTSIDE FOR BOTH VIEWS */}

      {/* View Full Dossier Modal - High Fidelity Clinical Readout */}
      {viewModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 z-[200] animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] w-full max-w-5xl shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
              {/* Left Sidebar: Biological Profile */}
              <div className="w-full md:w-80 bg-slate-900 p-8 text-white flex flex-col justify-between overflow-y-auto border-r border-slate-800">
                 <div>
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-8 shadow-lg shadow-emerald-500/20">
                       <Activity className="text-white" size={28} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] mb-3">{viewModal.name}</h2>
                    <div className="flex items-center gap-2 mb-8">
                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       <p className="text-emerald-400 font-black uppercase text-[9px] tracking-[0.2em] opacity-90">Live Clinical Subject</p>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="group">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-sky-400 transition-colors">Biological Identity</p>
                          <p className="text-base font-bold flex items-baseline gap-2">
                             {viewModal.age} <span className="text-[10px] text-slate-500 uppercase">Years</span>
                          </p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Comms Reference</p>
                          <p className="text-sm font-bold text-slate-300 truncate">{viewModal.phone || 'EXEMPTED'}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Geo-Location</p>
                          <p className="text-sm font-bold text-slate-400 leading-relaxed">{viewModal.address || 'Address Restricted'}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-12 bg-slate-800/40 p-6 rounded-[32px] border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Triage Outcome</p>
                       <Zap size={12} className="text-sky-400" />
                    </div>
                    <div className="flex items-end justify-between mb-4">
                       <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${
                          viewModal.triageLevel === 'Critical' ? 'bg-red-500 text-white' :
                          viewModal.triageLevel === 'Urgent' ? 'bg-orange-500 text-white' :
                          'bg-emerald-500 text-white'
                       }`}>
                          {viewModal.triageLevel}
                       </span>
                       <div className="text-right">
                          <p className="text-2xl font-black text-white leading-none">{viewModal.score}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Nervous-System-Index</p>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${
                          viewModal.score > 80 ? 'bg-red-500' : viewModal.score > 50 ? 'bg-orange-500' : 'bg-emerald-500'
                       }`} style={{ width: `${viewModal.score}%` }}></div>
                    </div>
                 </div>
              </div>

              {/* Main Content Area: Clinical Intelligence */}
              <div className="flex-1 bg-white flex flex-col overflow-hidden">
                 <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Clinical Intelligence Dossier</h3>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Entry Ref: <span className="text-slate-900">{viewModal.id}</span></p>
                    </div>
                    <button onClick={() => setViewModal(null)} className="p-4 bg-white hover:bg-slate-100 rounded-3xl transition-all shadow-sm active:scale-90 text-slate-400 hover:text-slate-900 border border-slate-100"><X size={24}/></button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Physiological Stream */}
                        <div className="space-y-10">
                           <section>
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Physiological Stream</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                       <p className="text-[9px] font-black text-slate-400 uppercase">Heart Rate</p>
                                       <Activity size={14} className="text-red-500" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                       <span className="text-3xl font-black text-slate-900 transition-transform group-hover:scale-110 duration-300 block">{viewModal.vitals?.heartRate || '00'}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase italic">BPM</span>
                                    </div>
                                 </div>
                                 <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                       <p className="text-[9px] font-black text-slate-400 uppercase">Blood Sat</p>
                                       <Zap size={14} className="text-emerald-500" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                       <span className="text-3xl font-black text-slate-900 transition-transform group-hover:scale-110 duration-300 block">{viewModal.vitals?.oxygenLevel || '00'}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase italic">%</span>
                                    </div>
                                 </div>
                                 <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 col-span-2 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                       <p className="text-[9px] font-black text-slate-400 uppercase">Arterial Pressure</p>
                                       <Activity size={14} className="text-sky-500" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                       <span className="text-3xl font-black text-slate-900 tracking-tighter">{viewModal.vitals?.bloodPressure || '00 / 00'}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase italic ml-2">mmHg</span>
                                    </div>
                                 </div>
                              </div>
                           </section>

                           <section>
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Clinician Assignment</h4>
                              </div>
                              <div className="bg-slate-900 p-6 rounded-[32px] flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20">
                                       <Stethoscope size={28} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{viewModal.recommendedDoctor || "Pending Assignment"}</p>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">{viewModal.department || "General Intake"}</span>
                                          <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primary Care</span>
                                       </div>
                                    </div>
                                 </div>
                                 <ChevronRight className="text-slate-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                              </div>
                           </section>
                        </div>

                        {/* Diagnostic Narratives */}
                        <div className="space-y-10">
                           <section>
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Patient Manifest</h4>
                              </div>
                              <div className="space-y-6">
                                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Symptom Stream</p>
                                    <p className="text-sm italic text-slate-800 leading-relaxed font-black">
                                       "{viewModal.symptoms}"
                                    </p>
                                 </div>
                                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Longitudinal History</p>
                                    <p className="text-sm text-slate-600 leading-relaxed font-bold">
                                       {viewModal.history || "No prior history documented in regional nodes."}
                                    </p>
                                 </div>
                              </div>
                           </section>

                           <section>
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">AI Diagnostic Reasoning</h4>
                              </div>
                              <div className="bg-sky-50/50 p-8 rounded-[40px] border border-sky-100 relative overflow-hidden group">
                                 <Zap className="absolute -right-4 -bottom-4 text-sky-200/50 group-hover:scale-150 transition-transform duration-700" size={120} />
                                 <p className="text-sm font-bold text-sky-900 leading-relaxed relative z-10 italic">
                                    "{viewModal.triageReasoning}"
                                 </p>
                              </div>
                           </section>
                        </div>
                    </div>

                    {viewModal.medicalReport && (
                       <section className="bg-emerald-50 p-10 rounded-[48px] border border-emerald-100 relative overflow-hidden">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                             <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.25em]">Final Physician Assessment</h4>
                          </div>
                          <p className="text-base font-black text-emerald-950 leading-relaxed italic relative z-10">
                             "{viewModal.medicalReport}"
                          </p>
                          <div className="mt-8 flex items-center justify-between border-t border-emerald-200/50 pt-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700">
                                   <CheckCircle size={20} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-emerald-900 uppercase">Digitally Certified</p>
                                   <p className="text-[9px] font-bold text-emerald-600 underline">Verification ID: MD-772-X</p>
                                </div>
                             </div>
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{new Date(viewModal.dischargedAt || viewModal.timestamp).toLocaleDateString()}</p>
                          </div>
                       </section>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Report Submission Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-[200] transition-opacity animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Clinical Assessment Submission</h2>
              <p className="text-sky-400 text-xs font-black tracking-widest mt-1 opacity-80 uppercase italic">Patient: {selectedPatient.name}</p>
            </div>
            
            <div className="p-10 space-y-6 bg-white">
              <textarea 
                value={medicalReport}
                onChange={(e) => setMedicalReport(e.target.value)}
                className="w-full min-h-[220px] bg-slate-50 border border-slate-200 rounded-[30px] p-8 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all text-sm leading-relaxed font-medium"
                placeholder="Enter detailed physical exam findings and diagnosis..."
              />
              <div className="flex gap-4">
                <button onClick={() => setSelectedPatient(null)} className="flex-1 bg-white hover:bg-slate-50 text-slate-500 font-bold py-5 rounded-[25px] border border-slate-200 transition-colors uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={() => reportMutation.mutate({ id: selectedPatient.id, report: medicalReport })} className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-[25px] shadow-xl shadow-sky-600/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95">Finalize Assessment <CheckCircle size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Assignment Modal */}
      {doctorModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-[250]">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center text-center">
                <h3 className="font-black uppercase text-xs tracking-[0.2em] mx-auto">Practitioner Selection Flow</h3>
                <button onClick={() => setDoctorModal(null)} className="absolute right-8 top-8 hover:rotate-90 transition-transform"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Target Patient</p>
                    <p className="text-sm font-black text-slate-800 uppercase">{doctorModal.name}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Clinical Department</p>
                     <p className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 uppercase italic">
                       {doctorModal.department || "General Practice"}
                     </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Recommended Specialists for {doctorModal.department || "General"}</p>
                  <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                     {(specialists[doctorModal.department || "General Practice"] || specialists['General Practice']).map(doc => (
                        <button 
                           key={doc}
                           onClick={() => setNewDoctor(doc)}
                           className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${newDoctor === doc ? 'bg-sky-600 border-sky-500 text-white shadow-xl shadow-sky-600/20 active:scale-95' : 'bg-white border-slate-100 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50'}`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${newDoctor === doc ? 'bg-white/20' : 'bg-slate-50'}`}>
                                 <Stethoscope size={20} />
                              </div>
                              <p className="font-black text-xs uppercase tracking-tight">{doc}</p>
                           </div>
                           {newDoctor === doc && <CheckCircle size={16} />}
                        </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Manual Override</p>
                   <input 
                     type="text" 
                     value={newDoctor} 
                     onChange={(e) => setNewDoctor(e.target.value)} 
                     placeholder="Enter physician name..." 
                     className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all" 
                   />
                </div>

                <button 
                   onClick={() => assignDoctorMutation.mutate({ id: doctorModal.id, doctor: newDoctor })} 
                   disabled={!newDoctor}
                   className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black py-5 rounded-[30px] uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-xl"
                >
                  Authorize Assignment Update
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-[250]">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden border border-red-500/20 animate-in zoom-in-95 duration-200">
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                  <Trash2 className="text-red-500" size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Purge</h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed uppercase tracking-wider">Confirmin total record removal for:<br/><span className="text-red-600 font-extrabold">{deleteModal.name}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setDeleteModal(null)} className="bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-4 rounded-3xl uppercase text-[10px] tracking-widest transition-colors">Abort</button>
                  <button onClick={() => deleteMutation.mutate(deleteModal.id)} className="bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-3xl uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95">Verify Purge</button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
