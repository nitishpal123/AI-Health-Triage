import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList'; // Using the existing component for now
import { LogOut, Building2 } from 'lucide-react';

const TenantDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-xl border-b border-sky-500/20">
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/20 p-2.5 rounded-xl border border-sky-500/30 shadow-inner">
            <Building2 size={28} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Hospital Administration</h1>
            <p className="text-[10px] text-sky-400 font-bold tracking-[0.2em] leading-none">Command & Control Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end border-r border-slate-700 pr-8">
            <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">{user?.name}</span>
            <span className="text-[10px] text-slate-500 font-bold">Facility: {user?.tenantName || 'Main Hospital'}</span>
          </div>
          <button 
            onClick={logout}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-red-600 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-lg"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm">Terminate Session</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 lg:p-12">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Facility Governance</h2>
          <div className="h-1.5 w-24 bg-sky-500 rounded-full mt-3 mb-4"></div>
          <p className="text-slate-500 leading-relaxed max-w-2xl font-medium">
            Monitor enterprise-wide patient flow, department throughput, and pathology coordination across the entire medical campus.
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Quick Stats Placeholder for a more complete look */}
          <div className="xl:col-span-1 space-y-4">
             {[
               { label: 'Total Staff', val: '142', color: 'bg-blue-500' },
               { label: 'Active Triage', val: '18', color: 'bg-emerald-500' },
               { label: 'System Load', val: '24%', color: 'bg-sky-500' }
             ].map(s => (
               <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                 <p className="text-3xl font-black text-slate-800 mt-1">{s.val}</p>
                 <div className={`h-1 w-full ${s.color} rounded-full mt-4 opacity-20`}></div>
               </div>
             ))}
          </div>

          <div className="xl:col-span-3 bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
                  Master Patient Registry
                </h3>
                <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                   <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse delay-75"></div>
                </div>
              </div>
              <div className="p-4 sm:p-8">
                 <PatientList />
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
