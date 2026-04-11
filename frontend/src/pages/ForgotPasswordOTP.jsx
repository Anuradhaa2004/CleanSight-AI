import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const ForgotPasswordOTP = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(res.data.detail || 'Code sent successfully!');
            
            // Redirect to Reset page after short delay, passing email as state
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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

            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Forgot Password?</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter your registered email to receive a 6-digit verification code.</p>
                </div>

                {message && <div style={{ color: '#166534', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '700', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}><ShieldCheck size={16} style={{display: 'inline', marginRight: '5px'}}/> {message}</div>}
                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#1E75FF', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(30, 117, 255, 0.2)' }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Verification Code <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>

            <Link to="/login" style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700', textDecoration: 'none' }}>
                ← Back to Login
            </Link>
        </div>
    );
};

export default ForgotPasswordOTP;
