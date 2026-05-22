import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ExternalLink } from 'lucide-react';

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const socialLinks = [
  { Icon: TwitterIcon, href: 'https://x.com/AnuradhaGu2004' },
  { Icon: GithubIcon, href: 'https://github.com/Anuradhaa2004' },
  { Icon: LinkedinIcon, href: 'https://www.linkedin.com/in/anuradha-gupta-66732632b/' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, targetId) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-color)',
      borderTop: '1px solid var(--surface-border)',
      paddingTop: '5rem',
      paddingBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Background radial glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '30%', background: 'radial-gradient(circle, rgba(30,117,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1.5' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', padding: '0.4rem', borderRadius: '10px' }}>
                <Leaf className="w-5 h-5" color="white" />
              </div>
              <span style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
                CleanSight<span style={{ color: '#1E75FF' }}>AI</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '300px' }}>
              CleanSight AI helps to bridge the gap between citizen and administration through transparency and automation.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {socialLinks.map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, color: '#1E75FF', backgroundColor: 'rgba(30,117,255,0.08)' }}
                  style={{
                    width: '38px', height: '38px', borderRadius: '12px', border: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.8rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Home', id: 'top' },
                { name: 'Working', id: 'how-it-works' },
                { name: 'History', id: 'history' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.id === 'top' ? '/' : `/#${link.id}`}
                    onClick={(e) => link.id === 'top' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : handleLinkClick(e, link.id)}
                    style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/report" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.8rem' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'AI Methodology', type: 'scroll', target: 'how-it-works' },
                { name: 'Reporting Guide', type: 'scroll', target: 'how-it-works' },
                { name: 'Swachh Mission', type: 'external', target: 'https://swachhbharatmission.gov.in/' },
                { name: 'Authority Desk', type: 'internal', target: '/login' }
              ].map((res) => (
                <li key={res.name}>
                  {res.type === 'scroll' ? (
                    <Link 
                      to={`/#${res.target}`} 
                      onClick={(e) => handleLinkClick(e, res.target)}
                      style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {res.name}
                    </Link>
                  ) : res.type === 'external' ? (
                    <a 
                      href={res.target} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {res.name} <ExternalLink size={12} style={{ opacity: 0.5 }} />
                    </a>
                  ) : (
                    <Link 
                      to={res.target}
                      style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {res.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.8rem' }}>Newsletter</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              Stay updated with the latest in urban tech.
            </p>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="Email address"
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
                  border: '1px solid var(--surface-border)', background: 'var(--surface)',
                  fontSize: '0.85rem', color: 'var(--text-main)', outline: 'none'
                }}
              />
              <motion.button
                whileHover={{ x: 3 }}
                style={{ position: 'absolute', right: '8px', width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#1E75FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--surface-border)', width: '100%', marginBottom: '2rem', opacity: 0.5 }} />

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {currentYear} CleanSight AI. All rights reserved. Built with ❤️ for Cleaner Cities.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
