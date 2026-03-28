import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Bot, X, Mic, MicOff, Send, Loader2, CheckCircle2,
  AlertTriangle, Activity, Stethoscope, FlaskConical,
  ChevronDown, Volume2, Globe, Star, MapPin, Clock, 
  Home, DoorOpen, CreditCard, ChevronRight, Calendar
} from 'lucide-react';

const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const PRIORITY_STYLE = {
  Critical: { bg: 'bg-red-500', light: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
  Urgent:   { bg: 'bg-orange-500', light: 'bg-orange-50 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
  Standard: { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
};

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
];

export default function VirtualDoctorChat({ user, onRecordSaved }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null); 
  const [phase, setPhase] = useState('chat'); // 'chat' | 'result' | 'labs' | 'booking' | 'confirmed'
  
  // Lab Selection
  const [labs, setLabs] = useState([]);
  const [fetchingLabs, setFetchingLabs] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [bookingType, setBookingType] = useState('walk-in'); // 'walk-in' | 'home'
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState(null);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      sendToAI([], true);
    }
  }, [open]);

  const sendToAI = async (history, isGreeting = false) => {
    setLoading(true);
    try {
      const msgs = isGreeting
        ? [{ role: 'user', content: `Hello, I need to see a doctor. My name is ${user?.name || 'Patient'}.` }]
        : history;

      const { data } = await axios.post('/api/virtual-doctor/chat', {
        messages: msgs,
        patientContext: { name: user?.name, age: user?.age || 30 }
      }, getConfig());

      const aiMsg = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMsg]);

      if (data.assessment?.readyToSave) {
        setAssessment(data.assessment);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    await sendToAI(updated);
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Please use Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      inputRef.current?.focus();
    };
    recognition.start();
  };

  const handleSaveAssessment = async () => {
    if (!assessment) return;
    setSaving(true);
    try {
      const { data } = await axios.post('/api/virtual-doctor/save-assessment', {
        assessment,
        patientName: user?.name,
        patientAge: user?.age || 30,
      }, getConfig());
      setSaved(data);
      setPhase('result');
      onRecordSaved?.();
    } catch {
      alert('Failed to save assessment.');
    } finally {
      setSaving(false);
    }
  };

  const fetchLabs = async () => {
    setFetchingLabs(true);
    try {
      const tests = saved.recommendedTests?.map(t => t.name).join(',') || '';
      const { data } = await axios.get(`/api/virtual-doctor/labs?tests=${tests}&diagnosis=${saved.triage?.level}&age=${user?.age}`, getConfig());
      setLabs(data.labs);
      setPhase('labs');
    } catch {
      alert('Failed to find labs.');
    } finally {
      setFetchingLabs(false);
    }
  };

  const handleBook = async () => {
    if (!selectedLab) return;
    setBookingLoading(true);
    try {
      const total = bookingType === 'home' ? selectedLab.totalHome : selectedLab.totalWalkIn;
      const { data } = await axios.post('/api/virtual-doctor/book', {
        labId: selectedLab._id,
        tests: selectedLab.matchedServices.filter(s => s.available).map(s => s.name),
        bookingType,
        totalPrice: total,
        patientRecordId: saved.patient?.id,
        patientName: user?.name,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00 AM' // Simplified
      }, getConfig());
      setBookingRef(data);
      setPhase('confirmed');
      onRecordSaved?.();
    } catch {
      alert('Failed to complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setInput('');
    setAssessment(null);
    setSaved(null);
    setPhase('chat');
    setLabs([]);
    setSelectedLab(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 group"
      >
        <Bot size={22} className="group-hover:rotate-12 transition-transform" />
        <span className="font-black text-sm uppercase tracking-widest">Digital Care Aid</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full sm:w-[460px] h-[100dvh] sm:h-[750px] bg-white sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-10 transition-all">
            
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-white text-xs uppercase tracking-widest">Medical Assistant</p>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Dr. Aria AI · Specialist Grade</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
              {phase === 'chat' && (
                <div className="p-4 space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-sm font-bold shadow-lg shadow-blue-200' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm font-bold shadow-sm'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && <div className="flex justify-start items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl w-fit animate-pulse">
                    <Loader2 size={12} className="animate-spin text-blue-600" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Processing Symptoms...</span>
                  </div>}
                  {assessment && !loading && (
                    <div className="bg-emerald-600 p-6 rounded-[24px] text-white shadow-xl shadow-emerald-200 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={18} />
                        <h4 className="text-xs font-black uppercase tracking-widest">Insights Synchronized</h4>
                      </div>
                      <p className="text-[11px] font-bold opacity-90 leading-relaxed mb-5">Enough data has been collected to generate your clinical priority index and routing plan.</p>
                      <button 
                        onClick={handleSaveAssessment} 
                        disabled={saving}
                        className="w-full bg-white text-emerald-600 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <><Stethoscope size={14} /> Calculate Triage Priority</>}
                      </button>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}

              {phase === 'result' && saved && (
                <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className={`rounded-[28px] border-2 p-6 ${PRIORITY_STYLE[saved.triage?.level]?.light}`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${PRIORITY_STYLE[saved.triage?.level]?.bg}`}>
                        {saved.triage?.level} Priority
                      </span>
                      <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 leading-none">{saved.triage?.score}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Nervous Index</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><Stethoscope size={20} className="text-blue-600" /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Doctor</p>
                          <p className="text-sm font-black text-slate-800">{saved.triage?.recommendedDoctor}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><Clock size={20} className="text-orange-500" /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Wait Time</p>
                          <p className="text-sm font-black text-slate-800">{saved.triage?.estimatedWaitTime} Minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {saved.recommendedTests?.length > 0 && (
                    <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
                        <FlaskConical size={14} className="text-violet-500" /> AI Indicator Mapping
                      </h4>
                      <div className="space-y-3">
                        {saved.recommendedTests.map((t, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group transition-all">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-xs font-black text-slate-800 uppercase">{t.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t.reason}</p>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${t.urgency === 'immediate' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                   {t.urgency}
                                </span>
                             </div>
                          </div>
                        ))}
                      </div>
                      <button 
                         onClick={fetchLabs}
                         disabled={fetchingLabs}
                         className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
                      >
                         {fetchingLabs ? <Loader2 size={14} className="animate-spin" /> : <><MapPin size={16} className="text-blue-400" /> Discover Nearby Labs</>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {phase === 'labs' && (
                <div className="p-6 space-y-6">
                  <button onClick={() => setPhase('result')} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 flex items-center gap-1 mb-2">Back to Triage</button>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Select Laboratory</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Displaying competitive pricing for AI-mapped tests</p>
                  </div>

                  <div className="space-y-4">
                    {labs.length === 0 ? (
                      <div className="py-20 text-center">
                        <MapPin size={40} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-bold">No partner labs found in your area.</p>
                      </div>
                    ) : (
                      labs.map(lab => (
                        <div 
                          key={lab._id} 
                          className={`bg-white rounded-[32px] border-2 p-6 transition-all cursor-pointer hover:shadow-xl group relative overflow-hidden ${selectedLab?._id === lab._id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 hover:border-slate-200'}`}
                          onClick={() => { setSelectedLab(lab); setPhase('booking'); }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-black text-slate-900 uppercase tracking-tight">{lab.name}</h5>
                                  <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                     <Star size={10} className="text-amber-500 fill-amber-500" />
                                     <span className="text-[10px] font-black text-amber-700">{lab.rating}</span>
                                  </div>
                               </div>
                               <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase truncate max-w-[200px]">
                                  <MapPin size={10} /> {lab.address}
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="text-xl font-black text-blue-600 leading-none">${lab.totalWalkIn}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Starting Price</p>
                            </div>
                          </div>

                          <div className="mt-5 flex gap-2">
                             {lab.homeCollection && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1"><Home size={10}/> Home Collection</span>}
                             {lab.walkIn && <span className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1"><DoorOpen size={10}/> Clinic Walk-in</span>}
                          </div>

                          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><ChevronRight size={20}/></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {phase === 'booking' && selectedLab && (
                <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                   <button onClick={() => setPhase('labs')} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 flex items-center gap-1 mb-2">Change Laboratory</button>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Reservation Options</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedLab.name}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setBookingType('walk-in')}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${bookingType === 'walk-in' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                      >
                         <DoorOpen size={32} className={bookingType === 'walk-in' ? 'text-blue-600' : 'text-slate-300'} />
                         <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-800">Clinic Walk-in</p>
                            <p className="text-lg font-black text-slate-900 mt-1">${selectedLab.totalWalkIn}</p>
                         </div>
                      </button>
                      <button 
                        onClick={() => setBookingType('home')}
                        disabled={!selectedLab.homeCollection}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${bookingType === 'home' ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-white hover:border-slate-200 disabled:opacity-40'}`}
                      >
                         <Home size={32} className={bookingType === 'home' ? 'text-violet-600' : 'text-slate-300'} />
                         <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-800">Home Collection</p>
                            <p className="text-lg font-black text-slate-900 mt-1">${selectedLab.totalHome}</p>
                         </div>
                      </button>
                   </div>

                   <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Order Summary</h5>
                         <CreditCard size={18} className="text-slate-600" />
                      </div>
                      <div className="space-y-3 mb-8">
                         {selectedLab.matchedServices.filter(s => s.available).map(s => (
                            <div key={s.name} className="flex justify-between items-center text-[11px] font-bold">
                               <span className="text-slate-300 truncate">{s.name}</span>
                               <span className="text-white">${bookingType === 'home' ? (s.homePrice || s.price) : s.price}</span>
                            </div>
                         ))}
                         <div className="h-px bg-slate-800 my-4" />
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-500">Total Payable</span>
                            <span className="text-2xl font-black text-white">${bookingType === 'home' ? selectedLab.totalHome : selectedLab.totalWalkIn}</span>
                         </div>
                      </div>
                      <button 
                        onClick={handleBook}
                        disabled={bookingLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-2xl transition-all shadow-xl shadow-blue-950 active:scale-95 flex items-center justify-center gap-2"
                      >
                         {bookingLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Proceed to Payment'}
                      </button>
                   </div>
                </div>
              )}

              {phase === 'confirmed' && bookingRef && (
                 <div className="p-10 flex flex-col items-center justify-center text-center h-full animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-[40px] flex items-center justify-center mb-8 shadow-xl shadow-emerald-100/50">
                       <CheckCircle2 size={48} className="text-emerald-600" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Booking Success</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[260px] mx-auto">
                       Diagnostic reservation confirmed at <br/><span className="text-blue-600">{bookingRef.lab?.name}</span>
                    </p>
                    
                    <div className="mt-12 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm w-full divide-y divide-slate-50">
                       <div className="pb-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Appointment Type</p>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{bookingType === 'home' ? 'Home Collection Service' : 'Clinic Walk-in'}</p>
                       </div>
                       <div className="py-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Slot</p>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Today · 09:00 AM – 11:00 AM</p>
                       </div>
                       <div className="pt-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Action Required</p>
                          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Please ensure you have fasted for 8 hours if required for specific glucose or lipid panels.</p>
                       </div>
                    </div>

                    <button 
                       onClick={handleClose}
                       className="mt-12 w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl active:scale-95"
                    >
                       Done
                    </button>
                 </div>
              )}
            </div>

            {/* Chat Input Bar - Only show in chat phase */}
            {phase === 'chat' && (
              <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
                <div className="flex gap-3 items-end">
                  <button 
                    onClick={handleVoice} 
                    className={`p-4 rounded-2xl border transition-all ${listening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300'}`}
                  >
                    {listening ? <MicOff size={20}/> : <Mic size={20}/>}
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Briefly describe what you are feeling..."
                    rows={1}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-blue-200"
                  >
                    <Send size={20}/>
                  </button>
                </div>
              </div>
            )}

            {/* Global Language Selector Overlay */}
            {showLangMenu && (
              <div className="absolute inset-x-0 bottom-24 p-4 z-50">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {LANGUAGES.map(l => (
                    <button 
                      key={l.code} 
                      onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                      className={`w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest ${lang === l.code ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
