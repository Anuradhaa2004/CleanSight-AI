import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/homepage_image.jpg';
import modiImg from '../assets/narendra modi.jpg';
import schoolImg from '../assets/S&G_kachra.jpg';
import toiletsImg from '../assets/Toilets.jpg';
import noDumpingImg from '../assets/NoDumping.jpg';
import gobarGasImg from '../assets/GobarGas.jpg';
import smartAiImg from '../assets/SmartAi.jpg';
import plasticReuseImg from '../assets/PlasticReuse.jpg';
import { motion } from 'framer-motion';
import { useState } from 'react';


const historyCards = [
  {
    year: '2014',
    title: 'Mission Launch',
    desc: 'Gandhi Jayanti · PM Modi launches Swachh Bharat Abhiyan',
    bgGradient: 'linear-gradient(160deg,#1e3a5f,#2563eb,#0ea5e9)',
    emoji: '🇮🇳',
    img: modiImg,
    tall: true,
  },
  {
   year:'2017',
    desc: 'Dustbins soild and liquid waste',
    bgGradient: 'linear-gradient(160deg,#064e3b,#059669,#34d399)',
   emoji: '🗑️',
    img: schoolImg,
    tall: false,
  },
  {
    year: '2019',
    title: 'Open Defecation Free (ODF)',
    desc: 'City cleanliness rankings spark healthy competition',
    bgGradient: 'linear-gradient(160deg,#312e81,#6366f1,#a5b4fc)',
    emoji: '🚽',
    img: toiletsImg,
    tall: true,
  },
  {
    year: '2021-22',
    title: 'Garbage Mountains',
    desc: 'Landfill mountain transformed into a green park',
    bgGradient: 'linear-gradient(160deg,#164e63,#0891b2,#67e8f9)',
    emoji: '🚿',
    img: noDumpingImg,
    tall: false,
  },
  {
    year: '2022-2023',
    title: 'Waste-to-Wealth: The GOBARdhan Era',
    desc: 'Converting organic waste into clean energy',
    bgGradient: 'linear-gradient(160deg,#14532d,#16a34a,#86efac)',
    emoji: '♻️',
    img: gobarGasImg,
    tall: true,
  },
  {
    year: '2024 – Present',
    title: 'Digital Swachhata & AI Integration',
    desc: 'Using AI to detect and report waste.',
    bgGradient: 'linear-gradient(160deg,#78350f,#d97706,#fcd34d)',
    emoji: '🏆',
    img: smartAiImg,
    tall: false,
  },
  {
    year: '2023-24',
    title: 'Waste-to-Art: Creative Circular Economy',
    desc: 'Transforming scrap into beautiful public monuments.',
    bgGradient: 'linear-gradient(160deg,#7c2d12,#ea580c,#fdba74)',
    emoji: '🍀',
    img: plasticReuseImg,
    tall: true,
  },
  {
    year: '2021',
    title: 'SBM-Urban 2.0',
    desc: 'Garbage-free cities and grey water management',
    bgGradient: 'linear-gradient(160deg,#1a1a2e,#4a00e0,#8e2de2)',
    emoji: '🌿',
    tall: false,
  },
  {
    year: '2023',
    title: 'Smart Monitoring',
    desc: 'IoT + satellite mapping tracks cleanliness in real time',
    bgGradient: 'linear-gradient(160deg,#0f172a,#1d4ed8,#06b6d4)',
    emoji: '📡',
    tall: true,
  },
  {
    year: 'Today',
    title: 'CleanSight AI',
    desc: 'Citizens report waste via AI · closing the gap instantly',
    bgGradient: 'linear-gradient(160deg,#1e1b4b,#4f46e5,#06b6d4)',
    emoji: '🤖',
    tall: false,
  },
];

/* ─────────────────────────────────────────────
   PORTRAIT CARD  (image-first, tall/short alternating)
───────────────────────────────────────────── */
const PortraitCard = ({ card, floatDelay }) => {
  const [hovered, setHovered] = useState(false);
  const height = card.tall ? '360px' : '280px';

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered ? -8 : [0, -10, 0] }}
      transition={
        hovered
          ? { duration: 0.3, ease: 'easeOut' }
          : { duration: 3.5 + floatDelay, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }
      }
      whileHover={{ scale: 1.04 }}
      style={{
        flexShrink: 0,
        width: '200px',
        height,
        borderRadius: '22px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: hovered
          ? '0 24px 48px rgba(0,0,0,0.22), 0 0 0 2px rgba(30,117,255,0.4)'
          : '0 10px 28px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.4s ease',
        alignSelf: 'center',
      }}
    >
      {/* Background image / gradient fill */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: card.bgGradient,
          transition: 'transform 0.5s ease',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
        }}
      >
        {card.img ? (
          <img 
            src={card.img} 
            alt={card.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '4.5rem',
              opacity: 0.35,
            }}
          >
            {card.emoji}
          </div>
        )}
      </div>

      {/* Bottom text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
          padding: '1.4rem 1rem 1rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.6rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#fff',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '100px',
            padding: '0.2rem 0.6rem',
            marginBottom: '0.4rem',
          }}
        >
          {card.year}
        </span>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: '0.3rem',
          }}
        >
          {card.title}
        </div>
        <div
          style={{
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            display: hovered ? 'block' : 'none',
          }}
        >
          {card.desc}
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   MARQUEE TRACK  (pure CSS animation for ultra-smooth loop)
───────────────────────────────────────────── */
const MarqueeTrack = ({ cards }) => {
  const doubled = [...cards, ...cards];

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-inner" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        {doubled.map((card, i) => (
          <PortraitCard key={i} card={card} floatDelay={(i % cards.length) * 0.3} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HISTORY SECTION
───────────────────────────────────────────── */
const HistorySection = () => (
  <section
    id="history"
    style={{
      width: '100%',
      padding: '5rem 0 4rem',
      background: 'var(--bg-color)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'background-color 0.3s ease',
    }}
  >
    {/* Soft blobs */}
    <div style={{ position: 'absolute', top: '-5rem', right: '-6rem', width: '28rem', height: '28rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,117,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-4rem', left: '-4rem', width: '22rem', height: '22rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      style={{ textAlign: 'center', padding: '0 1.5rem', marginBottom: '2.5rem' }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1E75FF',
          background: 'rgba(30,117,255,0.08)',
          border: '1px solid rgba(30,117,255,0.2)',
          borderRadius: '100px',
          padding: '0.3rem 1rem',
          marginBottom: '1rem',
        }}
      >
        Our Legacy
      </span>
      <h2
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.8rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '0.8rem',
          transition: 'color 0.3s ease',
        }}
      >
        The Journey of{' '}
        <span style={{ background: 'linear-gradient(90deg,#1E75FF,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Swachh Bharat
        </span>
      </h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, transition: 'color 0.3s ease' }}>
        A decade of transformation — hover over a card to learn more
      </p>
    </motion.div>

    {/* Carousel */}
    <MarqueeTrack cards={historyCards} />
  </section>
);

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (localStorage.getItem('token')) navigate('/report');
    else navigate('/signup');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── MOBILE HERO ── */}
      <div className="md:hidden" style={{ backgroundColor: 'var(--bg-color)', paddingTop: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '2.5rem', transition: 'background-color 0.3s ease' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          style={{ width: '100%', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
          <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.25rem,10vw,2.8rem)', fontWeight: 600, lineHeight: 1.1, color: 'var(--text-main)', letterSpacing: '-0.02em', transition: 'color 0.3s ease' }}>
            Stop the Waste,<br /><span style={{ color: '#1E75FF' }}>Start the Change</span>
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 400, maxWidth: '340px', transition: 'color 0.3s ease' }}>
            Take the action to reduce waste, protect animals, and build a cleaner environment for everyone.
          </motion.p>
          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.8rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGetStarted}
              style={{ width: '100%', maxWidth: '280px', backgroundColor: '#1E75FF', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(30,117,255,0.2)', fontSize: '0.95rem' }}>
              Get Started
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Link to={userRole === 'authority' ? '/authority' : (userRole === 'citizen' ? '/citizen' : '/signup')}
                style={{ width: '100%', maxWidth: '280px', textAlign: 'center', backgroundColor: 'var(--surface)', color: '#1E75FF', padding: '0.85rem 1.5rem', borderRadius: '14px', fontWeight: 600, textDecoration: 'none', border: '1.5px solid #1E75FF', fontSize: '0.95rem', transition: 'background-color 0.3s ease' }}>
                {userRole === 'authority' ? 'Admin Desk' : 'Citizen Desk'}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile hero image */}
      <div className="md:hidden" style={{ padding: '0 1.5rem 3rem', backgroundColor: 'var(--bg-color)', transition: 'background-color 0.3s ease' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '260px', width: '100%', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div className="hero-overlay absolute inset-0 z-0 pointer-events-none"></div>
        </motion.div>
      </div>

      {/* ── DESKTOP HERO ── */}
      <div className="hidden md:flex items-center justify-start relative"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'scroll', height: '100vh', width: '100%', boxSizing: 'border-box', paddingLeft: '10%', paddingTop: '5rem', margin: 0 }}>
        
        {/* Responsive Dark Overlay */}
        <div className="hero-overlay absolute inset-0 z-0 pointer-events-none"></div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem', textAlign: 'left', position: 'relative', zIndex: 10 }}>
          <motion.h1 variants={itemVariants} style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.15, color: 'var(--text-main)', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)', transition: 'color 0.3s ease' }}>
            Stop the Waste,<br /><span style={{ color: '#1E75FF' }}>Start the Change</span>
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '1.05rem', color: 'var(--text-main)', textShadow: '0 1px 4px rgba(0,0,0,0.2)', lineHeight: 1.6, fontWeight: 500, transition: 'color 0.3s ease' }}>
            Take the action to reduce waste, protect animals, and build a cleaner environment for everyone.
          </motion.p>
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleGetStarted}
              style={{ backgroundColor: '#1E75FF', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(30,117,255,0.25)', fontSize: '0.95rem' }}>
              Get Started
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to={userRole === 'authority' ? '/authority' : (userRole === 'citizen' ? '/citizen' : '/signup')}
                style={{ backgroundColor: 'var(--surface)', color: '#1E75FF', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', border: '1.5px solid #1E75FF', fontSize: '0.95rem', display: 'inline-block', transition: 'background-color 0.3s ease' }}>
                {userRole === 'authority' ? 'Admin Desk' : 'Citizen Desk'}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── HISTORY SECTION ── */}
      <HistorySection />
    </div>
  );
};

export default Landing;
