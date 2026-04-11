import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import axios from 'axios';
import {
  FileText,
  History,
  LogOut,
  MapPin,
  Wind,
  ShieldCheck,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
  Layers,
  ChevronRight,
  Crosshair,
  RefreshCw,
  Image as ImageIcon,
  Info,
  X,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Calendar,
  ArrowUpRight,
  Menu,
  Bell,
  MoreHorizontal,
  Package,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:5000';

const categoryConfig = {
  'Dead Animal': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🐾' },
  'Sewer Damage': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🚧' },
  'Potholes': { color: '#eab308', bg: 'rgba(234,179,8,0.12)', icon: '🕳️' },
  'General Waste': { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '🗑️' },
  'Pending Analysis': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: '⏳' },
};

const statusConfig = {
  'Open': { color: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', label: 'Open', icon: AlertTriangle },
  'In Progress': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', label: 'In Progress', icon: Activity },
  'Resolved': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Resolved', icon: CheckCircle2 },
  'Rejected': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Rejected', icon: X },
};

const getStatusCfg = (s) => statusConfig[s] || statusConfig['Open'];
const getCatCfg = (c) => categoryConfig[c] || categoryConfig['General Waste'];

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

/* ─── main component ────────────────────────────────────────────── */
const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userName = localStorage.getItem('userName') || 'Citizen User';
  const userEmail = localStorage.getItem('userEmail') || '';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aqiData, setAqiData] = useState({ value: '—', status: 'Loading', color: '#94a3b8' });
  const [locationData, setLocationData] = useState({ fetchStatus: 'loading', place: '', region: '' });
  const [now, setNow] = useState(new Date());
  const [isDark, setIsDark] = useState(true);

  /* theme tokens */
  const T = isDark ? {
    bg: '#060B18',
    bgGlow1: 'rgba(99,102,241,0.12)',
    bgGlow2: 'rgba(16,185,129,0.08)',
    bgGlow3: 'rgba(245,158,11,0.06)',
    sidebar: 'rgba(10,15,30,0.95)',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    card: 'rgba(14,20,40,0.7)',
    cardBorder: 'rgba(255,255,255,0.07)',
    topbar: 'rgba(6,11,24,0.8)',
    topbarBorder: 'rgba(255,255,255,0.05)',
    text: '#c9d4e8',
    textBold: '#f1f5f9',
    textMuted: '#8b99c0',
    textDim: '#4b5679',
    textDimmer: '#374162',
    divider: 'rgba(255,255,255,0.05)',
    inputBg: 'rgba(14,20,40,0.7)',
    userCardBg: 'rgba(255,255,255,0.03)',
    userCardBorder: 'rgba(255,255,255,0.06)',
    toggleBg: 'rgba(255,255,255,0.06)',
    toggleBorder: 'rgba(255,255,255,0.1)',
    toggleColor: '#818cf8',
    navHover: 'rgba(255,255,255,0.05)',
  } : {
    bg: '#f0f4ff',
    bgGlow1: 'rgba(99,102,241,0.08)',
    bgGlow2: 'rgba(16,185,129,0.05)',
    bgGlow3: 'rgba(245,158,11,0.04)',
    sidebar: 'rgba(255,255,255,0.97)',
    sidebarBorder: 'rgba(0,0,0,0.08)',
    card: 'rgba(255,255,255,0.9)',
    cardBorder: 'rgba(0,0,0,0.07)',
    topbar: 'rgba(240,244,255,0.92)',
    topbarBorder: 'rgba(0,0,0,0.07)',
    text: '#334155',
    textBold: '#0f172a',
    textMuted: '#475569',
    textDim: '#64748b',
    textDimmer: '#94a3b8',
    divider: 'rgba(0,0,0,0.06)',
    inputBg: 'rgba(255,255,255,0.9)',
    userCardBg: 'rgba(0,0,0,0.03)',
    userCardBorder: 'rgba(0,0,0,0.08)',
    toggleBg: 'rgba(251,191,36,0.12)',
    toggleBorder: 'rgba(251,191,36,0.3)',
    toggleColor: '#d97706',
    navHover: 'rgba(0,0,0,0.04)',
  };

  /* clock tick */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* fetch tickets */
  const fetchTickets = async () => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/report/tickets?email=${encodeURIComponent(userEmail)}`
      );
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not load your reports. Make sure the backend is running.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [userEmail]);

  /* open tracked ticket from query param */
  useEffect(() => {
    const track = searchParams.get('track');
    if (track && tickets.length) {
      const found = tickets.find(t => t.trackingId === track || t._id === track);
      if (found) setSelectedTicket(found);
    }
  }, [searchParams, tickets]);

  /* fetch real AQI and Location */
  useEffect(() => {
    const fetchAqiAndLoc = async (lat, lon) => {
      try {
        const [aqiRes, geoRes] = await Promise.all([
          axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`).catch(() => null),
          axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).catch(() => null)
        ]);

        if (aqiRes && aqiRes.data) {
          const aqi = aqiRes.data.current.us_aqi;
          let status = 'Good';
          let color = '#22c55e'; // Green

          if (aqi > 50 && aqi <= 100) {
            status = 'Moderate';
            color = '#eab308'; // Yellow
          } else if (aqi > 100 && aqi <= 150) {
            status = 'Unhealthy/Sens.';
            color = '#f97316'; // Orange
          } else if (aqi > 150 && aqi <= 200) {
            status = 'Unhealthy';
            color = '#ef4444'; // Red
          } else if (aqi > 200 && aqi <= 300) {
            status = 'Very Unhealthy';
            color = '#a855f7'; // Purple
          } else if (aqi > 300) {
            status = 'Hazardous';
            color = '#881337'; // Maroon
          }
          setAqiData({ value: Math.round(aqi).toString(), status, color });
        }

        if (geoRes && geoRes.data) {
          setLocationData({
            fetchStatus: 'success',
            place: geoRes.data.city || geoRes.data.locality || 'Unknown Area',
            region: geoRes.data.principalSubdivision || geoRes.data.countryName || 'Unknown Region',
            lat, lon
          });
        } else {
          setLocationData({ fetchStatus: 'error', place: 'Unavailable', region: '' });
        }

      } catch (err) {
        console.error('Data Fetch Error:', err);
        setAqiData({ value: 'N/A', status: 'Unavailable', color: '#94a3b8' });
        setLocationData({ fetchStatus: 'error', place: 'Unavailable', region: '' });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAqiAndLoc(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('Geolocation denied or failed, falling back to New Delhi', err);
          fetchAqiAndLoc(28.6139, 77.2090); // Fallback to New Delhi
        }
      );
    } else {
      fetchAqiAndLoc(28.6139, 77.2090);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  /* derived stats */
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  const filtered = tickets.filter(t => {
    const matchSearch =
      !searchQuery ||
      t.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.aiCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'reports', label: 'My Reports', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  /* ══ RENDER ══════════════════════════════════════════════════════ */
  return (
    <div className="dashboard-root" style={{
      height: '100vh',
      width: '100%',
      background: T.bg,
      fontFamily: "'Inter', sans-serif",
      color: T.text,
      overflow: 'hidden',
      transition: 'background 0.4s ease, color 0.4s ease',
    }}>
      <style>{`
        /* Responsive dashboard */
        .dashboard-root { display: flex; flex-direction: row; }
        .mobile-navbar { display: none; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .content-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 24px; }
        .dashboard-content { padding: 28px 32px 40px; flex: 1; overflow-y: auto; }
        .top-header { padding: 0 32px; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid ${T.topbarBorder}; transition: background 0.4s ease, border-color 0.4s ease; flex-shrink: 0; background: ${T.topbar}; backdrop-filter: blur(12px); }
        .desktop-sidebar { z-index: 40; position: relative; flex-shrink: 0; display: flex; flex-direction: column; background: ${T.sidebar}; border-right: 1px solid ${T.sidebarBorder}; backdrop-filter: blur(20px); transition: background 0.4s ease, border-color 0.4s ease; overflow-x: hidden; }
        
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dashboard-root { flex-direction: column; }
          .desktop-sidebar { display: none !important; }
          .mobile-navbar { display: flex; flex-direction: column; background: ${T.sidebar}; z-index: 50; flex-shrink: 0; backdrop-filter: blur(20px); transition: background 0.4s ease, border-color 0.4s ease; }
          .stats-grid { grid-template-columns: 1fr; }
          .dashboard-content { padding: 16px 20px 30px; }
          .top-header { padding: 0 16px; height: 60px; }
          .top-header-title { font-size: 16px !important; }
          .top-header-date { display: none !important; }
        }
        @media (max-width: 480px) {
          .submit-report-text { display: none; }
          .top-header { gap: 10px; }
        }
      `}</style>
      {/* ── Animated BG ─────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '50%', height: '50%',
          background: `radial-gradient(circle, ${T.bgGlow1} 0%, transparent 70%)`,
          filter: 'blur(40px)', transition: 'background 0.4s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '45%', height: '45%',
          background: `radial-gradient(circle, ${T.bgGlow2} 0%, transparent 70%)`,
          filter: 'blur(40px)', transition: 'background 0.4s ease',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: '30%', height: '30%',
          background: `radial-gradient(circle, ${T.bgGlow3} 0%, transparent 70%)`,
          filter: 'blur(60px)', transition: 'background 0.4s ease',
        }} />
      </div>

      {/* ── Mobile Top Navbar ──────────────────────────────────────────── */}
      <nav className="mobile-navbar">
        {/* Top Row: Logo & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="white" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              CleanSight <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '6px', cursor: 'pointer', display: 'flex' }}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Bottom Row: Navigation Tabs */}
        <div style={{ display: 'flex', padding: '6px 10px', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderBottom: `1px solid ${T.sidebarBorder}` }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 10, border: 'none',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#818cf8' : '#5a6585',
                  fontWeight: active ? 700 : 600, fontSize: 13,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Icon size={15} /> {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <motion.aside
        className="desktop-sidebar"
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          marginLeft: (window.innerWidth <= 768 && !sidebarOpen) ? -80 : 0
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? '24px 24px 20px' : '24px 0 20px', display: 'flex', flexDirection: sidebarOpen ? 'row' : 'column', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: sidebarOpen ? 0 : 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99,102,241,0.45)',
            }}>
              <Layers size={20} color="white" />
            </div>
            <AnimatePresence mode="popLayout">
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    CleanSight <span style={{
                      background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>AI</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#4b5679', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Citizen Hub
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px', cursor: 'pointer',
              display: 'flex', color: '#8b99c0', marginTop: 2
            }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: sidebarOpen ? '20px 14px' : '20px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarOpen && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#374162', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8, whiteSpace: 'nowrap' }}>
              Navigation
            </div>
          )}
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: sidebarOpen ? 12 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: sidebarOpen ? '11px 14px' : '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#818cf8' : '#5a6585',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.2 }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                      background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                      borderRadius: '0 4px 4px 0',
                      boxShadow: '0 0 12px rgba(99,102,241,0.8)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={17} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </motion.button>
            );
          })}


        </nav>



        {/* User & Logout */}
        <div style={{ padding: sidebarOpen ? '12px 14px 20px' : '12px 8px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, justifyContent: sidebarOpen ? 'flex-start' : 'center',
            padding: sidebarOpen ? '12px 14px' : '10px', borderRadius: 14, width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 8,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16, color: 'white', flexShrink: 0,
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Online</span>
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: sidebarOpen ? '10px 14px' : '12px 0', borderRadius: 12, border: '1px solid transparent',
              background: 'transparent', color: '#4b5679', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Sign Out</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, position: 'relative', zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Topbar */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* The menu button is now fully handled in the sidebar or sliding out on mobile. */}
            <div>
              <h1 className="top-header-title" style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'reports' ? 'My Reports' : 'History'}
              </h1>
              <div className="top-header-date" style={{ fontSize: 12, color: '#4b5679', fontWeight: 500, marginTop: 1 }}>
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Dark / Light toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDark(d => !d)}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: T.toggleBg,
                border: `1px solid ${T.toggleBorder}`,
                borderRadius: 10, padding: '8px', cursor: 'pointer', display: 'flex',
                color: T.toggleColor,
                transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex' }}
                  >
                    <Moon size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: 30, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -30, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex' }}
                  >
                    <Sun size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Refresh */}
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={fetchTickets}
              disabled={loading}
              style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 10, padding: '8px', cursor: 'pointer', display: 'flex',
                color: '#818cf8',
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={18} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 6px 28px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/report')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white', fontWeight: 700, fontSize: 13,
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              <Camera size={15} /> <span className="submit-report-text">Submit New Report</span>
            </motion.button>
          </div>
        </header>

        <div className="dashboard-content">
          <AnimatePresence mode="wait">

            {/* ══ DASHBOARD TAB ══════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                {/* Stats Row */}
                <motion.div
                  className="stats-grid"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { label: 'Total Reports', value: stats.total, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                    { label: 'In Progress', value: stats.inProgress, icon: Activity, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        style={{
                          padding: '22px 24px', borderRadius: 18,
                          background: T.card,
                          border: `1px solid ${T.cardBorder}`,
                          backdropFilter: 'blur(12px)',
                          position: 'relative', overflow: 'hidden',
                          cursor: 'default',
                          transition: 'background 0.4s ease',
                        }}
                      >
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: stat.bg, filter: 'blur(30px)' }} />
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: stat.bg, border: `1px solid ${stat.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 14,
                        }}>
                          <Icon size={20} color={stat.color} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: T.textBold, letterSpacing: '-0.03em', lineHeight: 1 }}>
                          {loading ? '—' : stat.value}
                        </div>
                        <div style={{ fontSize: 12, color: T.textDim, fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {stat.label}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* AQI Card — replaces Open card */}
                  <motion.div
                    key="aqi"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    style={{
                      padding: '22px 24px', borderRadius: 18,
                      background: T.card,
                      border: `1px solid ${T.cardBorder}`,
                      backdropFilter: 'blur(12px)',
                      position: 'relative', overflow: 'hidden',
                      cursor: 'default',
                      transition: 'background 0.4s ease',
                    }}
                  >
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${aqiData.color}20`, filter: 'blur(30px)' }} />
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `${aqiData.color}20`, border: `1px solid ${aqiData.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <Wind size={20} color={aqiData.color} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: aqiData.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {aqiData.value}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: aqiData.color, opacity: 0.85 }}>
                        {aqiData.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Local AQI
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: T.divider, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: aqiData.value !== '—' ? '49%' : '0%' }}
                        transition={{ duration: 1.5, delay: 0.6 }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${aqiData.color}88, ${aqiData.color})`, borderRadius: 99 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Latest Report Spotlight + Location Spotlight */}
                <div className="content-grid">

                  {/* Latest Ticket Card */}
                  <LatestTicketSpotlight ticket={tickets[0]} loading={loading} />

                  {/* Local Location */}
                  <LocalLocation locationData={locationData} loading={loading} />
                </div>

                {/* Recent table */}
                <ReportsTable
                  tickets={tickets.slice(0, 5)}
                  loading={loading}
                  error={error}
                  onView={setSelectedTicket}
                  compact
                  title="Recent Activity"
                />
              </motion.div>
            )}

            {/* ══ REPORTS TAB ════════════════════════════════════ */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                  {/* Search */}
                  <div style={{
                    flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderRadius: 12,
                    background: 'rgba(14,20,40,0.7)', border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <Search size={15} color="#4b5679" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by ID, category, location…"
                      style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        color: '#c9d4e8', fontSize: 14, fontFamily: 'inherit',
                      }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5679', display: 'flex' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Status filters */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setFilterStatus(s)}
                        style={{
                          padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600,
                          background: filterStatus === s ? 'rgba(99,102,241,0.2)' : 'rgba(14,20,40,0.7)',
                          color: filterStatus === s ? '#818cf8' : '#4b5679',
                          border: filterStatus === s ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <ReportsTable
                  tickets={filtered}
                  loading={loading}
                  error={error}
                  onView={setSelectedTicket}
                  title={`${filtered.length} Report${filtered.length !== 1 ? 's' : ''}`}
                />
              </motion.div>
            )}

            {/* ══ HISTORY TAB ════════════════════════════════════ */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <TimelineView tickets={tickets} loading={loading} onView={setSelectedTicket} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Ticket Detail Modal ───────────────────────────── */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* Latest Ticket Spotlight */
const LatestTicketSpotlight = ({ ticket, loading }) => {
  const cat = ticket ? getCatCfg(ticket.aiCategory) : getCatCfg('General Waste');
  const st = ticket ? getStatusCfg(ticket.status) : getStatusCfg('Open');
  const StIcon = st.icon;

  if (loading) return (
    <PulseCard style={{ borderRadius: 20, height: 340 }} />
  );

  if (!ticket) return (
    <EmptyCard icon={FileText} title="No Reports Yet" subtitle="Your latest report will appear here" style={{ borderRadius: 20, height: 340 }} />
  );

  const imgSrc = ticket.imageUrl
    ? `${API_BASE}${ticket.imageUrl}`
    : null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        borderRadius: 20,
        background: 'rgba(14,20,40,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        height: '100%',
        minHeight: 280
      }}
    >
      {/* Image Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="report"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,40,70,0.5)' }}>
            <ImageIcon size={40} color="rgba(255,255,255,0.1)" />
          </div>
        )}
      </div>

      {/* Top Banner overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to bottom, rgba(6,11,24,0.95) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, textShadow: '0 2px 10px rgba(0,0,0,1)' }}>
          <Activity size={12} color="#818cf8" /> Latest Report
        </div>
      </div>

      {/* Bottom Information Glass Panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
        padding: '30px 20px 20px',
        background: 'linear-gradient(to top, rgba(6,11,24,0.95) 0%, rgba(6,11,24,0.6) 50%, transparent 100%)',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,1)' }}>
            {cat.icon} {ticket.aiCategory || 'General Issue'}
          </div>
          <div style={{ background: `rgba(6,11,24,0.6)`, padding: '4px 10px', borderRadius: 8, border: `1px solid ${st.color}40`, backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: st.color, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
              <StIcon size={12} /> {ticket.status}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, textShadow: '0 2px 12px rgba(0,0,0,1)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={12} /> {ticket.location || 'Location Not Specified'}
        </div>
      </div>

    </motion.div>
  );
};

/* Local Location Card */
const LocalLocation = ({ locationData, loading }) => {
  if (loading || locationData.fetchStatus === 'loading') return <PulseCard style={{ borderRadius: 20, height: 280 }} />;

  return (
    <div style={{
      borderRadius: 20,
      background: 'rgba(14,20,40,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      height: '100%', minHeight: 280
    }}>
      {/* Map Background Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {locationData.lat && locationData.lon ? (
          <iframe
            title="Google Location Map"
            width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
            src={`https://maps.google.com/maps?q=${locationData.lat},${locationData.lon}&z=14&output=embed`}
            style={{ width: '100%', height: '100%', border: 0 }}
          ></iframe>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,40,70,0.5)' }}>
            <MapPin size={34} color="#818cf8" />
          </div>
        )}
      </div>

      {/* Top Banner overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to bottom, rgba(6,11,24,0.9) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, textShadow: '0 2px 10px rgba(0,0,0,1)' }}>
          <MapPin size={12} color="#818cf8" /> Current Location
        </div>
      </div>

      {/* Bottom Information Glass Panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
        padding: '30px 20px 20px',
        background: 'linear-gradient(to top, rgba(6,11,24,0.95) 0%, rgba(6,11,24,0.7) 50%, transparent 100%)',
        pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 2, textShadow: '0 2px 12px rgba(0,0,0,1)' }}>
          {locationData.place}
        </div>
        <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 700, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,1)' }}>
          {locationData.region || '—'}
        </div>
        {locationData.fetchStatus === 'error' && (
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>Fallback Location Loaded</div>
        )}
      </div>
    </div>
  );
};

/* Category Breakdown */
const CategoryBreakdown = ({ tickets, loading }) => {
  const counts = tickets.reduce((acc, t) => {
    const cat = t.aiCategory || 'General Waste';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const total = tickets.length || 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (loading) return <PulseCard style={{ borderRadius: 20, height: 340 }} />;

  return (
    <div style={{
      borderRadius: 20, padding: '22px 22px',
      background: 'rgba(14,20,40,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#c9d4e8', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={15} color="#6366f1" /> Category Breakdown
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#374162', paddingTop: 60, fontSize: 13 }}>No data yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sorted.map(([cat, count], i) => {
            const cfg = getCatCfg(cat);
            const pct = Math.round((count / total) * 100);
            return (
              <motion.div key={cat} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8b99c0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{cfg.icon}</span> {cat}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* Reports Table */
const ReportsTable = ({ tickets, loading, error, onView, compact, title }) => {
  if (loading) return (
    <div style={{
      borderRadius: 20, background: 'rgba(14,20,40,0.7)',
      border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden',
    }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 60, margin: '12px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{
      borderRadius: 20, padding: '40px 24px', textAlign: 'center',
      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
    }}>
      <AlertCircle size={32} color="#ef4444" style={{ marginBottom: 12 }} />
      <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>{error}</div>
      <div style={{ color: '#4b5679', fontSize: 13 }}>Make sure the backend server is running on port 5000.</div>
    </div>
  );

  if (tickets.length === 0) return (
    <EmptyCard
      icon={FileText}
      title="No Reports Found"
      subtitle="Reports you submit will appear here."
    />
  );

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(14,20,40,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#c9d4e8' }}>{title || 'Reports'}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['Tracking ID', 'Category', 'Location', 'Date', 'Status', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 10, fontWeight: 700, color: '#374162',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, i) => {
              const cat = getCatCfg(t.aiCategory);
              const st = getStatusCfg(t.status);
              const StIcon = st.icon;
              return (
                <motion.tr
                  key={t._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'default' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                      background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                      padding: '4px 10px', borderRadius: 8,
                    }}>
                      {t.trackingId}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b99c0', fontWeight: 500 }}>
                      <span>{cat.icon}</span> {t.aiCategory}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, color: '#4b5679', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={11} /> {t.location || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: '#4b5679' }}>
                      <div>{fmtDate(t.createdAt)}</div>
                      <div style={{ color: '#2c3557', marginTop: 1 }}>{fmtTime(t.createdAt)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 99,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <StIcon size={11} /> {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onView(t)}
                      style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 8, padding: '6px 12px',
                        color: '#818cf8', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Eye size={12} /> View
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* Timeline View */
const TimelineView = ({ tickets, loading, onView }) => {
  if (loading) return <PulseCard style={{ minHeight: 300, borderRadius: 20 }} />;
  if (tickets.length === 0) return (
    <EmptyCard icon={History} title="No History Yet" subtitle="Your timeline will appear here once you submit reports." />
  );

  /* Group by date */
  const grouped = tickets.reduce((acc, t) => {
    const key = fmtDate(t.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {Object.entries(grouped).map(([date, items], gi) => (
        <motion.div key={date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: gi * 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Calendar size={12} /> {date}
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: 11, color: '#374162', fontWeight: 600 }}>{items.length} report{items.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16, borderLeft: '2px solid rgba(99,102,241,0.15)' }}>
            {items.map((t, i) => {
              const cat = getCatCfg(t.aiCategory);
              const st = getStatusCfg(t.status);
              const StIcon = st.icon;
              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.1 + i * 0.07 }}
                  whileHover={{ x: 3, transition: { duration: 0.15 } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 18px', borderRadius: 14,
                    background: 'rgba(14,20,40,0.7)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    position: 'relative',
                    marginLeft: -9,
                  }}
                  onClick={() => onView(t)}
                >
                  {/* dot */}
                  <div style={{
                    position: 'absolute', left: -21, top: '50%', transform: 'translateY(-50%)',
                    width: 10, height: 10, borderRadius: '50%',
                    background: cat.color, boxShadow: `0 0 8px ${cat.color}`,
                    border: '2px solid #060B18',
                  }} />

                  <div style={{ fontSize: 20 }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#c9d4e8' }}>{t.aiCategory}</div>
                    <div style={{ fontSize: 11, color: '#4b5679', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <MapPin size={10} /> {t.location} &nbsp;•&nbsp; {fmtTime(t.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#818cf8',
                    background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 6,
                  }}>{t.trackingId}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 99,
                    background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <StIcon size={11} /> {t.status}
                  </span>
                  <ArrowUpRight size={14} color="#374162" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* Ticket Detail Modal */
const TicketDetailModal = ({ ticket, onClose }) => {
  const cat = getCatCfg(ticket.aiCategory);
  const st = getStatusCfg(ticket.status);
  const StIcon = st.icon;
  const imgSrc = ticket.imageUrl ? `${API_BASE}${ticket.imageUrl}` : null;

  const timeline = [
    { label: 'Report Submitted', time: fmtDate(ticket.createdAt) + ' · ' + fmtTime(ticket.createdAt), done: true },
    { label: 'AI Classification', time: 'Category: ' + (ticket.aiCategory || '—'), done: ticket.aiCategory !== 'Pending Analysis' },
    { label: 'Authority Review', time: ticket.status === 'In Progress' || ticket.status === 'Resolved' ? 'Underway' : 'Pending', done: ticket.status === 'In Progress' || ticket.status === 'Resolved' },
    { label: 'Issue Resolved', time: ticket.status === 'Resolved' ? 'Complete' : 'Pending', done: ticket.status === 'Resolved' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 760, maxHeight: '90vh',
          background: '#0a0f1e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(14,20,40,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24 }}>{cat.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{ticket.aiCategory}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#818cf8', fontWeight: 700 }}>{ticket.trackingId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 99,
              background: st.bg, color: st.color, border: `1px solid ${st.border}`,
              fontSize: 12, fontWeight: 700,
            }}>
              <StIcon size={13} /> {ticket.status}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 8, cursor: 'pointer',
                color: '#8b99c0', display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {/* Left: Image */}
            <div style={{ position: 'relative', minHeight: 280, background: '#060B18', overflow: 'hidden' }}>
              {imgSrc ? (
                <img src={imgSrc} alt="Report Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <ImageIcon size={40} color="rgba(255,255,255,0.1)" />
                  <span style={{ color: '#2c3557', fontSize: 13 }}>No image available</span>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(6,11,24,0.9), transparent)', padding: '20px 18px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#8b99c0' }}>
                  <MapPin size={12} /> {ticket.location}
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div style={{ padding: '22px 22px', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Reporter', value: ticket.user_name || '—' },
                  { label: 'Email', value: ticket.userEmail || '—' },
                  { label: 'Submitted', value: fmtDate(ticket.createdAt) },
                  { label: 'Time', value: fmtTime(ticket.createdAt) },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, color: '#374162', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#8b99c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Confidence */}
              {ticket.confidence > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#374162', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Confidence</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{ticket.confidence}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ticket.confidence}%` }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #10b981, #22c55e)', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {ticket.description && (
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
                  <div style={{ fontSize: 10, color: '#374162', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: 13, color: '#8b99c0', lineHeight: 1.6 }}>{ticket.description}</div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div style={{ fontSize: 10, color: '#374162', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Progress Timeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {timeline.map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: step.done ? '#22c55e' : 'rgba(255,255,255,0.06)',
                        border: step.done ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: step.done ? '0 0 10px rgba(34,197,94,0.6)' : 'none',
                        marginTop: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {step.done && <CheckCircle2 size={10} color="white" />}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? '#c9d4e8' : '#374162' }}>{step.label}</div>
                        <div style={{ fontSize: 11, color: '#2c3557', marginTop: 1 }}>{step.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* Pulse skeleton card */
const PulseCard = ({ style }) => (
  <div style={{
    borderRadius: 20, background: 'rgba(14,20,40,0.7)',
    border: '1px solid rgba(255,255,255,0.07)',
    animation: 'pulse 1.5s ease-in-out infinite',
    ...style,
  }}>
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
  </div>
);

/* Empty state */
const EmptyCard = ({ icon: Icon, title, subtitle, style }) => (
  <div style={{
    borderRadius: 20, padding: '60px 24px', textAlign: 'center',
    background: 'rgba(14,20,40,0.7)',
    border: '1px dashed rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
    ...style,
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
    }}>
      <Icon size={28} color="rgba(255,255,255,0.15)" />
    </div>
    <div style={{ fontSize: 16, fontWeight: 800, color: '#4b5679', marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: '#2c3557' }}>{subtitle}</div>
  </div>
);

export default CitizenDashboard;
