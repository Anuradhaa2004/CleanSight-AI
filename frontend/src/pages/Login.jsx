import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, LogIn, User, ShieldAlert, Send, X } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'authority'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password, role });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userRole', res.data.user.role);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userArea', res.data.user.assignedArea || '');
      
      if (res.data.user.role === 'authority') {
        navigate('/authority');
      } else {
        navigate('/report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#1E75FF', fontWeight: '800', fontSize: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E75FF', padding: '0.25rem', borderRadius: '0.3rem' }}>
           <Leaf className="w-5 h-5" color="white" />
        </div>
        <span style={{ color: '#0f172a' }}>CleanSight AI</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Welcome Back</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Log in to continue managing waste reports.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', marginBottom: '2rem' }}>
        
        {/* Role Selector */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.4rem', borderRadius: '1rem', marginBottom: '2rem', gap: '0.4rem' }}>
          <button 
            onClick={() => setRole('citizen')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              backgroundColor: role === 'citizen' ? 'white' : 'transparent',
              color: role === 'citizen' ? '#1E75FF' : '#64748b',
              boxShadow: role === 'citizen' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={18} /> Citizen
          </button>
          <button 
            onClick={() => setRole('authority')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              backgroundColor: role === 'authority' ? 'white' : 'transparent',
              color: role === 'authority' ? '#1E75FF' : '#64748b',
              boxShadow: role === 'authority' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldAlert size={18} /> Authority
          </button>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontWeight: '600', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
               <Link
                 to="/forgot-password"
                 style={{ fontSize: '0.75rem', color: '#1E75FF', fontWeight: '800', textDecoration: 'none' }}
               >
                 Forgot Password?
               </Link>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none', letterSpacing: '0.1em' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#4F46E5', color: 'white', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Log In'} <LogIn className="w-5 h-5" />
          </button>
        </form>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
