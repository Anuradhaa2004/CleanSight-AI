import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/homepage_image.jpg';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (localStorage.getItem('token')) {
      navigate('/report');
    } else {
      navigate('/signup');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Custom smooth easing
      }
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Mobile (white content under navbar + image below) */}
      <div className="md:hidden" style={{ backgroundColor: '#ffffff', paddingTop: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '2.5rem' }}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}
        >
          <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.25rem, 10vw, 2.8rem)', fontWeight: '600', lineHeight: '1.1', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Stop the Waste,<br />
            <span style={{ color: '#1E75FF' }}>Start the Change</span>
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.7', fontWeight: '400', maxWidth: '340px' }}>
            Take the action to reduce waste, protect animals, and build a cleaner environment for everyone.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.8rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStarted}
              style={{ width: '100%', maxWidth: '280px', backgroundColor: '#1E75FF', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(30, 117, 255, 0.2)', transition: 'all 0.3s ease', fontSize: '0.95rem' }}
            >
              Get Started
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Link
                to={userRole === 'authority' ? "/authority" : (userRole === 'citizen' ? "/citizen" : "/signup")}
                style={{ width: '100%', maxWidth: '280px', textAlign: 'center', backgroundColor: 'white', color: '#1E75FF', padding: '0.85rem 1.5rem', borderRadius: '14px', fontWeight: '600', textDecoration: 'none', border: '1.5px solid #1E75FF', transition: 'all 0.3s ease', fontSize: '0.95rem' }}
              >
                {userRole === 'authority' ? "Admin Desk" : "Citizen Desk"}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <div className="md:hidden" style={{ padding: '0 1.5rem 3rem 1.5rem', backgroundColor: '#ffffff' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '260px',
            width: '100%',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
          }}
        />
      </div>

      {/* Desktop (keep old full-screen hero) */}
      <div
        className="hidden md:flex"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          height: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '10%',
          paddingTop: '5rem',
          margin: 0,
        }}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem', textAlign: 'left', position: 'relative', zIndex: 10 }}
        >
          <motion.h1 variants={itemVariants} style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1.15', color: '#0f172a', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(255,255,255,0.6)' }}>
            Stop the Waste,<br />
            <span style={{ color: '#1E75FF' }}>Start the Change</span>
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '1.05rem', color: '#334155', lineHeight: '1.6', fontWeight: '500' }}>
            Take the action to reduce waste, protect animals, and build a cleaner environment for everyone.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', justifyContent: 'flex-start' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              style={{ backgroundColor: '#1E75FF', color: 'white', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(30, 117, 255, 0.25)', transition: 'all 0.3s ease', fontSize: '0.95rem' }}
            >
              Get Started
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={userRole === 'authority' ? "/authority" : (userRole === 'citizen' ? "/citizen" : "/signup")}
                style={{ backgroundColor: 'white', color: '#1E75FF', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', border: '1.5px solid #1E75FF', transition: 'all 0.3s ease', fontSize: '0.95rem', display: 'inline-block' }}
              >
                {userRole === 'authority' ? "Admin Desk" : "Citizen Desk"}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
