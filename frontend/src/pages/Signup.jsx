import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, ShieldCheck, User, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'authority'
  const [assignedArea, setAssignedArea] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const authorityAreas = ['Satna', 'Jabalpur', 'Rewa', 'Narsinghpur', 'Burhanpur'];

  useEffect(() => {
    if (role === 'authority') {
      detectAssignedArea();
    }
    if (role === 'citizen') {
      setAssignedArea('');
      setLocationMessage('');
      setDetectingLocation(false);
      setPermissionDenied(false);
    }
  }, [role]);

  const normalizeArea = (value) => {
    if (!value) return '';
    const normalized = value.toLowerCase();
    return authorityAreas.find((area) => normalized.includes(area.toLowerCase())) || '';
  };

  const fetchAreaByCoordinates = async (lat, lng) => {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          zoom: 10
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      const address = res.data?.address || {};
      const candidates = [address.city, address.town, address.village, address.county, address.state_district, address.state, res.data?.display_name];
      for (const candidate of candidates) {
        const mapped = normalizeArea(candidate);
        if (mapped) return mapped;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return '';
    }
  };

  const detectAssignedArea = () => {
    if (role !== 'authority') return;
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation not supported. Please enable location services.');
      setPermissionDenied(true);
      setAssignedArea('');
      return;
    }

    setDetectingLocation(true);
    setLocationMessage('Detecting your area...');
    setPermissionDenied(false);
    setAssignedArea('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedArea = await fetchAreaByCoordinates(position.coords.latitude, position.coords.longitude);
        if (detectedArea) {
          setAssignedArea(detectedArea);
          setLocationMessage(`Detected area: ${detectedArea}`);
          setPermissionDenied(false);
        } else {
          setLocationMessage('Unable to map your current location to a valid authority area. Please enable location services and try again.');
          setPermissionDenied(true);
        }
        setDetectingLocation(false);
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        if (geoError.code === 1) {
          setLocationMessage('Location permission denied. Please enable location services to register as an authority.');
          setPermissionDenied(true);
        } else if (geoError.code === 2) {
          setLocationMessage('Location unavailable. Please try again or enable location services.');
          setPermissionDenied(true);
        } else if (geoError.code === 3) {
          setLocationMessage('Location request timed out. Please try again.');
          setPermissionDenied(true);
        } else {
          setLocationMessage('Could not detect your location. Please enable location services and refresh.');
          setPermissionDenied(true);
        }
        setAssignedArea('');
        setDetectingLocation(false);
      },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: true }
    );
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (role === 'authority' && !assignedArea) {
      setError('Please select your assigned area before continuing.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/request-otp', 
        { email, password, role, name, assignedArea },
        { timeout: 15000 } // 15s Timeout
      );
      setStep(2);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Server is taking too long to respond. Please check your internet or try again later.');
      } else {
        setError(err.response?.data?.message || 'Server error. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      
      // Store dummy password in local storage so Login can verify it seamlessly for demo purposes
      localStorage.setItem('localAuthPassword', password);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userRole', res.data.user.role || role);
      localStorage.setItem('userName', res.data.user.name || name);
      localStorage.setItem('userArea', res.data.user.assignedArea || '');

      // Redirect based on role
      if (role === 'authority') {
        navigate('/authority');
      } else {
        navigate('/report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
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
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Join CleanSight AI</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Start your journey to a cleaner environment today.</p>
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

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>
            </div>

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
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Choose Password</label>
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

            {role === 'authority' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Assigned Area</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={assignedArea}
                    placeholder={detectingLocation ? 'Detecting your area...' : 'Waiting for location access...'}
                    readOnly
                    className="mnc-input"
                    style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none' }}
                    required
                  />
                </div>
                <p style={{ color: permissionDenied ? '#dc2626' : '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {locationMessage || 'Your area will be detected automatically from your current location.'}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#4F46E5', color: 'white', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', textAlign: 'center', margin: 0 }}>
              We sent a 6-digit code to <strong style={{ color: '#0f172a' }}>{email}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Enter OTP</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShieldCheck className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1.25rem', color: '#0f172a', outline: 'none', letterSpacing: '0.2em', textAlign: 'center' }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#4F46E5', color: 'white', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying...' : 'Verify & Setup Account'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
        Already have an account? <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
