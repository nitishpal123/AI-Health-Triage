import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList'; 
import { LogOut, Stethoscope } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
            <Stethoscope size={24} className="text-emerald-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Doctor Clinical Portal</h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:flex flex-col items-end">
            <span className="font-semibold text-emerald-100">Dr. {user?.name}</span>
            <span className="text-emerald-400 text-xs">Department: {user?.departmentName || 'General Medicine'}</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md shadow-red-900/20"
          >
            <LogOut size={16} /> 
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Assigned Patients</h2>
            <p className="text-slate-500 mt-1">Live triage queue for your department</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600 uppercase">Live Queue</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[600px]">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">In-Patient Triage</span>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tight">
                <span className="text-red-500">Critical</span>
                <span className="text-orange-500">Urgent</span>
                <span className="text-blue-500">Standard</span>
              </div>
            </div>
            <div className="p-2 sm:p-4">
              <PatientList />
            </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
