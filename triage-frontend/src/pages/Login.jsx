import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Building2, UserCircle2, FlaskConical } from 'lucide-react';
import '../index.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(email, password);
      
      // Role-based routing
      if (user.role === 'HospitalAdmin') navigate('/tenant');
      else if (user.role === 'Doctor') navigate('/doctor');
      else if (user.role === 'Pathologist') navigate('/pathology');
      else if (user.role === 'Patient') navigate('/patient');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -mr-48 -mt-48 transition-all duration-700 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-48 -mb-48 transition-all duration-700"></div>

      <div className="w-full max-w-md">
        <div className="glass-panel relative z-10 border border-emerald-500/20 shadow-emerald-500/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-2xl mb-4 group ring-1 ring-emerald-500/20">
              <Stethoscope size={48} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Health Triage</h1>
            <p className="text-emerald-500/60 mt-1 font-medium">Secure Multitenant Portal</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="admin@hospital.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <Building2 size={16} className="text-emerald-500"/>
                <span>Hospital</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <Stethoscope size={16} className="text-emerald-500"/>
                <span>Doctor</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <UserCircle2 size={16} className="text-emerald-500"/>
                <span>Patient</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <FlaskConical size={16} className="text-emerald-500"/>
                <span>Lab</span>
              </div>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
          AI Health Triage &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
