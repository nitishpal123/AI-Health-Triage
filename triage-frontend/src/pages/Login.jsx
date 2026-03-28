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
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Stethoscope size={48} color="#16a34a" style={{ margin: '0 auto' }} />
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#166534', marginTop: '1rem' }}>AI Health Triage</h1>
          <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Secure Multitenant Portal</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}
              placeholder="admin@hospital.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', background: '#16a34a', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={16}/> Hospital</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Stethoscope size={16}/> Doctor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UserCircle2 size={16}/> Patient</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FlaskConical size={16}/> Lab</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
