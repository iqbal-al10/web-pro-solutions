import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

const Hero = ({ t }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [key, setKey] = useState(0);

  const typingText = " const config = { engine: 'V12 Twin Turbo', mode: 'production', secure: true }; initializeSystem(config); buildComponentTree(); syncDatabase();";
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    setShowTyping(true);
    setIsRunning(false);
    setIsComplete(false);
    setProgress(0);
    setCurrentText("");
    
    let charIndex = 0;
    const typingDuration = 7000; 
    const typingSpeed = typingDuration / typingText.length;

    const typingTimer = setInterval(() => {
      if (charIndex < typingText.length) {
        setCurrentText((prev) => prev + typingText.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingTimer);
        setIsRunning(true);
        setTimeout(() => {
          setShowTyping(false);
        }, 1000); 
      }
    }, typingSpeed);

    return () => clearInterval(typingTimer);
  }, [key]);

  useEffect(() => {
    if (showTyping || !isRunning) return;

    const startDelay = setTimeout(() => {
      const duration = 7000; 
      const intervalTime = duration / 100;
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) return prev + 1;
          clearInterval(timer);
          setIsComplete(true);
          setIsRunning(false); 
          return 100;
        });
      }, intervalTime);
      return () => clearInterval(timer);
    }, 500); 

    return () => clearTimeout(startDelay);
  }, [key, showTyping, isRunning]);

  const handleRefresh = () => setKey(prev => prev + 1);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  function handleMouseMove({ clientX, clientY, currentTarget }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden font-['Poppins'] bg-[#F4F7FF] pt-10"
    >
      {/* SEO & Semantic HTML */}
      <div className="sr-only">
        <h1>Web Pro Solutions - Premium Digital Ecosystem</h1>
        <ul>
          <li>Advanced SEO & Google Indexing</li>
          <li>Performance Optimization</li>
          <li>Responsive Mobile Optimization</li>
          <li>CMS & Database Integration</li>
          <li>Security SSL & Anti-Bruteforce</li>
          <li>WhatsApp Bot Integration</li>
        </ul>
      </div>

      {/* BACKGROUND ELEMENTS - Optimasi dengan will-change */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_35%,#fcfcfc_40%,#3e5491_70%,#000511_100%)]"></div>
        <motion.div 
          className="absolute inset-0 opacity-[0.65] will-change-transform"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104' viewBox='0 0 60 104'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32z' fill='none' stroke='%231d4ed8' stroke-width='1.2'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 104px',
            WebkitMaskImage: useTransform([springX, springY], ([x, y]) => `radial-gradient(175px circle at ${x}px ${y}px, black 0%, transparent 100%)`),
            maskImage: useTransform([springX, springY], ([x, y]) => `radial-gradient(175px circle at ${x}px ${y}px, black 0%, transparent 100%)`),
          }}
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          <div className="md:col-span-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-10 group">
              <div className="relative flex flex-col items-center justify-center w-16 h-16 rounded-[1.2rem] bg-slate-950 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                <span className="relative z-10 text-2xl font-serif italic font-black text-white">#1</span>
                <div className="relative z-10 text-[6.5px] font-black text-blue-400 tracking-[0.2em] uppercase mt-1">Verified</div>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-blue-900 uppercase tracking-[0.4em] mb-1">{t.hero.badge}</span>
                <p className="text-[11px] font-bold text-slate-500 italic uppercase">{t.hero.subtitle}</p>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-[5.35rem] font-black text-slate-950 leading-[0.85] uppercase tracking-tighter mb-10"
            >
              Build <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">Powerful</span> <br />
              Websites.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-slate-500 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-light">
              {t.hero.description}
            </motion.p>

            <div className="flex flex-wrap gap-5">
              <button 
                className="bg-blue-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-lg hover:bg-slate-950 transition-all active:scale-95"
                aria-label="Lihat katalog portfolio"
              >
                {t.hero.catalogBtn}
              </button>
              <a 
                href="https://wa.me/6285710379820?text=Halo%20Web%20pro%20Solutions" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-slate-950 text-white px-12 py-5 border-2 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:text-blue-600 hover:border-blue-600 transition-all shadow-2xl flex items-center gap-3"
                aria-label="Hubungi via WhatsApp"
              >
                {t.hero.getStartedBtn}
              </a>
            </div>
          </div>

          {/* Terminal Section - Optimasi dengan will-change */}
          <div className="md:col-span-6 hidden md:block md:mt-8 relative">
            <motion.div initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1.2 }} className="will-change-transform">
              
              <div 
                className={`relative z-10 p-4 rounded-[4rem] border transition-all duration-1000 ${
                  isComplete ? "bg-blue-500/20 border-blue-400 shadow-[0_0_60px_rgba(59,130,246,0.75)] scale-[1.02]" : "bg-white/40 border-white/60 shadow-2xl scale-100"
                }`}
              >
                <button 
                  onClick={handleRefresh} 
                  aria-label="Refresh Sequence"
                  className="absolute top-8 right-10 z-20 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={(!isComplete && (showTyping || isRunning || progress > 0)) ? "animate-spin" : ""}>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                  </svg>
                </button>

                <div className="rounded-[3rem] overflow-hidden bg-slate-950 h-[580px] p-8 font-mono text-[10px] text-slate-400 relative border-[10px] border-slate-950/5">
                  
                  <div className="absolute top-4 left-4 flex gap-1.5 opacity-80">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isComplete ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-red-500"}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isComplete ? "bg-yellow-400 shadow-[0_0_10px_#facc15]" : "bg-yellow-400"}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isComplete ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-green-500"}`}></div>
                  </div>
                  
                  <div className="mt-10 space-y-3">
                    <p className="text-blue-500 font-bold tracking-widest text-[9px]">// WEB_PRO_ENGINE</p>
                    
                    {showTyping && (
                      <div className="pt-2 text-white">
                        <p className="text-green-400 mb-1">&gt; SCRIPTING:</p>
                        <p className="break-all leading-relaxed text-blue-300">
                          {currentText}
                          <span className="w-1.5 h-3.5 bg-white inline-block ml-1 animate-pulse" />
                        </p>
                        {isRunning && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-400 font-bold tracking-[0.3em] mt-4 animate-pulse">
                            &gt; RUNNING...
                          </motion.p>
                        )}
                      </div>
                    )}

                    <AnimatePresence>
                      {!showTyping && progress >= 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 space-y-3">
                          <p className="text-green-400 font-bold flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : 'bg-green-500 animate-pulse'}`}></span>
                            STATUS: {isComplete ? 'ONLINE' : 'PROCESSING...'}
                          </p>

                          {!isComplete && (
                            <p className="text-blue-400/80 font-semibold tracking-wider text-[9px]">
                              &gt; BUILDING ECOSYSTEM...
                            </p>
                          )}
                          
                          <div className="mt-1 flex flex-col gap-1">
                            <p className="text-slate-500 italic">&gt; Deploying assets... {progress}%</p>
                            <div className="w-full h-[2px] bg-slate-900 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-blue-500" animate={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          
                          <div className="space-y-1 opacity-80 text-[10px] mt-4">
                            {progress > 15 && <p className="text-slate-500">[OK] Advanced SEO & Google Index</p>}
                            {progress > 30 && <p className="text-slate-500">[OK] Performance Optimization</p>}
                            {progress > 45 && <p className="text-slate-500">[OK] Responsive Mobile Optimization</p>}
                            {progress > 60 && <p className="text-slate-500">[OK] CMS & Database Integration</p>}
                            {progress > 75 && <p className="text-slate-500">[OK] Security SSL & Anti-Bruteforce</p>}
                            {progress > 90 && <p className="text-slate-500">[OK] WhatsApp Bot Integration</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isComplete && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-slate-900 mt-4">
                        <p className="text-slate-500 italic">class Digitalecosystem extends Agency {'{'}</p>
                        <p className="text-white">&nbsp;&nbsp;constructor() {'{'}</p>
                        <p className="text-blue-300">&nbsp;&nbsp;&nbsp;&nbsp;this.performance = "Ultra Fast";</p>
                        <p className="text-blue-300">&nbsp;&nbsp;&nbsp;&nbsp;this.aesthetic = "World Class";</p>
                        <p className="text-blue-300">&nbsp;&nbsp;&nbsp;&nbsp;this.result = "Elite_Masterpiece";</p>
                        <p className="text-blue-300">&nbsp;&nbsp;&nbsp;&nbsp;this.website = BuildBy("Web Pro Solutions");</p>
                        <p className="text-white">&nbsp;&nbsp;{'}'}</p>
                        <p className="text-slate-500">{'}'}</p>
                        <p className="text-green-400 font-bold mt-4 animate-bounce text-[11px] tracking-widest">&gt;&gt; SITE IS LIVE _</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;