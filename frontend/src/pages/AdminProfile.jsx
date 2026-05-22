import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import {
  LogOut, Shield, LayoutDashboard, Database, User,
  Sun, Moon, Camera, Mail, Lock, MapPin, Info, Calendar, Globe, Languages,
  ChevronRight, Sparkles, Eye, EyeOff, Save, ArrowLeft, Briefcase, KeyRound
} from 'lucide-react';

const AdminProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', assignedArea: '', about: '',
    profilePic: '', dob: '', gender: '', exactLocation: '', country: '', languages: []
  });

  const originalEmail = localStorage.getItem('userEmail') || '';

  const T = isDark ? {
    bg: '#06080f', surface: 'rgba(15,20,35,0.85)', surfaceHover: 'rgba(20,28,50,0.9)',
    border: 'rgba(255,255,255,0.06)', borderActive: 'rgba(99,141,255,0.3)',
    text: '#8b9dc3', textMain: '#e8edf5', accent: '#638dff', accentSoft: 'rgba(99,141,255,0.12)',
    input: 'rgba(8,12,24,0.6)', inputFocus: 'rgba(15,20,40,0.8)',
    gradient1: '#638dff', gradient2: '#38bdf8', gradient3: '#818cf8',
    danger: '#f87171', success: '#34d399', cardShadow: '0 20px 60px -15px rgba(0,0,0,0.6)'
  } : {
    bg: '#f1f5f9', surface: '#ffffff', surfaceHover: '#f8fafc',
    border: '#e2e8f0', borderActive: '#93b4fd',
    text: '#64748b', textMain: '#0f172a', accent: '#4f6df5', accentSoft: 'rgba(79,109,245,0.08)',
    input: '#f8fafc', inputFocus: '#ffffff',
    gradient1: '#4f6df5', gradient2: '#06b6d4', gradient3: '#8b5cf6',
    danger: '#ef4444', success: '#10b981', cardShadow: '0 20px 60px -15px rgba(0,0,0,0.08)'
  };

  const genderOptions = ['Male', 'Female', 'Other'];
  const languageList = [
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese',
    'Japanese', 'Russian', 'Arabic', 'Portuguese', 'Italian', 'Bengali',
    'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam'
  ];

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  useEffect(() => {
    if (!originalEmail) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/user?email=${encodeURIComponent(originalEmail)}`);
        if (res.data.user) {
          const u = res.data.user;
          setFormData({
            name: u.name, email: u.email, password: '', assignedArea: u.assignedArea,
            about: u.about || '', profilePic: u.profilePic || '',
            dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
            gender: u.gender || '', exactLocation: u.exactLocation || '',
            country: u.country || '', languages: u.languages || []
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [originalEmail, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, profilePic: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(p => ({ ...p, exactLocation: `${pos.coords.latitude}, ${pos.coords.longitude}` }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/update-profile`, { originalEmail, ...formData });
      if (res.status === 200) {
        localStorage.setItem('userName', res.data.user.name);
        localStorage.setItem('userEmail', res.data.user.email);
        localStorage.setItem('userArea', res.data.user.assignedArea);
        localStorage.setItem('userProfilePic', res.data.user.profilePic || '');
        setSaveSuccess(true);
        setTimeout(() => navigate('/authority'), 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const Field = ({ label, icon: Icon, children, span2 }) => (
    <div className={span2 ? 'ap-field-span-2' : ''} style={{ gridColumn: span2 ? 'span 2' : 'auto' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        <Icon size={13} /> {label}
      </label>
      {children}
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1.5px solid ${T.border}`,
    color: T.textMain, fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    fontFamily: "'Inter', sans-serif"
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Sparkles size={32} color={T.accent} />
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", color: T.text, overflowY: 'auto' }}>
      <style>{`
        .ap-input { width: 100%; padding: 14px 18px; border-radius: 14px; background: ${T.input}; border: 1.5px solid ${T.border}; color: ${T.textMain}; font-size: 14px; font-weight: 600; outline: none; transition: all 0.3s; font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .ap-input:focus { border-color: ${T.accent}; background: ${T.inputFocus}; box-shadow: 0 0 0 4px ${T.accentSoft}; }
        .ap-input::placeholder { color: ${T.text}; opacity: 0.5; }
        select.ap-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23638dff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; }
        select.ap-input option { background: ${isDark ? '#0f1428' : '#fff'}; color: ${T.textMain}; }
        textarea.ap-input { resize: none; min-height: 100px; }
        .ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ap-content-card { background: ${T.surface}; border-radius: 24px; border: 1px solid ${T.border}; padding: 36px; box-shadow: ${T.cardShadow}; }
        @media (max-width: 768px) { 
          .ap-grid { grid-template-columns: 1fr; gap: 20px; } 
          .ap-hero-info { flex-direction: column; text-align: center; gap: 20px; } 
          .ap-tabs { overflow-x: auto; padding: 4px; }
          .ap-content-card { padding: 24px 20px; }
          .ap-field-span-2 { grid-column: span 1 !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: isDark ? 'rgba(6,8,15,0.75)' : 'rgba(241,245,249,0.85)', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/authority')} style={{ width: 38, height: 38, borderRadius: 12, background: T.accentSoft, border: `1px solid ${T.border}`, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={18} />
            </motion.button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.textMain }}>Profile Settings</div>
              <div style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>Manage your identity</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsDark(!isDark)} style={{ width: 38, height: 38, borderRadius: 12, background: T.accentSoft, border: `1px solid ${T.border}`, color: isDark ? '#facc15' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Hero Profile Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ background: `linear-gradient(135deg, ${T.gradient1}15, ${T.gradient2}10, ${T.gradient3}08)`, borderRadius: 28, border: `1px solid ${T.border}`, padding: '36px 40px', marginBottom: 28, position: 'relative', overflow: 'hidden', boxShadow: T.cardShadow }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${T.gradient1}08`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: `${T.gradient2}06`, pointerEvents: 'none' }} />

          <div className="ap-hero-info" style={{ display: 'flex', alignItems: 'center', gap: 28, position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} onClick={() => fileInputRef.current.click()}
              style={{ width: 100, height: 100, borderRadius: 24, border: `3px solid ${T.accent}40`, background: isDark ? '#111827' : '#e2e8f0', overflow: 'hidden', cursor: 'pointer', position: 'relative', flexShrink: 0, boxShadow: `0 8px 30px ${T.accent}20` }}>
              {formData.profilePic ? (
                <img src={formData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} color={T.text} />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 }}>
                <Camera size={14} color="white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
            </motion.div>

            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: T.textMain, letterSpacing: '-0.02em' }}>
                {formData.name || 'Authority Admin'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.success }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{formData.assignedArea} Division</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}25` }}>
                  <Shield size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> AUTHORITY
                </span>
                {formData.languages[0] && (
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, background: `${T.gradient2}12`, color: T.gradient2, border: `1px solid ${T.gradient2}25` }}>
                    <Languages size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> {formData.languages[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="ap-tabs" style={{ display: 'flex', gap: 6, marginBottom: 24, background: T.surface, padding: 6, borderRadius: 18, border: `1px solid ${T.border}` }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button key={tab.id} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: "'Inter', sans-serif", transition: 'all 0.3s',
                  background: active ? `linear-gradient(135deg, ${T.gradient1}, ${T.gradient3})` : 'transparent',
                  color: active ? '#fff' : T.text, boxShadow: active ? `0 4px 15px ${T.accent}30` : 'none'
                }}>
                <Icon size={16} /> {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="ap-content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color={T.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.textMain }}>Personal Information</div>
                    <div style={{ fontSize: 12, color: T.text }}>Your identity and preferences</div>
                  </div>
                </div>

                <div className="ap-grid">
                  <Field label="Full Name" icon={User} span2>
                    <input className="ap-input" type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter your full name" />
                  </Field>
                  <Field label="Email Address" icon={Mail}>
                    <input className="ap-input" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="admin@cleansight.ai" />
                  </Field>
                  <Field label="Date of Birth" icon={Calendar}>
                    <input className="ap-input" type="date" value={formData.dob} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} />
                  </Field>
                  <Field label="Gender" icon={User}>
                    <select className="ap-input" value={formData.gender} onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select Gender</option>
                      {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Primary Language" icon={Languages}>
                    <select className="ap-input" value={formData.languages[0] || ''} onChange={e => setFormData(p => ({ ...p, languages: [e.target.value] }))}>
                      <option value="">Select Language</option>
                      <option value="English">English (Default)</option>
                      <option value="Hindi">Hindi (Default)</option>
                      {languageList.filter(l => l !== 'English' && l !== 'Hindi').map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Professional Bio" icon={Briefcase} span2>
                    <textarea className="ap-input" value={formData.about} onChange={e => setFormData(p => ({ ...p, about: e.target.value }))} placeholder="Describe your role, department, or expertise..." />
                  </Field>
                </div>
              </motion.div>
            )}

            {activeTab === 'location' && (
              <motion.div key="location" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="ap-content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${T.gradient2}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color={T.gradient2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.textMain }}>Location & Region</div>
                    <div style={{ fontSize: 12, color: T.text }}>Your jurisdiction details</div>
                  </div>
                </div>

                <div className="ap-grid">
                  <Field label="Country" icon={Globe}>
                    <input className="ap-input" type="text" value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} placeholder="e.g. India, USA" />
                  </Field>
                  <Field label="Assigned Area" icon={Shield}>
                    <input className="ap-input" type="text" value={formData.assignedArea} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </Field>
                  <Field label="GPS Coordinates" icon={MapPin} span2>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input className="ap-input" type="text" value={formData.exactLocation} onChange={e => setFormData(p => ({ ...p, exactLocation: e.target.value }))} placeholder="Latitude, Longitude or address" style={{ flex: 1 }} />
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={getUserLocation}
                        style={{ padding: '14px 20px', borderRadius: 14, background: `linear-gradient(135deg, ${T.gradient2}, ${T.gradient1})`, color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: `0 4px 15px ${T.gradient2}30` }}>
                        DETECT GPS
                      </motion.button>
                    </div>
                  </Field>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="ap-content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${T.gradient3}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={20} color={T.gradient3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.textMain }}>Security & Access</div>
                    <div style={{ fontSize: 12, color: T.text }}>Manage your credentials</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Field label="Update Password" icon={Lock} span2>
                    <div style={{ position: 'relative' }}>
                      <input className="ap-input" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Enter new password (max 3 changes per 14 days)" style={{ paddingRight: 50 }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.accent, cursor: 'pointer', padding: 4 }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>

                  <div style={{ padding: '18px 20px', borderRadius: 16, background: T.accentSoft, border: `1px solid ${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: T.textMain }}>Forgot your password?</div>
                      <div style={{ fontSize: 12, color: T.text, marginTop: 2 }}>Reset via email verification</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate('/forgot-password')}
                      style={{ padding: '10px 20px', borderRadius: 12, background: `linear-gradient(135deg, ${T.gradient3}, ${T.gradient1})`, color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 12px ${T.gradient3}25` }}>
                      Reset Password <ChevronRight size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />
                    </motion.button>
                  </div>

                  <div style={{ padding: '16px 20px', borderRadius: 14, background: `${T.danger}08`, border: `1px solid ${T.danger}15` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: T.danger, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Security Policy</div>
                    <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>Password updates are limited to 3 changes within any 14-day rolling window for account protection.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 28 }}>
            <motion.button whileHover={{ scale: 1.01, boxShadow: `0 12px 35px ${T.accent}35` }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={saving}
              style={{ width: '100%', padding: '18px', borderRadius: 18, background: saveSuccess ? `linear-gradient(135deg, ${T.success}, #059669)` : `linear-gradient(135deg, ${T.gradient1}, ${T.gradient3})`, color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: saving ? 'wait' : 'pointer', boxShadow: `0 8px 25px ${T.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>
              {saveSuccess ? <><Sparkles size={20} /> Profile Saved Successfully!</> : saving ? 'Saving...' : <><Save size={18} /> Commit Changes</>}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
