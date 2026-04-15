import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, Moon, Sun, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [isDark, setIsDark] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();

   const userEmail = localStorage.getItem('userEmail');
   const userPrefix = userEmail ? userEmail.split('@')[0] : '';
   const userName = userPrefix.charAt(0).toUpperCase() + userPrefix.slice(1);

   useEffect(() => {
      const handleScroll = () => {
         setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);

      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
         document.body.classList.add('dark-theme');
         setIsDark(true);
      }
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const toggleTheme = () => {
      if (isDark) {
         document.body.classList.remove('dark-theme');
         localStorage.setItem('theme', 'light');
         setIsDark(false);
      } else {
         document.body.classList.add('dark-theme');
         localStorage.setItem('theme', 'dark');
         setIsDark(true);
      }
   };

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('localAuthPassword');
      navigate('/login');
   };

   if (['/login', '/signup', '/report', '/citizen', '/authority'].includes(location.pathname)) {
      return null;
   }

   return (
      <motion.nav
         initial={{ y: -100 }}
         animate={{ y: 0 }}
         transition={{ type: 'spring', stiffness: 100, damping: 20 }}
         className="navbar"
         style={{
            background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
            height: '4.5rem',
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            transition: 'all 0.3s ease'
         }}
      >
         <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', margin: '0 auto' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
               <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', padding: '0.4rem', borderRadius: '10px' }}
               >
                  <Leaf className="w-5 h-5" color="white" />
               </motion.div>
               <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                  CleanSight<span style={{ color: '#1E75FF' }}>AI</span>
               </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex" style={{ gap: '2.5rem', alignItems: 'center' }}>
               {['Home', 'Impact', 'History'].map((item) => (
                  <Link
                     key={item}
                     to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                     style={{
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        color: location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? '#1E75FF' : '#64748b',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        letterSpacing: '0.01em'
                     }}
                  >
                     {item}
                     {location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) && (
                        <motion.div
                           layoutId="nav-underline"
                           transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                           style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#1E75FF', borderRadius: '2px' }}
                        />
                     )}
                  </Link>
               ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
               {/* Theme Toggle - Visible on both */}
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#f1f5f9', borderRadius: '50%', width: '34px', height: '36px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
               >
                  {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
               </motion.button>

               {/* Desktop Actions */}
               <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1.2rem' }}>
                  {userEmail ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                           <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>Account</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{userName}</span>
                        </div>
                        <motion.button
                           whileHover={{ scale: 1.03, backgroundColor: '#fee2e2' }}
                           whileTap={{ scale: 0.97 }}
                           onClick={handleLogout}
                           style={{ padding: '0.45rem 0.9rem', borderRadius: '10px', fontWeight: '600', color: '#ef4444', backgroundColor: '#fff1f1', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        >
                           <LogOut size={15} /> Logout
                        </motion.button>
                     </div>
                  ) : (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', textDecoration: 'none', padding: '0.5rem 1rem', transition: 'color 0.3s ease' }}>
                           Login
                        </Link>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                           <Link to="/signup" style={{ padding: '0.5rem 1.1rem', borderRadius: '10px', fontWeight: '600', color: 'white', backgroundColor: '#1E75FF', textDecoration: 'none', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(30, 117, 255, 0.15)', transition: 'all 0.3s ease' }}>
                              Join Now
                           </Link>
                        </motion.div>
                     </div>
                  )}
               </div>

               {/* Mobile Toggle */}
               <div className="flex md:hidden" style={{ alignItems: 'center', gap: '0.8rem' }}>
                  <motion.button
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setIsOpen(!isOpen)}
                     style={{
                        background: '#f1f5f9',
                        border: 'none',
                        padding: '0.55rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                     }}
                  >
                     <AnimatePresence mode="wait">
                        {isOpen ? (
                           <motion.div
                              key="close"
                              initial={{ rotate: -90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                           >
                              <X size={22} color="#0f172a" strokeWidth={2.5} />
                           </motion.div>
                        ) : (
                           <motion.div
                              key="menu"
                              initial={{ rotate: 90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -90, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                           >
                              <Menu size={22} color="#0f172a" strokeWidth={2.5} />
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </motion.button>
               </div>
            </div>
         </div>

         {/* Mobile Menu */}
         <AnimatePresence>
            {isOpen && (
               <>
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsOpen(false)}
                     style={{
                        position: 'fixed',
                        top: '4.5rem',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.1)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 90
                     }}
                  />

                  {/* Menu Content */}
                  <motion.div
                     initial={{ opacity: 0, y: -20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -20, scale: 0.95 }}
                     transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                     style={{
                        position: 'absolute',
                        top: '5.2rem',
                        left: '1.25rem',
                        right: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(241, 245, 249, 0.8)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        transformOrigin: 'top right'
                     }}
                  >
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['Home', 'Impact', 'History'].map((item) => (
                           <Link
                              key={item}
                              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                              onClick={() => setIsOpen(false)}
                              style={{
                                 fontWeight: '600',
                                 color: location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? '#1E75FF' : '#334155',
                                 textDecoration: 'none',
                                 fontSize: '1.05rem',
                                 padding: '0.75rem 1rem',
                                 borderRadius: '12px',
                                 backgroundColor: location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? '#f0f7ff' : 'transparent',
                                 transition: 'all 0.2s ease'
                              }}
                           >
                              {item}
                           </Link>
                        ))}
                     </div>

                     <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }} />

                     {userEmail ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1E75FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>
                                 {userName.charAt(0)}
                              </div>
                              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>{userName}</span>
                           </div>
                           <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={handleLogout}
                              style={{
                                 background: '#fff1f1',
                                 border: 'none',
                                 color: '#ef4444',
                                 fontWeight: '600',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '0.6rem',
                                 padding: '0.8rem',
                                 borderRadius: '12px',
                                 fontSize: '0.95rem'
                              }}
                           >
                              Logout <LogOut size={18} />
                           </motion.button>
                        </div>
                     ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                           <Link
                              to="/login"
                              onClick={() => setIsOpen(false)}
                              style={{
                                 textAlign: 'center',
                                 padding: '0.8rem',
                                 borderRadius: '12px',
                                 background: '#f8fafc',
                                 color: '#334155',
                                 fontWeight: '600',
                                 textDecoration: 'none',
                                 fontSize: '0.95rem',
                                 border: '1px solid #f1f5f9'
                              }}
                           >
                              Login
                           </Link>
                           <Link
                              to="/signup"
                              onClick={() => setIsOpen(false)}
                              style={{
                                 textAlign: 'center',
                                 padding: '0.8rem',
                                 borderRadius: '12px',
                                 background: '#1E75FF',
                                 color: 'white',
                                 fontWeight: '600',
                                 textDecoration: 'none',
                                 fontSize: '0.95rem',
                                 boxShadow: '0 4px 12px rgba(30, 117, 255, 0.2)'
                              }}
                           >
                              Join CleanSight AI
                           </Link>
                        </div>
                     )}
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </motion.nav>
   );
};

export default Navbar;
