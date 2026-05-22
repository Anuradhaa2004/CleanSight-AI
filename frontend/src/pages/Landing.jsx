import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/homepage_image.jpg';
import modiImg from '../assets/narendra modi.jpg';
import schoolImg from '../assets/S&G_kachra.jpg';
import toiletsImg from '../assets/Toilets.jpg';
import noDumpingImg from '../assets/NoDumping.jpg';
import gobarGasImg from '../assets/GobarGas.jpg';
import smartAiImg from '../assets/SmartAi.jpg';
import plasticReuseImg from '../assets/PlasticReuse.jpg';
import { motion, useInView, useSpring, useTransform, useScroll } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Smartphone, ClipboardList, Camera, Upload, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';


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
    year: '2017',
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
const HistorySection = () => {
  useEffect(() => {
    if (window.location.hash === '#history') {
      setTimeout(() => {
        const element = document.getElementById('history');
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 600);
    }
  }, []);

  return (
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
};

/* ─────────────────────────────────────────────
   HOW IT WORKS — ROADMAP SECTION
───────────────────────────────────────────── */
const roadmapSteps = [
  { id: 1, title: 'Open the App', desc: 'Launch CleanSight AI and log into your citizen account.', Icon: Smartphone, color: '#1E75FF', cx: 80, cy: 320 },
  { id: 2, title: 'Fill the Form', desc: 'Enter issue details — location, description and category.', Icon: ClipboardList, color: '#06b6d4', cx: 310, cy: 70 },
  { id: 3, title: 'Click the Photo', desc: 'Capture a high-res photo of the waste or civic issue.', Icon: Camera, color: '#8b5cf6', cx: 510, cy: 240 },
  { id: 4, title: 'Upload It', desc: 'Tap Upload — our AI classifies the issue in seconds.', Icon: Upload, color: '#f59e0b', cx: 720, cy: 55 },
  { id: 5, title: 'Submit', desc: 'Authorities receive an instant email with GPS coordinates.', Icon: CheckCircle, color: '#10b981', cx: 940, cy: 305 },
];

const SVG_W = 1000;
const SVG_H = 380;
const PATH_D = 'M 80,320 C 80,110 260,70 310,70 C 375,70 440,240 510,240 C 590,240 655,55 720,55 C 800,55 882,295 940,305';
const PATH_LEN = 2150;
const ANCHORS = ['above', 'below', 'above', 'below', 'above'];

/* ─────────────────────────────────────────────
   PREMIUM UI COMPONENTS
───────────────────────────────────────────── */
const LetterReveal = ({ text, delay = 0 }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 200 },
    },
    hidden: { opacity: 0, y: 20 },
  };

  return (
    <motion.h2
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{
        fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.03em',
        lineHeight: 1.15,
        marginBottom: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          key={index}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.h2>
  );
};

const PathParticles = ({ pathD, color, duration = 12 }) => {
  return (
    <>
      {[0, 0.25, 0.5, 0.75].map((delay, i) => (
        <motion.circle
          key={i}
          r="3"
          fill={color}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: 'linear',
            delay: delay * duration,
          }}
          style={{ offsetPath: `path("${pathD}")`, filter: 'blur(1px)' }}
        />
      ))}
    </>
  );
};

const RippleNode = ({ cx, cy, color, delay }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r={22}
        fill="none"
        stroke={color}
        strokeWidth="1"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeOut',
          delay: delay + i * 0.8,
        }}
      />
    ))}
  </g>
);

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const progressBarScaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Handle initial scroll if hash is present
    if (window.location.hash === '#how-it-works') {
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 500);
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{
        width: '100%',
        padding: '6rem 0 7rem',
        background: 'var(--bg-color)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @media (max-width: 700px)  { .hiw-desktop { display: none !important; } }
        @media (min-width: 701px)  { .hiw-mobile  { display: none !important; } }
        .spotlight {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(30,117,255,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          transform: translate(-50%, -50%);
          transition: background 0.3s ease;
        }
      `}</style>

      {/* ── Interactive Spotlight ── */}
      <div
        className="spotlight"
        style={{
          left: mousePos.x,
          top: mousePos.y,
        }}
      />

      {/* Background radial gradients (Base) */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 50% at 10% 20%, rgba(30,117,255,0.03) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 40% at 90% 80%, rgba(6,182,212,0.03) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: '0 1.5rem', marginBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          style={{
            display: 'inline-block', fontSize: '0.68rem', fontWeight: 800,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E75FF',
            background: 'rgba(30,117,255,0.08)', border: '1px solid rgba(30,117,255,0.2)',
            borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.2rem',
          }}
        >
          Engineering Excellence
        </motion.span>

        <LetterReveal text="The Road to a Cleaner Future" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, transition: 'color 0.3s ease' }}
        >
          CleanSight AI automates every step from reporting to resolution with pinpoint precision.
        </motion.p>
      </div>

      {/* ════ DESKTOP: SVG ROADMAP ════ */}
      <div className="hiw-desktop" style={{ width: '100%', maxWidth: '1180px', margin: '0 auto', padding: '0 2.5rem', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', paddingBottom: `${(SVG_H / SVG_W) * 100}%` }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="hiwGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E75FF" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="hiwPathGlow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <path d={PATH_D} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="16" strokeLinecap="round" />

            <motion.path
              d={PATH_D} fill="none" stroke="url(#hiwGrad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={PATH_LEN}
              initial={{ strokeDashoffset: PATH_LEN }}
              animate={inView ? { strokeDashoffset: 0 } : {}}
              transition={{ duration: 3, ease: 'easeInOut' }}
              filter="url(#hiwPathGlow)"
            />

            <PathParticles pathD={PATH_D} color="#fff" duration={15} />

            {roadmapSteps.map((step, i) => (
              <g key={step.id}>
                <RippleNode cx={step.cx} cy={step.cy} color={step.color} delay={i * 0.5} />
                <motion.circle cx={step.cx} cy={step.cy} r={24}
                  fill={step.color}
                  initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.4, type: 'spring' }}
                  style={{ filter: 'drop-shadow(0 0 10px ' + step.color + '88)' }}
                />
                <motion.text x={step.cx} y={step.cy + 5} textAnchor="middle" fontSize="11" fontWeight="900" fill="white" style={{ userSelect: 'none' }}>
                  {step.id}
                </motion.text>
                <motion.line
                  x1={step.cx} y1={ANCHORS[i] === 'above' ? step.cy - 24 : step.cy + 24}
                  x2={step.cx} y2={ANCHORS[i] === 'above' ? step.cy - 70 : step.cy + 70}
                  stroke={step.color} strokeWidth="1.5" strokeDasharray="3 3"
                  initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}}
                  transition={{ delay: 1 + i * 0.4 }}
                />
              </g>
            ))}
          </svg>

          {roadmapSteps.map((step, i) => {
            const isAbove = ANCHORS[i] === 'above';
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                whileHover={{
                  scale: 1.05,
                  rotateX: isAbove ? 5 : -5,
                  rotateY: 5,
                  boxShadow: `0 15px 45px ${step.color}33`
                }}
                transition={{ delay: 1.2 + i * 0.4, type: 'spring' }}
                style={{
                  position: 'absolute',
                  left: `${(step.cx / SVG_W) * 100}%`,
                  top: `${(step.cy / SVG_H) * 100}%`,
                  transform: isAbove ? 'translate(-50%, calc(-100% - 85px))' : 'translate(-50%, 85px)',
                  width: '160px',
                  background: 'var(--surface)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${step.color}33`,
                  borderRadius: '20px',
                  padding: '1.2rem 1rem',
                  textAlign: 'center',
                  zIndex: 10,
                  perspective: '1000px'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  <step.Icon size={18} color={step.color} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══ MOBILE: PREMIUM ROADMAP ══ */}
      <div className="hiw-mobile" style={{ padding: '0 1.5rem', maxWidth: '440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Central vertical track */}
        <div style={{
          position: 'absolute',
          left: 'calc(2rem + 23px)',
          top: '20px',
          bottom: '20px',
          width: '4px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '10px'
        }} />

        {/* Animated fill track */}
        <motion.div style={{
          position: 'absolute',
          left: 'calc(2rem + 23px)',
          top: '20px',
          width: '4px',
          height: 'calc(100% - 40px)',
          background: 'linear-gradient(to bottom, #1E75FF, #8b5cf6, #10b981)',
          borderRadius: '10px',
          scaleY: progressBarScaleY,
          transformOrigin: 'top',
          boxShadow: '0 0 15px rgba(30,117,255,0.4)',
        }} />

        {roadmapSteps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
            style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', position: 'relative', zIndex: 2 }}
          >
            {/* Left: Indicator with ripple */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <RippleNode cx={23} cy={23} color={step.color} delay={i * 0.3} />
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                style={{
                  width: '46px', height: '46px', borderRadius: '50%', background: step.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 900,
                  boxShadow: `0 8px 24px ${step.color}55`, position: 'relative', zIndex: 5
                }}
              >
                {step.id}
              </motion.div>
            </div>

            {/* Right: Glass Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--surface)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${step.color}25`,
                borderRadius: '24px',
                padding: '1.4rem',
                flex: 1,
                boxShadow: `0 10px 30px rgba(0,0,0,0.05)`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: step.color
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: `${step.color}15` }}>
                  <step.Icon size={16} color={step.color} strokeWidth={2.5} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, transition: 'color 0.3s ease' }}>
                  {step.title}
                </h4>
              </div>

              <p style={{
                fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0,
                transition: 'color 0.3s ease'
              }}>
                {step.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};


/* ─────────────────────────────────────────────
   CTA SECTION — READY TO CLEAN?
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   CTA SECTION — PROFESSIONAL OVERHAUL
───────────────────────────────────────────── */
const CTASection = ({ onGetStarted }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{
        width: '100%',
        padding: '10rem 1.5rem',
        background: 'var(--bg-color)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* ── Background Patterns ── */}
      {/* Dot Grid */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'radial-gradient(circle, var(--text-muted) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none'
        }}
      />

      {/* Animated Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 50, 0], y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', top: '10%', right: '15%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(30,117,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{
          x: [0, -40, 0], y: [0, 60, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', bottom: '10%', left: '10%', width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'var(--surface)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--surface-border)',
          borderRadius: '48px',
          padding: '6rem 2rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Subtle internal gradient glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.5 }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span style={{
            fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.3em', color: 'var(--primary)', marginBottom: '1.5rem', display: 'block'
          }}>
            Vanguard of Urban Innovation
          </span>

          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            color: 'var(--text-main)',
            marginBottom: '1.8rem',
            letterSpacing: '-0.04em',
            lineHeight: 0.95
          }}>
            Pioneer the Future <br />
            <span style={{
              background: 'linear-gradient(135deg, #1E75FF 0%, #8b5cf6 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.1))'
            }}>
              of Sustainability.
            </span>
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '620px',
            margin: '0 auto 4rem',
            lineHeight: 1.8,
            fontWeight: 400
          }}>
            Bridge the gap between detection and action.
            We aren't just reporting waste; <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>we are engineering a cleaner tomorrow</span>
            , one automated alert at a time.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button
              onClick={onGetStarted}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(30, 117, 255, 0.4)',
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#1E75FF',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 800,
                padding: '1.4rem 3.5rem',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(30, 117, 255, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
              }}
            >
              Get Started Now <CheckCircle size={20} />
            </motion.button>

            <motion.button
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) {
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
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(30, 117, 255, 0.05)',
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '1.4rem 3.5rem',
                borderRadius: '24px',
                border: '1.5px solid var(--surface-border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Explore Technology
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

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

      {/* ── HOW IT WORKS SECTION ── */}
      <HowItWorks />

      {/* ── GET STARTED CTA SECTION ── */}
      <CTASection onGetStarted={handleGetStarted} />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default Landing;
