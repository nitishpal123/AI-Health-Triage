import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle2 } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-blue-50/30 flex flex-col">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <UserCircle2 size={24} className="text-blue-100" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Patient Care Portal</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-blue-50 font-medium">{user?.name}</span>
            <span className="text-[10px] text-blue-200 font-bold tracking-widest uppercase">Verified Patient</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-blue-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md"
          >
            <LogOut size={16} /> 
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Health Status & Records</h2>
          <p className="text-slate-500 mt-1 italic">Real-time triage tracking for John Doe</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
               <h3 className="text-xl font-bold text-slate-600 uppercase tracking-widest text-xs mb-4">Current Status</h3>
               <div className="text-4xl font-black text-blue-600 mb-2 tracking-tight">Standard Priority</div>
               <p className="text-slate-500 text-lg">Estimated Wait: <span className="text-blue-600 font-bold">45 Minutes</span></p>
               
               <div className="mt-8 flex justify-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase text-xs tracking-widest">
                 <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                 Recent Lab Reports
               </h4>
               <div className="p-12 border-2 border-dashed border-slate-100 rounded-xl text-center">
                  <p className="text-slate-400 text-sm">No new reports available to display.</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Upcoming Consultation</h4>
               <p className="text-xl font-bold leading-tight">Post-Triage Assessment</p>
               <p className="text-emerald-100/70 text-sm mt-1">Pending physical evaluation</p>
               <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 rounded-lg mt-6 text-sm transition-colors border border-emerald-400/30">
                 Check In Early
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
