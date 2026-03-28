import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, FlaskConical } from 'lucide-react';

const PathologyDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-violet-50/30 flex flex-col">
      <header className="bg-violet-900 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-violet-800">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/20 p-2 rounded-xl border border-violet-500/30">
            <FlaskConical size={24} className="text-violet-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Diagnostic Lab Portal</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-violet-100 uppercase tracking-widest">{user?.name}</span>
            <span className="text-[10px] text-violet-400 font-bold tracking-[0.2em] leading-none">Senior Pathologist</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-violet-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md border border-violet-600/50"
          >
            <LogOut size={16} /> 
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-violet-200 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Order Processing Queue</h2>
            <p className="text-slate-500 mt-1 font-medium">Verify and execute clinical diagnostic requests</p>
          </div>
          <div className="flex gap-4">
             <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pending</p>
                <p className="text-xl font-black text-violet-600">0</p>
             </div>
             <div className="text-center border-l border-slate-200 pl-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completed</p>
                <p className="text-xl font-black text-emerald-600">12</p>
             </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-violet-900/5 border border-violet-100 p-12 overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6">
              <FlaskConical size={40} className="text-violet-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">All tests are synchronized</h3>
            <p className="text-slate-400 max-w-xs mt-2 italic">You currently have no pending lab orders routed from any facility department.</p>
            
            <button className="mt-8 text-violet-600 font-bold text-xs uppercase tracking-widest hover:text-violet-700 transition-colors">
              Refresh Master Queue
            </button>
        </div>
      </main>
    </div>
  );
};

export default PathologyDashboard;
