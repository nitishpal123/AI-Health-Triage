import React, { useState } from 'react';
import { Send, Activity, UserPlus } from 'lucide-react';

export default function IntakeForm({ onPatientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    symptoms: '',
    history: '',
    heartRate: '',
    bloodPressure: '',
    oxygenLevel: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      phone: formData.phone,
      address: formData.address,
      symptoms: formData.symptoms,
      history: formData.history,
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
      
      const data = await response.json();
      onPatientAdded(data);
      
      // Reset form
      setFormData({
        name: '', age: '', phone: '', address: '', symptoms: '', history: '',
        heartRate: '', bloodPressure: '', oxygenLevel: ''
      });
    } catch (error) {
      console.error("Failed to add patient", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel border-emerald-500/10 shadow-emerald-500/5">
      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-4 tracking-tight uppercase">
        <UserPlus size={22} className="text-emerald-500" /> 
        Patient Triage Intake
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" name="name" required
              placeholder="e.g. John Doe"
              value={formData.name} onChange={handleChange} 
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Age</label>
            <input 
              type="number" name="age" required
              placeholder="e.g. 45"
              value={formData.age} onChange={handleChange} 
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Phone Number</label>
            <input 
              type="tel" name="phone"
              placeholder="e.g. 555-0199"
              value={formData.phone} onChange={handleChange} 
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Address</label>
            <input 
              type="text" name="address"
              placeholder="e.g. 123 Main St"
              value={formData.address} onChange={handleChange} 
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Symptoms & Complaints</label>
          <textarea 
            name="symptoms" required rows="3"
            placeholder="Describe patient symptoms in detail..."
            value={formData.symptoms} onChange={handleChange} 
            className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm resize-none"
          ></textarea>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Medical History</label>
          <textarea 
            name="history" rows="2"
            placeholder="Any chronic conditions, prior surgeries, or allergies..."
            value={formData.history} onChange={handleChange} 
            className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-sm resize-none"
          ></textarea>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[11px] font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] ml-1">
            <Activity size={16} className="text-emerald-500" /> Vital Statistics
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pulse (BPM)</label>
              <input 
                type="number" name="heartRate"
                placeholder="72"
                value={formData.heartRate} onChange={handleChange} 
                className="w-full bg-slate-900/60 border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none text-xs transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">BP (SYS/DIA)</label>
              <input 
                type="text" name="bloodPressure"
                placeholder="120/80"
                value={formData.bloodPressure} onChange={handleChange} 
                className="w-full bg-slate-900/60 border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none text-xs transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">SpO2 (%)</label>
              <input 
                type="number" name="oxygenLevel"
                placeholder="98"
                value={formData.oxygenLevel} onChange={handleChange} 
                className="w-full bg-slate-900/60 border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none text-xs transition-colors"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-6 disabled:opacity-50 disabled:grayscale"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              AI Processing...
            </span>
          ) : (
            <>
              Submit to AI Triage <Send size={16} />
            </>
          )} 
        </button>
      </form>
    </div>
  );
}
