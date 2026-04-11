import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Lock, Mail, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from previous page state if available
  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = useMemo(() => {
    return !!email && otp.length === 6 && !!newPassword && newPassword === confirmPassword && newPassword.length >= 4;
  }, [email, otp, newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) {
      if (newPassword !== confirmPassword) setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      setSuccess(res.data?.message || 'Password reset successful.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#1E75FF', fontWeight: '800', fontSize: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E75FF', padding: '0.25rem', borderRadius: '0.3rem' }}>
          <KeyRound className="w-5 h-5" color="white" />
        </div>
        <span style={{ color: '#0f172a' }}>Security Center</span>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', width: '100%', maxWidth: '460px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', color: '#0f172a' }}>
          <ShieldCheck className="w-5 h-5" color="#10b981" />
          <span style={{ fontWeight: 800 }}>Complete Password Reset</span>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div style={{ color: '#166534', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '700', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}><CheckCircle2 size={16} style={{display: 'inline', marginRight: '5px'}}/> {success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email Address</label>
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
            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>6-Digit Verification Code</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1.25rem', color: '#0f172a', outline: 'none', letterSpacing: '0.5em', fontWeight: '800' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none', letterSpacing: '0.1em' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="w-5 h-5" color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', outline: 'none', letterSpacing: '0.1em' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !canSubmit} style={{ width: '100%', padding: '1rem', backgroundColor: '#1E75FF', color: 'white', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', opacity: loading || !canSubmit ? 0.7 : 1, boxShadow: '0 4px 12px rgba(30, 117, 255, 0.2)' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset My Password'}
          </button>
        </form>
      </div>

      <Link to="/login" style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', textDecoration: 'none' }}>← Cancel and Back to Login</Link>
    </div>
  );
};

export default ResetPassword;

