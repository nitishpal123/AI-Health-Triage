import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PatientList from '../components/PatientList'; 
import { LogOut, Building2, UserPlus, Users, Activity, Zap } from 'lucide-react';

const TenantDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeTriage: 0,
    totalDischarged: 0,
    systemLoad: '0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/patients/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard Stats Sync Failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
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
      
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-8 lg:p-12">
        <div className="mb-10 flex border-b border-slate-200 pb-8 items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Facility Governance</h2>
            <div className="h-1.5 w-24 bg-sky-500 rounded-full mt-3 mb-4"></div>
            <p className="text-slate-500 leading-relaxed max-w-2xl font-medium">
              Monitor enterprise-wide patient flow, department throughput, and pathology coordination across the entire medical campus.
            </p>
          </div>
          <Link 
            to="/onboarding" 
            className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl shadow-sky-600/20 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Onboard New Patient
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
           {[
             { label: 'Total Volume', val: stats.totalPatients, icon: <Users size={20}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: 'Active Triage', val: stats.activeTriage, icon: <Activity size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
             { label: 'Discharged', val: stats.totalDischarged, icon: <LogOut size={20}/>, color: 'text-sky-500', bg: 'bg-sky-50' },
             { label: 'System Load', val: stats.systemLoad, icon: <Zap size={20}/>, color: 'text-amber-500', bg: 'bg-amber-50' }
           ].map(s => (
             <div key={s.label} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  {s.icon}
                </div>
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                  {s.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{s.val}</p>
             </div>
           ))}
        </div>

        <div className="w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
                  Master Patient Registry
                </h3>
              </div>
              <div className="p-0 overflow-x-auto">
                 <PatientList isTable={true} />
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
