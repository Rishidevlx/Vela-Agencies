import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { FiFastForward } from 'react-icons/fi';
import { FaFire, FaBomb } from 'react-icons/fa';
import logo from '../../assets/WithoutBg-Logo.png';

const PromoLoader = ({ onComplete }) => {
  const [stage, setStage] = useState('bombDrop'); // 'bombDrop', 'fuse', 'blast', 'fadeOut'
  const [logoUrl, setLogoUrl] = useState(logo);

  // Synchronous State Initializer:
  // Shows INSTANTLY (0ms delay) on frame 0 when active, and stays HIDDEN (0ms delay) when inactive!
  const [isVisible, setIsVisible] = useState(() => {
    const hasSeen = sessionStorage.getItem('tmt_promo_seen');
    const cachedEnabled = localStorage.getItem('tmt_promo_enabled');
    if (hasSeen === 'true') return false;
    if (cachedEnabled === 'false') return false;
    return true; // Default true so it covers the website on frame 0 with 0ms delay!
  });

  const [progress, setProgress] = useState(0);

  // SVG Fuse burning animation refs & state
  const fusePathRef = useRef(null);
  const [sparkPos, setSparkPos] = useState({ x: 140, y: 20 });
  const [dashOffset, setDashOffset] = useState(0);
  const [pathLength, setPathLength] = useState(100);

  const BOMB_DROP_TIME = 1000; // 1.0 seconds bomb gravity drop & bounce
  const FUSE_BURN_TIME = 6500; // 6.5 seconds fuse burn (until 7.5s)
  const TOTAL_PROMO_TIME = 10000; // 10.0 seconds total promo duration

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('tmt_promo_seen');
    const cachedEnabled = localStorage.getItem('tmt_promo_enabled');

    if (hasSeen === 'true' || cachedEnabled === 'false') {
      setIsVisible(false);
      if (onComplete) onComplete();
      if (cachedEnabled === 'false') {
        // Background check to see if admin re-enabled it
        fetch(import.meta.env.VITE_API_URL + '/api/cms/home')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data.general_settings) {
              const enabled = data.data.general_settings.is_promo_enabled !== false;
              localStorage.setItem('tmt_promo_enabled', enabled ? 'true' : 'false');
            }
          })
          .catch(() => {});
        return;
      }
    }

    let dropTimer, fadeTimer, completeTimer, animationFrameId;

    // Background sync CMS settings (Logo & Promo Enable/Disable toggle)
    const syncCMS = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
        const data = await response.json();
        
        if (data.success && data.data.general_settings) {
          const isEnabled = data.data.general_settings.is_promo_enabled !== false;
          localStorage.setItem('tmt_promo_enabled', isEnabled ? 'true' : 'false');

          // If admin disabled it, close loader immediately
          if (!isEnabled) {
            setIsVisible(false);
            if (onComplete) onComplete();
            return;
          }
          if (data.data.general_settings.logo_url) {
            setLogoUrl(data.data.general_settings.logo_url);
          }
        }
      } catch (err) {
        // Keep default
      }
    };

    syncCMS();

    // Timeline Phase 1: Bomb Gravity Drop & Bounce (0s -> 1.0s)
    dropTimer = setTimeout(() => {
      setStage('fuse');

      // Setup SVG Path Total Length for Fuse Burn
      let totalLen = 100;
      if (fusePathRef.current) {
        totalLen = fusePathRef.current.getTotalLength();
        setPathLength(totalLen);
        const startPt = fusePathRef.current.getPointAtLength(0);
        setSparkPos({ x: startPt.x, y: startPt.y });
      }

      // Smooth requestAnimationFrame for natural fuse burn
      const startTime = performance.now();

      const animateFuse = (currentTime) => {
        const elapsed = currentTime - startTime;
        const prog = Math.min(1, elapsed / FUSE_BURN_TIME);
        
        const totalProgress = Math.round(12 + prog * 88);
        setProgress(totalProgress);

        if (fusePathRef.current && totalLen > 0) {
          const currentLen = prog * totalLen;
          const pt = fusePathRef.current.getPointAtLength(currentLen);
          setSparkPos({ x: pt.x, y: pt.y });
          setDashOffset(-currentLen); // Fuse burns away from top to bottom
        }

        if (prog < 1) {
          animationFrameId = requestAnimationFrame(animateFuse);
        } else {
          // 7.5 Seconds Reached -> BLAST!
          triggerBlast();
        }
      };

      animationFrameId = requestAnimationFrame(animateFuse);
    }, BOMB_DROP_TIME);

    // Fade out at 8.8 seconds
    fadeTimer = setTimeout(() => {
      setStage('fadeOut');
    }, 8800);

    // Complete promo at 10 seconds
    completeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('tmt_promo_seen', 'true');
      if (onComplete) onComplete();
    }, TOTAL_PROMO_TIME);

    const triggerBlast = () => {
      setStage('blast');
      setProgress(100);

      // Trigger Confetti Explosion
      const count = 250;
      const defaults = { origin: { y: 0.65 } };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 30,
        startVelocity: 60,
        colors: ['#FF0000', '#FFD700', '#FFA500']
      });
      fire(0.2, {
        spread: 70,
        colors: ['#C70E17', '#FF8C00', '#FFFFFF']
      });
      fire(0.35, {
        spread: 110,
        decay: 0.91,
        scalar: 0.9
      });
      fire(0.1, {
        spread: 130,
        startVelocity: 30,
        decay: 0.92,
        colors: ['#FFD700', '#C70E17']
      });

      // Dispatch global fireworks event for homepage
      window.dispatchEvent(new Event('trigger-fireworks'));
    };

    return () => {
      if (dropTimer) clearTimeout(dropTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (completeTimer) clearTimeout(completeTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem('tmt_promo_seen', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center font-body transition-opacity duration-700 select-none ${
        stage === 'fadeOut' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Progress Loader Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 overflow-hidden z-20">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-brand transition-all duration-100 ease-linear shadow-sm"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Skip Button (Icon Only in Right Corner - Both Mobile & Desktop) */}
      <button 
        onClick={handleSkip}
        aria-label="Skip Promo"
        title="Skip Promo"
        className="fixed bottom-12 right-5 sm:top-5 sm:right-5 sm:bottom-auto w-11 h-11 rounded-full bg-white/95 hover:bg-brand text-brand hover:text-white border border-gray-300 shadow-xl transition-all flex items-center justify-center cursor-pointer z-30 group"
      >
        <FiFastForward className="text-lg transition-transform group-hover:scale-110" />
      </button>

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg w-full relative">
        
        {/* God Name Single Line (whitespace-nowrap) */}
        <div className="w-full overflow-hidden mb-4">
          <span className="whitespace-nowrap inline-block text-xs sm:text-sm md:text-base font-bold text-red-700 tracking-wide animate-pulse">
            ஸ்ரீ குருந்துடையார் சாஸ்தா அய்யனார் துணை
          </span>
        </div>

        {/* Logo with NO BG Box & Large Size */}
        <div className={`transition-transform duration-500 mb-3 ${stage === 'blast' ? 'scale-110' : 'scale-100'}`}>
          <img 
            src={logoUrl} 
            alt="Vela Agencies" 
            className="h-44 md:h-60 lg:h-72 w-auto object-contain border-none shadow-none bg-transparent"
          />
        </div>

        <h2 className="text-xl md:text-2xl font-heading font-extrabold uppercase text-gray-900 tracking-wider mb-1">
          Vela Agencies
        </h2>
        <p className="text-xs md:text-sm text-brand font-bold uppercase tracking-widest mb-6">
          Sivakasi Genuine Wholesale Crackers
        </p>

        {/* Idea A: Bomb Gravity Drop & Bounce Section */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          
          {/* SVG Bomb & Dynamic Burning Fuse */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="bombGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#4A4A4A" />
                <stop offset="60%" stopColor="#1A1A1A" />
                <stop offset="100%" stopColor="#050505" />
              </radialGradient>
              <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
            </defs>

            {/* Bomb Body & Cap (Gravity Drop Animation during drop stage, visible during fuse, hides on blast) */}
            {(stage === 'bombDrop' || stage === 'fuse') && (
              <g className={stage === 'bombDrop' ? 'animate-bomb-gravity' : ''}>
                <circle 
                  cx="100" 
                  cy="125" 
                  r="45" 
                  fill="url(#bombGrad)" 
                />
                <rect 
                  x="90" 
                  y="74" 
                  width="20" 
                  height="10" 
                  rx="2" 
                  fill="url(#capGrad)"
                />
                <path 
                  ref={fusePathRef}
                  id="fusePath"
                  d="M 140 20 C 140 45, 100 45, 100 74" 
                  fill="none" 
                  stroke="#8B5A2B" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={dashOffset}
                />
              </g>
            )}
          </svg>

          {/* Realistic Fire Flame moving down fuse line */}
          {stage === 'fuse' && (
            <div 
              className="absolute pointer-events-none transition-none z-10"
              style={{ 
                left: `${(sparkPos.x / 200) * 100}%`, 
                top: `${(sparkPos.y / 200) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-yellow-400/80 rounded-full blur-[3px] animate-ping"></div>
                <div className="absolute w-6 h-6 bg-orange-500/90 rounded-full blur-[1px] animate-pulse"></div>
                <div className="absolute w-4 h-4 bg-red-600 rounded-full shadow-[0_0_12px_#FFD700]"></div>
                <FaFire className="absolute text-yellow-300 text-sm animate-bounce" />
                <div className="absolute w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}

          {/* Blast Fireball Visual when Stage === 'blast' */}
          {stage === 'blast' && (
            <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
              <div className="w-36 h-36 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full shadow-[0_0_60px_#FF4500] opacity-90"></div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="mt-4 h-10 flex items-center justify-center">
          {stage === 'bombDrop' ? (
            <span className="text-xs md:text-sm font-bold text-gray-600 tracking-wider flex items-center gap-2">
              <FaBomb className="text-brand text-sm animate-bounce" />
              Dropping celebration bomb...
            </span>
          ) : stage === 'fuse' ? (
            <span className="text-xs md:text-sm font-bold text-gray-600 tracking-wider flex items-center gap-2">
              <FaFire className="text-yellow-500 text-sm animate-pulse" />
              Lighting celebration fuse... {progress}%
            </span>
          ) : (
            <span className="text-sm md:text-base font-extrabold text-brand tracking-wider uppercase animate-bounce flex items-center gap-2">
              <FaFire className="text-yellow-500" />
              WELCOME TO VELA AGENCIES
              <FaBomb className="text-red-600" />
            </span>
          )}
        </div>

      </div>

      {/* Inline styles for Idea A Gravity Drop & Bounce keyframes */}
      <style>{`
        @keyframes bombGravityDrop {
          0% {
            transform: translateY(-220px) scale(0.6);
            opacity: 0;
          }
          65% {
            transform: translateY(0px) scale(1.06);
            opacity: 1;
          }
          78% {
            transform: translateY(-16px) scale(0.96);
          }
          90% {
            transform: translateY(0px) scale(1.02);
          }
          100% {
            transform: translateY(0px) scale(1.0);
            opacity: 1;
          }
        }
        .animate-bomb-gravity {
          animation: bombGravityDrop 1.0s cubic-bezier(0.28, 0.84, 0.42, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PromoLoader;
