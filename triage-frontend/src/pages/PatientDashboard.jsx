import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchMyRecord } from '../api/patientService';
import VirtualDoctorChat from '../components/VirtualDoctorChat';
import {
  LogOut, UserCircle2, CheckCircle2, Clock, Circle, FlaskConical,
  Stethoscope, UserPlus, Activity, FileText, DoorOpen, AlertTriangle
} from 'lucide-react';

const STEP_ICONS = {
  'Patient Onboarded':    <UserPlus size={18} />,
  'Doctor Assigned':      <Stethoscope size={18} />,
  'Lab Tests Ordered':    <FlaskConical size={18} />,
  'Lab Processing':       <Activity size={18} />,
  'Results Released':     <FileText size={18} />,
  'Doctor Consultation':  <Stethoscope size={18} />,
  'Discharged':           <DoorOpen size={18} />,
};

const TRIAGE_COLORS = {
  Critical: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50 border-red-200' },
  Urgent:   { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50 border-orange-200' },
  Standard: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-200' },
};

const StepNode = ({ step, isLast }) => {
  const icon = STEP_ICONS[step.step] || <Circle size={18} />;
  const isCompleted = step.status === 'completed';
  const isActive = step.status === 'active';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
          isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' :
          isActive    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse' :
                        'bg-white border-slate-200 text-slate-300'
        }`}>
          {isCompleted ? <CheckCircle2 size={18} /> : icon}
        </div>
        {!isLast && <div className={`w-0.5 h-10 mt-1 ${isCompleted ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
      </div>
      <div className="pb-8 pt-1.5 flex-1">
        <p className={`text-sm font-black uppercase tracking-tight ${
          isCompleted ? 'text-slate-800' : isActive ? 'text-blue-700' : 'text-slate-300'
        }`}>{step.step}</p>
        <p className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest ${
          isCompleted ? 'text-emerald-500' : isActive ? 'text-blue-400' : 'text-slate-300'
        }`}>
          {isCompleted ? `Completed${step.completedAt ? ' · ' + new Date(step.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` :
           isActive ? 'In Progress' : 'Pending'}
        </p>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: record, isLoading, isError, refetch } = useQuery({
    queryKey: ['myRecord'],
    queryFn: fetchMyRecord,
    refetchInterval: 15000
  });

  const triage = record ? (TRIAGE_COLORS[record.triageLevel] || TRIAGE_COLORS.Standard) : null;
  const activeStep = record?.journey?.find(s => s.status === 'active');
  const completedCount = record?.journey?.filter(s => s.status === 'completed').length || 0;
  const totalSteps = record?.journey?.length || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <UserCircle2 size={24} className="text-blue-100" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Patient Care Portal</h1>
            <p className="text-[10px] text-blue-200 font-bold tracking-widest uppercase">Live Journey Tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-blue-100 hidden sm:block">{user?.name}</span>
          <button onClick={logout} className="flex items-center gap-2 bg-blue-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading your health record...</p>
          </div>
        )}

        {isError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
            <p className="font-black text-amber-800">No active patient record found.</p>
            <p className="text-amber-600 text-sm mt-1">Use the <span className="font-black text-blue-600">Virtual Doctor</span> button below to describe your symptoms and get registered.</p>
          </div>
        )}

        {record && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Journey Tracker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              <div className={`rounded-2xl border p-6 ${triage.light}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Status</p>
                    <p className={`text-2xl font-black mt-1 ${triage.text}`}>{record.triageLevel} Priority</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-widest ${triage.bg}`}>
                    Score: {record.score}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-slate-400" />
                  <p className="text-sm text-slate-600 font-bold">Est. Wait: <span className={`font-black ${triage.text}`}>{record.estimatedWaitTime}</span></p>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                    <span>Journey Progress</span>
                    <span>{completedCount}/{totalSteps} Steps</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Journey Steps */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  Care Journey
                </h3>
                {record.journey?.length > 0 ? (
                  record.journey.map((step, i) => (
                    <StepNode key={step.step} step={step} isLast={i === record.journey.length - 1} />
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic text-center py-8">Journey not yet initialized.</p>
                )}
              </div>
            </div>

            {/* Right: Info Cards */}
            <div className="space-y-4">
              {/* Current Step */}
              {activeStep && (
                <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-200">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Currently At</p>
                  <p className="text-lg font-black">{activeStep.step}</p>
                  <div className="flex gap-1 mt-3">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />)}
                  </div>
                </div>
              )}

              {/* Doctor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Stethoscope size={12} /> Assigned Doctor
                </p>
                <p className="font-black text-slate-800 text-sm">{record.recommendedDoctor || 'Pending Assignment'}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{record.department || 'General Practice'}</p>
              </div>

              {/* Lab */}
              {record.assignedLabName && (
                <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-3 flex items-center gap-2">
                    <FlaskConical size={12} /> Assigned Lab
                  </p>
                  <p className="font-black text-slate-800 text-sm">{record.assignedLabName}</p>
                  <div className={`mt-2 inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    record.testStatus === 'Released'   ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    record.testStatus === 'Processing' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                    record.testStatus === 'Pending'    ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                         'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {record.testStatus}
                  </div>
                  {record.labTests?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tests Ordered</p>
                      {record.labTests.map(t => (
                        <div key={t} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <span className="w-1 h-1 bg-violet-400 rounded-full" />{t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Vitals */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Activity size={12} /> Vitals on Admission
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'HR', val: record.vitals?.heartRate, unit: 'bpm' },
                    { label: 'BP', val: record.vitals?.bloodPressure, unit: 'mmHg' },
                    { label: 'SpO2', val: record.vitals?.oxygenLevel, unit: '%' },
                  ].map(v => (
                    <div key={v.label} className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase">{v.label}</p>
                      <p className="text-sm font-black text-slate-800">{v.val || '—'}</p>
                      <p className="text-[7px] text-slate-400 font-bold">{v.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Report */}
              {record.medicalReport && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                    <FileText size={12} /> Doctor's Assessment
                  </p>
                  <p className="text-sm text-emerald-900 font-bold italic leading-relaxed">"{record.medicalReport}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <VirtualDoctorChat user={user} onRecordSaved={() => { refetch(); }} />
    </div>
  );
};

export default PatientDashboard;
