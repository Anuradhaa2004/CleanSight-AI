import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Shield, FileText, CheckCircle2, AlertTriangle,
  MapPin, Activity, LayoutDashboard, Database, User,
  Sun, Moon
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const getStatusColor = (st) => {
  if (st === 'Open') return { color: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' };
  if (st === 'In Progress') return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' };
  if (st === 'Resolved') return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' };
  return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' };
};

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [statusMessage, setStatusMessage] = useState('');
  const [now, setNow] = useState(new Date());
  const [mapQuery, setMapQuery] = useState(null); // No default map
  const [isDark, setIsDark] = useState(true);

  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || 'Authority User';
  const assignedArea = localStorage.getItem('userArea') || '';

  // Theme Config (Dynamic Light / Dark)
  const T = isDark ? {
    bg: '#0a0d14',
    sidebar: 'rgba(12,16,28,0.95)',
    sidebarTxt: '#94a3b8',
    border: 'rgba(255,255,255,0.06)',
    card: 'rgba(16,22,40,0.6)',
    text: '#c9d4e8',
    textMain: '#f1f5f9',
    accent: '#3b82f6',
    header: 'rgba(10,13,20,0.8)',
    statBg: 'rgba(59,130,246,0.1)'
  } : {
    bg: '#f8fafc',
    sidebar: '#ffffff',
    sidebarTxt: '#64748b',
    border: '#e2e8f0',
    card: '#ffffff',
    text: '#64748b',
    textMain: '#0f172a',
    accent: '#2563eb',
    header: 'rgba(255,255,255,0.8)',
    statBg: '#eff6ff'
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // No longer auto-setting mapQuery to city view
  }, []);

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      if (!assignedArea) {
        // Need to fetch area
        try {
          const res = await axios.get(`${API_BASE}/api/auth/user?email=${encodeURIComponent(userEmail)}`);
          if (res.data.user.assignedArea) {
            localStorage.setItem('userArea', res.data.user.assignedArea);
            window.location.reload();
          } else {
            setStatusMessage('No assigned authority area found for your account. Please contact SuperAdmin.');
          }
        } catch (err) {
          setStatusMessage('Error verifying authority access.');
        }
        setLoading(false);
        return;
      }

      await fetchTickets();
    };

    loadData();
  }, [userEmail, assignedArea, navigate]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/report/tickets`, {
        params: { role: 'authority', area: assignedArea }
      });
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to fetch reports');
    }
    setLoading(false);
  };

  const handleStatusChange = async (ticketId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    try {
      await axios.patch(`${API_BASE}/api/report/ticket/${ticketId}/status`, { status: newStatus });
      fetchTickets();
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  if (!assignedArea && statusMessage) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, color: T.textMain }}>
        <div style={{ background: T.card, padding: 40, borderRadius: 20, border: `1px solid ${T.border}` }}>
          <h2 style={{ marginTop: 0 }}>Access Restricted</h2>
          <p>{statusMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root" style={{ height: '100vh', width: '100%', background: T.bg, fontFamily: "'Inter', sans-serif", color: T.text, overflow: 'hidden' }}>
      <style>{`
         .dashboard-root { display: flex; flex-direction: row; }
         .mobile-navbar { display: none; }
         .desktop-sidebar { z-index: 40; flex-shrink: 0; display: flex; flex-direction: column; overflow-x: hidden; border-right: 1px solid ${T.border}; }
         .top-header { height: 72px; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${T.border}; background: ${T.header}; flex-shrink: 0; }
         .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
         .incidents-table tr { transition: background 0.3s ease; }
         .incidents-table tr:hover { background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; }
         .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding-top: 0 !important; }
         .scrollable-workspace { flex: 1; padding: 32px; overflow-y: auto; }
         
         @media (max-width: 768px) {
           .dashboard-root { flex-direction: column; }
           .desktop-sidebar { display: none !important; }
           .mobile-navbar { display: flex; flex-direction: column; background: ${T.sidebar}; z-index: 50; flex-shrink: 0; border-bottom: 1px solid ${T.border}; }
           .stats-grid { grid-template-columns: 1fr; }
           .top-header { padding: 0 16px; height: 60px; }
           .top-header h1 { font-size: 16px !important; }
           .scrollable-workspace { padding: 16px 16px; }
           .mobile-hide { display: none !important; }
         }
      `}</style>

      {/* Mobile Navbar */}
      <div className="mobile-navbar">
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Command Center</div>
              <div style={{ fontSize: 10, color: T.accent, fontWeight: 700 }}>{assignedArea} Auth</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{userEmail}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', padding: '12px 16px', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <button onClick={() => setActiveTab('board')} style={{ flex: '0 0 auto', padding: '10px 16px', borderRadius: 10, background: activeTab === 'board' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'board' ? '#3b82f6' : T.text, border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Database size={16} /> Incidents
          </button>
          <button onClick={() => setActiveTab('analytics')} style={{ flex: '0 0 auto', padding: '10px 16px', borderRadius: 10, background: activeTab === 'analytics' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'analytics' ? '#3b82f6' : T.text, border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <LayoutDashboard size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className="desktop-sidebar"
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        style={{ background: T.sidebar, backdropFilter: 'blur(20px)' }}
      >
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={20} color="white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.textMain }}>Command Center</div>
                <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 2 }}>{assignedArea} Auth</div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, opacity: 0.8 }}>{userEmail}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setActiveTab('board')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 12, background: activeTab === 'board' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'board' ? '#3b82f6' : T.text, border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
            <Database size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Incidents Board</span>}
          </button>
          <button onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 12, background: activeTab === 'analytics' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'analytics' ? '#3b82f6' : T.text, border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Analytics</span>}
          </button>
        </nav>

        <div style={{ padding: '20px 16px', borderTop: `1px solid ${T.border}` }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, justifyContent: sidebarOpen ? 'flex-start' : 'center', whiteSpace: 'nowrap' }}>
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="mobile-hide" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: T.text, cursor: 'pointer' }}>
              <LayoutDashboard size={24} />
            </button>
            <div>
              <h1 style={{ fontWeight: 700, color: T.textMain, margin: 0 }}>{assignedArea} Operations</h1>
              <p className="mobile-hide" style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Active ticketing portal for municipal authorities</p>
            </div>
          </div>
          <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.05)' : '#eff6ff',
                border: `1px solid ${T.border}`,
                color: isDark ? '#facc15' : '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#3b82f6" />
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="scrollable-workspace">

          {/* Top Metric Row */}
          <div className="stats-grid">
            {[
              { label: 'Total Logs', value: stats.total, color: '#3b82f6', icon: FileText },
              { label: 'Open Incidents', value: stats.open, color: '#facc15', icon: AlertTriangle },
              { label: 'In Progress', value: stats.inProgress, color: '#a855f7', icon: Activity },
              { label: 'Resolved', value: stats.resolved, color: '#22c55e', icon: CheckCircle2 }
            ].map(s => (
              <div key={s.label} style={{ background: T.card, padding: 24, borderRadius: 16, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={22} color={s.color} />
                  </div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.textMain, marginBottom: 4 }}>{loading ? '—' : s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Geographic Coverage Map Box */}
          <div style={{
            background: T.card, borderRadius: 20, border: `1px solid ${T.border}`,
            overflow: 'hidden', marginBottom: 32, height: 260, position: 'relative'
          }}>
            {mapQuery ? (
              <iframe
                title="Authority Area Map"
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery.q)}&z=18&output=embed`}
                style={{ border: 0, filter: isDark ? 'invert(100%) hue-rotate(180deg) contrast(90%)' : 'none' }}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <MapPin size={32} color={T.accent} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: T.text, opacity: 0.5, fontWeight: 600 }}>Click "View Map" to track incident</div>
              </div>
            )}
          </div>

          {/* Active Incidents Board */}
          <div style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: T.textMain, fontWeight: 800 }}>Active Incidents Board</h2>
              <button onClick={fetchTickets} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.textMain, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Refresh Database</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="incidents-table" style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 28px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking ID</th>
                    <th style={{ padding: '16px 28px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence</th>
                    <th style={{ padding: '16px 28px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Target</th>
                    <th style={{ padding: '16px 28px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Detail</th>
                    <th style={{ padding: '16px 28px', fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading database...</td></tr>
                  ) : tickets.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No incidents matched for {assignedArea}.</td></tr>
                  ) : (
                    tickets.map((t) => {
                      const stCfg = getStatusColor(t.status);
                      return (
                        <tr key={t._id} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: '20px 28px', fontSize: 14, fontFamily: 'monospace', color: '#3b82f6', fontWeight: 700 }}>{t.trackingId}</td>
                          <td style={{ padding: '20px 28px' }}>
                            <div style={{ 
                              width: 60, height: 44, borderRadius: 8, 
                              overflow: 'hidden', border: `1px solid ${T.border}`,
                              background: 'rgba(0,0,0,0.2)'
                            }}>
                              <img 
                                src={`${API_BASE}${t.imageUrl}`} 
                                alt="Incident Evidence" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/60x44?text=No+Img'; }}
                              />
                            </div>
                            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td style={{ padding: '20px 28px', fontSize: 14, fontWeight: 700, color: '#c9d4e8' }}>{t.aiCategory || 'General Issue'}</td>
                          <td style={{ padding: '20px 28px', maxWidth: 220 }}>
                            <div 
                              onClick={() => {
                                const q = (t.lat && t.lon) ? `${t.lat},${t.lon}` : t.location;
                                setMapQuery({ q, label: t.location });
                                document.querySelector('.scrollable-workspace').scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ 
                                width: 28, height: 28, borderRadius: 8, 
                                background: 'rgba(59,130,246,0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <MapPin size={14} color="#3b82f6" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.textMain, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {t.location || 'Unknown Area'}
                                </span>
                                <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase' }}>Pinpoint Area</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 28px' }}>
                            {t.status === 'Open' && (
                              <button
                                onClick={() => handleStatusChange(t._id, t.status, 'In Progress')}
                                style={{
                                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  color: 'white', border: 'none', cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                  width: '120px'
                                }}
                              >
                                Accept Case
                              </button>
                            )}
                            {t.status === 'In Progress' && (
                              <button
                                onClick={() => handleStatusChange(t._id, t.status, 'Resolved')}
                                style={{
                                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white', border: 'none', cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                  width: '120px'
                                }}
                              >
                                Mark Resolved
                              </button>
                            )}
                            {t.status === 'Resolved' && (
                              <div style={{
                                padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                width: '120px', textAlign: 'center'
                              }}>
                                Completed ✅
                              </div>
                            )}
                            {t.status === 'Rejected' && (
                              <div style={{
                                padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                width: '120px', textAlign: 'center'
                              }}>
                                Rejected ❌
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
export default AuthorityDashboard;
