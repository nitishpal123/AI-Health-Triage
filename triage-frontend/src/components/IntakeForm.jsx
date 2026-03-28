import React, { useState } from 'react';
import { Send, Activity, UserPlus } from 'lucide-react';

export default function IntakeForm({ onPatientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
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
    
    // Format vitals
    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      symptoms: formData.symptoms,
      history: formData.history,
      vitals: {
        heartRate: formData.heartRate,
        bloodPressure: formData.bloodPressure,
        oxygenLevel: formData.oxygenLevel
      }
    };

    try {
      const response = await fetch('http://localhost:3001/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      onPatientAdded(data);
      
      // Reset form
      setFormData({
        name: '', age: '', symptoms: '', history: '',
        heartRate: '', bloodPressure: '', oxygenLevel: ''
      });
    } catch (error) {
      console.error("Failed to add patient", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2><UserPlus size={20} /> New Patient Intake</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" name="name" required
            placeholder="e.g. John Doe"
            value={formData.name} onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Age</label>
          <input 
            type="number" name="age" required
            placeholder="e.g. 45"
            value={formData.age} onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label>Symptoms & Complaints</label>
          <textarea 
            name="symptoms" required rows="3"
            placeholder="Describe patient symptoms in detail..."
            value={formData.symptoms} onChange={handleChange} 
          ></textarea>
        </div>

        <div className="form-group">
          <label>Medical History</label>
          <textarea 
            name="history" rows="2"
            placeholder="Any chronic conditions, prior surgeries, or allergies..."
            value={formData.history} onChange={handleChange} 
          ></textarea>
        </div>

        <div className="form-group">
          <label><Activity size={14} style={{display:'inline', marginRight: '4px'}}/> Vitals</label>
          <div className="vitals-grid">
            <input 
              type="number" name="heartRate"
              placeholder="HR (bpm)"
              value={formData.heartRate} onChange={handleChange} 
            />
            <input 
              type="text" name="bloodPressure"
              placeholder="BP (e.g. 120/80)"
              value={formData.bloodPressure} onChange={handleChange} 
            />
            <input 
              type="number" name="oxygenLevel"
              placeholder="SpO2 (%)"
              value={formData.oxygenLevel} onChange={handleChange} 
            />
          </div>
        </div>

        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Evaluating AI Triage...' : 'Submit to AI Triage'} <Send size={18} />
        </button>
      </form>
    </div>
  );
}
