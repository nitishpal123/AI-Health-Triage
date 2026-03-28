import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchPatients, updateLabStatus } from '../api/patientService';
import { LogOut, FlaskConical, AlertTriangle, CheckCircle2, Clock, Activity } from 'lucide-react';

const STATUS_FLOW = ['Pending', 'Processing', 'Partial', 'Released'];

const STATUS_STYLE = {
  Pending:    'bg-amber-50 text-amber-600 border-amber-200',
  Processing: 'bg-violet-50 text-violet-600 border-violet-200',
  Partial:    'bg-blue-50 text-blue-600 border-blue-200',
  Released:   'bg-emerald-50 text-emerald-600 border-emerald-200',
  None:       'bg-slate-50 text-slate-400 border-slate-200',
};

const PathologyDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: allPatients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    refetchInterval: 10000
  });

  const labPatients = allPatients.filter(p => p.assignedLabName && p.testStatus !== 'None');
  const pending = labPatients.filter(p => p.testStatus === 'Pending').length;
  const processing = labPatients.filter(p => p.testStatus === 'Processing').length;
  const released = labPatients.filter(p => p.testStatus === 'Released').length;

  const labMutation = useMutation({
    mutationFn: updateLabStatus,
    onSuccess: () => queryClient.invalidateQueries(['patients'])
  });

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  return (
    <div className="min-h-screen bg-violet-50/30 flex flex-col">
      <header className="bg-violet-900 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-violet-800">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/20 p-2 rounded-xl border border-violet-500/30">
            <FlaskConical size={24} className="text-violet-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Diagnostic Lab Portal</h1>
            <p className="text-[10px] text-violet-300 font-bold tracking-widest uppercase">Core Diagnostics Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-violet-100 uppercase tracking-widest">{user?.name}</span>
            <span className="text-[10px] text-violet-400 font-bold tracking-[0.2em] leading-none">Senior Pathologist</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-violet-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 border border-violet-600/50">
            <LogOut size={16} /> <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', val: pending, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <Clock size={18} className="text-amber-500" /> },
            { label: 'Processing', val: processing, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', icon: <Activity size={18} className="text-violet-500" /> },
            { label: 'Released', val: released, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={18} className="text-emerald-500" /> },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} flex items-center gap-4`}>
              {s.icon}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-violet-900/5 border border-violet-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-5 bg-violet-500 rounded-full" /> Lab Order Queue
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase">{labPatients.length} Active Orders</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : labPatients.length === 0 ? (
            <div className="p-16 text-center">
              <FlaskConical size={40} className="text-violet-200 mx-auto mb-4" />
              <p className="font-bold text-slate-500">No pending lab orders.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {labPatients.map(patient => {
                const next = nextStatus(patient.testStatus);
                const theme = TRIAGE_THEME[patient.triageLevel] || TRIAGE_THEME.Standard;
                return (
                  <div key={patient.id} className="px-8 py-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-slate-800 uppercase tracking-tight">{patient.name}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${theme}`}>
                            {patient.triageLevel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                          {patient.age} yrs · {patient.department} · Dr. {patient.recommendedDoctor?.split('(')[0].trim()}
                        </p>

                        {/* Tests */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {patient.labTests?.map(t => (
                            <span key={t} className="bg-violet-50 text-violet-700 border border-violet-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border ${STATUS_STYLE[patient.testStatus] || STATUS_STYLE.None}`}>
                          {patient.testStatus}
                        </span>
                        {next && (
                          <button
                            onClick={() => labMutation.mutate({ id: patient.id, testStatus: next })}
                            disabled={labMutation.isPending}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95"
                          >
                            Mark {next}
                          </button>
                        )}
                        {!next && (
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={12} /> Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const TRIAGE_THEME = {
  Critical: 'bg-red-50 text-red-600 border-red-200',
  Urgent:   'bg-orange-50 text-orange-600 border-orange-200',
  Standard: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export default PathologyDashboard;
