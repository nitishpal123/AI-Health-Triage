import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Activity, 
  ClipboardList, 
  FlaskConical, 
  ChevronRight, 
  History,
  Phone,
  Home,
  CheckCircle2,
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';

const PatientOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    symptoms: '',
    history: '',
    heartRate: '',
    bloodPressure: '',
    oxygenLevel: '',
    testsDone: false,
    testStatus: 'None'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Construct payload
    const payload = {
      ...formData,
      age: parseInt(formData.age),
      vitals: {
        heartRate: formData.heartRate,
        bloodPressure: formData.bloodPressure,
        oxygenLevel: formData.oxygenLevel
      }
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/tenant'), 2000);
      }
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;
    
    setIsBulkSubmitting(true);
    const body = new FormData();
    body.append('file', bulkFile);

    try {
      const response = await fetch('/api/patients/bulk', {
        method: 'POST',
        body
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/tenant'), 2000);
      }
    } catch (error) {
      console.error("Bulk onboarding failed:", error);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-widest">Onboarding Success</h2>
        <p className="text-slate-500 mt-2 font-bold">Redirecting to master registry dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tenant')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
          >
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase">Patient Onboarding</h1>
            <p className="text-[10px] text-sky-400 font-bold tracking-[0.2em] leading-none">{user?.tenantName || 'Main Hospital System'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center">
              <UserPlus size={16} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Intake Officer: {user?.name}</span>
        </div>
      </header>

      <main className="pt-28 pb-20 px-4 flex justify-center">
        <div className="w-full max-w-4xl space-y-12">
          
          {/* Bulk Upload Section */}
          <section className="bg-slate-900 border border-sky-500/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                      <FileSpreadsheet className="text-sky-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Bulk Operations</h2>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Automated ingestion via XLS or CSV dataset</p>
                    </div>
                 </div>
                 <a 
                   href="#" 
                   className="text-[10px] font-black text-sky-400 uppercase tracking-widest hover:text-sky-300 transition-colors border-b border-sky-400/30 pb-1"
                 >
                   Download Schema Template
                 </a>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                 <div className="md:col-span-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-3xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 hover:border-sky-500/50 transition-all duration-300 group/upload">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {bulkFile ? (
                              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-400">{bulkFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <UploadCloud className="w-8 h-8 mb-3 text-slate-600 group-hover/upload:text-sky-400 transition-colors" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/upload:text-slate-300">Drop clinical dataset or click to browse</p>
                              </>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          onChange={(e) => setBulkFile(e.target.files[0])}
                        />
                    </label>
                 </div>
                 <button
                    onClick={handleBulkSubmit}
                    disabled={!bulkFile || isBulkSubmitting}
                    className="h-full bg-slate-800 hover:bg-sky-600 disabled:opacity-20 text-white font-black uppercase text-xs tracking-widest rounded-3xl flex items-center justify-center p-6 transition-all active:scale-95 group/btn"
                 >
                    {isBulkSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Inject Map <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                 </button>
               </div>
             </div>
          </section>

          <div className="flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">OR INDIVIDUAL ENTRY</span>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Demographics & Contact */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <ClipboardList className="text-sky-400" size={24} />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Primary Identification</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                    <div className="relative group">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-sky-400" size={18} />
                      <input 
                        type="text" name="name" required
                        placeholder="e.g. Alexander Pierce"
                        value={formData.name} onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Biological Age</label>
                    <div className="relative group">
                      <History className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400" size={18} />
                      <input 
                        type="number" name="age" required
                        placeholder="Years"
                        value={formData.age} onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400" size={18} />
                      <input 
                        type="tel" name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone} onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                    <div className="relative group">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400" size={18} />
                      <input 
                        type="text" name="address"
                        placeholder="e.g. 42 Wallaby Way, Sydney"
                        value={formData.address} onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Activity className="text-emerald-400" size={24} />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Clinical Presentation</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Complaints & Symptoms</label>
                  <textarea 
                    name="symptoms" required rows="4"
                    placeholder="Describe the medical emergency or inquiry in detail..."
                    value={formData.symptoms} onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pb-2">
                  <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Pulse</p>
                    <input type="text" name="heartRate" placeholder="BPM" value={formData.heartRate} onChange={handleChange} className="bg-transparent text-white font-bold w-full outline-none text-lg" />
                  </div>
                  <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Pressure</p>
                    <input type="text" name="bloodPressure" placeholder="120/80" value={formData.bloodPressure} onChange={handleChange} className="bg-transparent text-white font-bold w-full outline-none text-lg" />
                  </div>
                  <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">Saturation</p>
                    <input type="text" name="oxygenLevel" placeholder="%" value={formData.oxygenLevel} onChange={handleChange} className="bg-transparent text-white font-bold w-full outline-none text-lg" />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Tests & Status */}
            <div className="space-y-6">
              <section className="bg-slate-900 border border-sky-500/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-sky-500/10 transition-colors"></div>
                
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <FlaskConical className="text-violet-400" size={24} />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Diagnostics</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all">
                    <div>
                      <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Diagnostic Tests Done</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Physical or lab verification</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" name="testsDone" 
                        checked={formData.testsDone} onChange={handleChange} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Test Status</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Pending', 'Processing', 'Partial', 'Released', 'None'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, testStatus: status }))}
                          className={`flex items-center justify-between px-5 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                            formData.testStatus === status 
                              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-violet-500/50 hover:text-white'
                          }`}
                        >
                          {status}
                          {formData.testStatus === status && <CheckCircle2 size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-6 rounded-3xl shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
              >
                {isSubmitting ? (
                   <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Encrypting...
                   </>
                ) : (
                  <>
                    Finalize Onboarding <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-loose text-center">
                  Data will be pushed to central HIE and mapped to clinical departments based on AI triage scoring. Ensure vital accuracy.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PatientOnboarding;
