import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  CheckCircle2, 
  MapPin, 
  Smartphone, 
  Mail, 
  User, 
  ShieldAlert, 
  X, 
  Camera, 
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '', location: '', description: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [coords, setCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiCategory, setAiCategory] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [, setLocationAccuracy] = useState(null);

  // Auto-fill from localStorage and auto-detect location on page load
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || '';
    const storedName = localStorage.getItem('userName') || '';
    const storedMobile = localStorage.getItem('userMobile') || '';
    
    setFormData(prev => ({ 
      ...prev, 
      email: storedEmail, 
      fullName: storedName,
      mobile: storedMobile,
      location: 'Loading location...' 
    }));
    
    handleAutoDetectLocation();
  }, []);

  const reverseGeocodeNominatim = async (lat, lng) => {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        // City-level zoom reduces "wrong street" noise when GPS accuracy is low
        zoom: 14
      },
      headers: {
        'Accept-Language': 'en'
      }
    });

    const addr = res.data?.address || {};
    const cityPart = addr.city || addr.town || addr.village || addr.county || '';
    const regionPart = addr.state || addr.state_district || '';
    const countryPart = addr.country || '';

    const parts = [cityPart, regionPart, countryPart].filter(Boolean);
    return parts.join(', ') || res.data?.display_name || '';
  };

  const reverseGeocodeBigDataCloud = async (lat, lng) => {
    const res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: {
        latitude: lat,
        longitude: lng,
        localityLanguage: 'en'
      }
    });

    const data = res.data || {};
    const cityPart = data.city || data.locality || data.principalSubdivision || '';
    const regionPart = data.principalSubdivision || '';
    const countryPart = data.countryName || '';

    const parts = [cityPart, regionPart, countryPart].filter(Boolean);
    return parts.join(', ');
  };

  const fetchAreaByCoordinates = async (lat, lng) => {
    try {
      const results = await Promise.allSettled([
        reverseGeocodeNominatim(lat, lng),
        reverseGeocodeBigDataCloud(lat, lng)
      ]);

      const nominatim = results[0].status === 'fulfilled' ? String(results[0].value || '').trim() : '';
      const bdc = results[1].status === 'fulfilled' ? String(results[1].value || '').trim() : '';

      // Prefer the result that looks like a clean "City, Region, Country" string
      if (bdc && bdc.split(',').length >= 2) return bdc;
      if (nominatim) return nominatim;
      return bdc || '';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return '';
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation not supported. Please enter your location manually.');
      setFormData(prev => ({ ...prev, location: '' }));
      setPermissionDenied(true);
      return;
    }

    setDetectingLocation(true);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const accuracy = Number(position.coords.accuracy);
        setLocationAccuracy(Number.isFinite(accuracy) ? accuracy : null);
        setCoords({ lat: latitude, lng: longitude });
        const detectedArea = await fetchAreaByCoordinates(latitude, longitude);
        if (detectedArea) {
          setFormData(prev => ({ ...prev, location: detectedArea }));
          if (Number.isFinite(accuracy) && accuracy >= 2000) {
            setLocationMessage(`✓ Detected (approx. +/-${Math.round(accuracy)}m): ${detectedArea}. If this looks wrong, turn on GPS/high accuracy and tap Retry.`);
          } else if (Number.isFinite(accuracy) && accuracy >= 200) {
            setLocationMessage(`✓ Detected (+/-${Math.round(accuracy)}m): ${detectedArea}`);
          } else {
            setLocationMessage(`✓ Detected: ${detectedArea}`);
          }
        } else {
          setLocationMessage('Location detected but could not resolve the city. Please enter manually.');
          setFormData(prev => ({ ...prev, location: '' }));
          setPermissionDenied(true);
        }
        setDetectingLocation(false);
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        // Permission denied error code is 1
        if (geoError.code === 1) {
          setLocationMessage('Location permission denied. Please enable location services or enter your city manually.');
          setPermissionDenied(true);
        } else if (geoError.code === 2) {
          setLocationMessage('Location unavailable. Please enter your city/area manually.');
          setPermissionDenied(true);
        } else if (geoError.code === 3) {
          setLocationMessage('Location request timed out. Please enter your city/area manually.');
          setPermissionDenied(true);
        } else {
          setLocationMessage('Could not get your location. Please enter it manually.');
          setPermissionDenied(true);
        }
        setFormData(prev => ({ ...prev, location: '' }));
        setDetectingLocation(false);
      },
      // Force fresh location to reduce "stale / wrong city" issues
      { timeout: 20000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);

      // Trigger AI Analysis immediately
      setIsAnalyzing(true);
      setAiCategory('');
      
      const analysisData = new FormData();
      analysisData.append('image', selected);

      try {
        const res = await axios.post('http://localhost:5000/api/reports/analyze', analysisData);
        if (res.data.category) {
          setAiCategory(res.data.category);
        }
      } catch (err) {
        console.error('AI Analysis failed:', err);
        setAiCategory('General Waste');
      }
      setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setAiCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please provide photographic evidence of the waste.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    if (!formData.location) {
      setError('Please select a location before submitting.');
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('image', file);
    submitData.append('location', formData.location);
    submitData.append('description', formData.description);
    submitData.append('aiCategory', aiCategory); // Send already analyzed category
    
    if (coords) {
      submitData.append('lat', coords.lat);
      submitData.append('lon', coords.lng);
    }
    
    // User info - prioritize form data which is auto-filled from localStorage
    const userEmail = formData.email || localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole') || 'citizen';
    const userName = formData.fullName || localStorage.getItem('userName');
    const userId = "simulated_id_123"; // In a real app, this would be from the user object in context or localStorage
    
    submitData.append('userEmail', userEmail);
    submitData.append('user_name', userName);
    submitData.append('role', userRole);
    submitData.append('userId', userId);

    try {
      // Send to the new /api/report/ticket endpoint
      const res = await axios.post('http://localhost:5000/api/report/ticket', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update result to match Ticket structure
      const ticket = res.data.ticket;
      setResult({
        _id: ticket._id,
        trackingId: ticket.trackingId || ticket._id,
        wasteCategory: ticket.aiCategory,
        status: ticket.status
      });
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    }
    setIsSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      overflowX: 'hidden',
      background: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Light Top Color Header Area */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '340px',
        background: 'linear-gradient(to bottom, #eff6ff 0%, #f8fafc 100%)',
        zIndex: 0,
        borderBottom: '1px solid #e2e8f0'
      }} />

      {/* Floating Back Button */}
      <motion.button 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/'} 
        style={{ 
          position: 'fixed', 
          top: '1.5rem', 
          left: '1.5rem', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderRadius: '50%', 
          padding: '0.75rem', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
          cursor: 'pointer', 
          zIndex: 50, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#64748b'
        }}
      >
         <ArrowLeft size={20} />
      </motion.button>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px', padding: '0 1.5rem 4rem 1.5rem' }}>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '32px', 
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset', 
                overflow: 'hidden',
                margin: '0.5rem auto 0 auto',
                maxWidth: '540px'
              }}
            >
              {/* Success Header Area */}
              <div style={{ padding: '3.5rem 2.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background decorative blob */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}
                />

                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 0.1 }}
                  style={{ 
                    display: 'inline-flex', 
                    padding: '1.5rem', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%', 
                    marginBottom: '2rem', 
                    color: 'white',
                    boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.5)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}
                >
                  Submission Confirmed
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f1f5f9',
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    color: '#64748b', 
                    fontSize: '0.95rem', 
                    fontWeight: '600',
                    position: 'relative', 
                    zIndex: 1
                  }}
                >
                  Tracking ID: <span style={{ color: '#0f172a', fontWeight: '800', letterSpacing: '0.05em' }}>{result.trackingId || result._id}</span>
                </motion.div>
              </div>

              {/* Success Details / Receipt */}
              <div style={{ padding: '0 2.5rem 3rem' }}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem', 
                    marginBottom: '2.5rem',
                    background: '#ffffff',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9'
                  }}
                >
                   <motion.div 
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.75rem' }}
                   >
                      <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '14px', color: '#3b82f6' }}>
                        <ShieldAlert size={22} strokeWidth={2.5} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>AI Validation</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{result.wasteCategory || 'Analyzing Waste'}</p>
                      </div>
                   </motion.div>
                   
                   <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }}></div>

                   <motion.div 
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.7 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.75rem' }}
                   >
                      <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '14px', color: '#d97706' }}>
                        <Clock size={22} strokeWidth={2.5} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Current Status</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{result.status || 'Received'}</p>
                      </div>
                   </motion.div>
                   
                   <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }}></div>

                   <motion.div 
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.8 }}
                     style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.75rem' }}
                   >
                      <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '14px', color: '#10b981' }}>
                        <ExternalLink size={22} strokeWidth={2.5} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Next Step</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Verification by Authority</p>
                      </div>
                   </motion.div>
                </motion.div>

                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02, backgroundColor: '#000', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/citizen?track=${encodeURIComponent(result.trackingId || result._id)}`)}
                  style={{ 
                    padding: '1.25rem', 
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
                    color: 'white', 
                    borderRadius: '20px', 
                    fontWeight: '800', 
                    border: 'none', 
                    width: '100%', 
                    cursor: 'pointer', 
                    fontSize: '1.05rem',
                    boxShadow: '0 15px 30px -5px rgba(15, 23, 42, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  Return to Dashboard <ChevronRight size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Form Title Section */}
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '0.5rem' }}>
                <h1 style={{ fontSize: '2.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.8rem', letterSpacing: '-0.04em' }}>
                  Issue Reporting
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontWeight: '500' }}>
                  Provide accurate details and photographic evidence to help our AI and authorities maintain a cleaner environment.
                </p>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                
                {/* Left Side: Form Details */}
                <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '2.5rem', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)', 
                    border: '1px solid #f1f5f9'
                  }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                      
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ 
                              color: '#b91c1c', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.75rem',
                              backgroundColor: '#fef2f2', 
                              padding: '1rem', 
                              borderRadius: '12px', 
                              border: '1px solid #fecaca',
                              fontSize: '0.9rem',
                              fontWeight: '600'
                            }}>
                              <AlertCircle size={18} />
                              {error}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>FULL NAME</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem' }} />
                            <input 
                              type="text" 
                              placeholder="Alex Johnson" 
                              value={formData.fullName} 
                              onChange={e => setFormData({...formData, fullName: e.target.value})} 
                              className="mnc-input"
                              style={{ 
                                width: '100%', 
                                padding: '1rem 1.25rem 1rem 3.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: '#fcfdfe', 
                                fontSize: '1rem', 
                                color: '#0f172a', 
                                outline: 'none', 
                                transition: 'all 0.2s',
                              }} 
                              required 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>EMAIL ADDRESS</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem' }} />
                            <input 
                              type="email" 
                              placeholder="alex@example.com" 
                              value={formData.email} 
                              onChange={e => setFormData({...formData, email: e.target.value})} 
                              className="mnc-input"
                              style={{ 
                                width: '100%', 
                                padding: '1rem 1.25rem 1rem 3.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: '#fcfdfe', 
                                fontSize: '1rem', 
                                color: '#0f172a', 
                                outline: 'none', 
                                transition: 'all 0.2s',
                              }} 
                              required 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>MOBILE NUMBER</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Smartphone size={18} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem' }} />
                            <input 
                              type="tel" 
                              placeholder="+1 (555) 000-0000" 
                              value={formData.mobile} 
                              onChange={e => setFormData({...formData, mobile: e.target.value})} 
                              className="mnc-input"
                              style={{ 
                                width: '100%', 
                                padding: '1rem 1.25rem 1rem 3.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: '#fcfdfe', 
                                fontSize: '1rem', 
                                color: '#0f172a', 
                                outline: 'none', 
                                transition: 'all 0.2s',
                              }} 
                              required 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>LOCATION</label>
                            {/* Geolocation Logic Indicator */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                              {!detectingLocation && !coords && !permissionDenied && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Ready
                                </span>
                              )}
                              {detectingLocation && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Capturing...
                                </span>
                              )}
                              {!detectingLocation && coords && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Captured ✅
                                </span>
                              )}
                              {permissionDenied && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-tighter">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Denied ❌
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                            {detectingLocation ? (
                              <div style={{
                                width: '100%',
                                padding: '1rem 1.25rem 1rem 3.25rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#fcfdfe',
                                fontSize: '1rem',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <Loader2 size={16} className="animate-spin text-blue-500" />
                                <span className="animate-pulse">Locating your coordinates...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                placeholder={permissionDenied ? 'Enter your city or area' : 'Auto-detecting location...'}
                                value={formData.location}
                                onChange={e => (permissionDenied || true) && setFormData({...formData, location: e.target.value})}
                                className="mnc-input"
                                style={{
                                  width: '100%',
                                  padding: '1rem 1.25rem 1rem 3.25rem',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: permissionDenied ? 'white' : '#fcfdfe',
                                  fontSize: '1rem',
                                  color: '#0f172a',
                                  outline: 'none',
                                  transition: 'all 0.2s',
                                }}
                              />
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: '0.85rem', color: permissionDenied ? '#ef4444' : '#64748b', marginTop: '0.25rem', flex: '1 1 auto', fontStyle: 'italic' }}>
                              {locationMessage || 'Your GPS coordinates are securely captured for precise reporting.'}
                            </p>
                            <button
                              type="button"
                              onClick={handleAutoDetectLocation}
                              disabled={detectingLocation}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: detectingLocation ? '#94a3b8' : '#3b82f6',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: detectingLocation ? 'not-allowed' : 'pointer',
                                textDecoration: 'underline',
                                opacity: detectingLocation ? 0.6 : 1
                              }}
                            >
                              {coords ? 'Re-detect' : 'Retry Detection'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <motion.button 
                        type="submit" 
                        disabled={isSubmitting || !file} 
                        whileHover={(!isSubmitting && file) ? { scale: 1.01, backgroundColor: '#000' } : {}}
                        whileTap={(!isSubmitting && file) ? { scale: 0.99 } : {}}
                        style={{ 
                          width: '100%', 
                          padding: '1.1rem', 
                          backgroundColor: '#0f172a', 
                          color: 'white', 
                          borderRadius: '14px', 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.75rem', 
                          border: 'none', 
                          cursor: (isSubmitting || !file) ? 'not-allowed' : 'pointer', 
                          opacity: (isSubmitting || !file) ? 0.6 : 1, 
                          transition: 'all 0.3s', 
                          boxShadow: (!isSubmitting && file) ? '0 12px 24px -8px rgba(15, 23, 42, 0.3)' : 'none', 
                          marginTop: '0.5rem'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            Proceed to Submission <ChevronRight size={18} />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>

                {/* Right Side: Visual Evidence */}
                <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>EVIDENCE ATTACHMENT</label>
                      
                      {!preview ? (
                         <motion.div 
                           whileHover={{ borderColor: '#1E75FF', backgroundColor: 'white' }}
                           style={{ 
                             border: '2px dashed #cbd5e1', 
                             borderRadius: '24px', 
                             padding: '5rem 2.5rem', 
                             display: 'flex', 
                             flexDirection: 'column', 
                             alignItems: 'center', 
                             gap: '2rem', 
                             backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                           }}
                         >
                            <div style={{ 
                              backgroundColor: '#eff6ff', 
                              color: '#1E75FF', 
                              padding: '1.25rem', 
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 16px rgba(30, 117, 255, 0.08)'
                            }}>
                               <UploadCloud size={36} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                               <p style={{ fontWeight: '800', marginBottom: '0.6rem', fontSize: '1.35rem', color: '#0f172a' }}>
                                 Upload High-Res Proof
                               </p>
                               <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
                                 Required for AI validation and priority processing by authorities.
                               </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                               <label style={{ 
                                 cursor: 'pointer', 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 gap: '0.6rem', 
                                 backgroundColor: 'white', 
                                 border: '1px solid #e2e8f0', 
                                 padding: '0.9rem 1.6rem', 
                                 borderRadius: '14px', 
                                 fontWeight: '700', 
                                 color: '#334155', 
                                 boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                 transition: 'all 0.2s',
                                 fontSize: '0.95rem'
                               }}>
                                  <FileText size={18} /> Choose File
                                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                               </label>
                               <label style={{ 
                                 cursor: 'pointer', 
                                 display: 'flex', 
                                 alignItems: 'center', 
                                 gap: '0.6rem', 
                                 backgroundColor: '#1E75FF', 
                                 color: 'white', 
                                 padding: '0.9rem 1.6rem', 
                                 borderRadius: '14px', 
                                 fontWeight: '700', 
                                 boxShadow: '0 10px 15px -5px rgba(30, 117, 255, 0.2)',
                                 transition: 'all 0.2s',
                                 fontSize: '0.95rem'
                               }}>
                                  <Camera size={18} /> Instant Capture
                                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} hidden />
                               </label>
                            </div>
                         </motion.div>
                      ) : (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           style={{ 
                             position: 'relative', 
                             borderRadius: '24px', 
                             overflow: 'hidden', 
                             border: '1px solid #e2e8f0',
                             boxShadow: '0 25px 30px -10px rgba(0,0,0,0.1)'
                           }}
                         >
                            <img src={preview} alt="Evidence" style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }} />
                            <motion.button 
                              type="button" 
                              whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={removeFile} 
                              style={{ 
                                position: 'absolute', 
                                top: '1.25rem', 
                                right: '1.25rem', 
                                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '40px', 
                                height: '40px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                backdropFilter: 'blur(12px)',
                              }}
                            >
                               <X size={20} />
                            </motion.button>
                            <div style={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.95))', 
                              padding: '2.5rem 1.5rem 1.5rem 1.5rem', 
                              color: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.75rem' 
                            }}>
                               <div style={{ 
                              backgroundColor: '#10b981', 
                              borderRadius: '50%', 
                              padding: '0.3rem',
                              display: 'flex'
                            }}>
                              <CheckCircle2 size={16} color="white" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                               <span style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI CATEGORY</span>
                               <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                                 {isAnalyzing ? (
                                   <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                     <Loader2 className="animate-spin" size={14} /> Analyzing...
                                   </span>
                                 ) : (aiCategory || 'Processing...')}
                               </span>
                            </div>
                         </div>
                         </motion.div>
                      )}
                   </div>

                   <div style={{ 
                      backgroundColor: '#eff6ff', 
                      padding: '1.5rem', 
                      borderRadius: '18px', 
                      border: '1px solid #dbeafe',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center'
                   }}>
                      <div style={{ color: '#1E75FF' }}>
                        <ShieldAlert size={24} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '500', lineHeight: '1.5' }}>
                        Your identity is protected. We use enterprise-grade encryption for all submissions.
                      </p>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .mnc-input:focus {
          border-color: #1E75FF !important;
          background-color: white !important;
          box-shadow: 0 0 0 4px rgba(30, 117, 255, 0.08) !important;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
};

export default ReportIssue;
