import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

import logoWebPro from '../assets/web pro transparant.webp';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t, toggleLanguage } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuItems = [
    { name: t.navbar.catalog, id: 'catalog' },
    { name: t.navbar.pricing, id: 'pricing' },
    { name: t.navbar.testimonials, id: 'testimonials-section' },
    { name: t.navbar.faq, id: 'faq' }
  ];

  const handleNavClick = (id) => {
    setIsMenuOpen(false);
    
    const scrollToElement = () => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -70; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToElement, 150);
    } else {
      scrollToElement();
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 font-['poppins'] ${
      isScrolled 
        ? "bg-white/60 backdrop-blur-md border-b border-slate-200/50 py-0 shadow-sm" 
        : "bg-white py-0.5 border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
        
        {/* LOGO */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-[110]"
        >
          <motion.img 
            whileHover={{ scale: 1.02 }}
            src={logoWebPro} 
            alt="Logo Web Pro Solutions" 
            className="h-12 md:h-14 w-auto object-contain" 
          />
        </Link>
        
        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8 text-blue-900 font-bold items-center uppercase text-[16px]">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="cursor-pointer transition-all relative group py-1 hover:text-blue-700"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full rounded-full"></span>
            </button>
          ))}
          
          {/* LANGUAGE TOGGLE */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 text-[11px] font-black uppercase tracking-wider transition-all"
          >
            {language === 'id' ? '🇬🇧 EN' : '🇮🇩 ID'}
          </button>
          
          {/* Dashboard Button */}
          {session ? (
            <Link to="/admin">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-900 text-white px-5 py-1.5 rounded-xl text-[14px] font-black uppercase tracking-wider shadow-lg hover:shadow-blue-950/70"
              >
                {t.navbar.dashboard}
              </motion.button>
            </Link>
          ) : (
            <Link to="/login" className="text-[10px] text-blue-900/10 hover:text-blue-900/40 transition-colors ml-4">
              .
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="md:hidden flex items-center gap-3 relative z-[110]">
          {/* Language Toggle Mobile */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase"
          >
            {language === 'id' ? 'EN' : 'ID'}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-blue-900">
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-blue-900 transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`w-full h-0.5 bg-blue-900 transition-all ${isMenuOpen ? "opacity-0" : ""}`}></span>
              <span className={`w-full h-0.5 bg-blue-900 transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
            </div>
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-full h-screen bg-white z-[100] flex flex-col items-center justify-center gap-10 md:hidden"
            >
              {menuItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="text-3xl font-black uppercase tracking-tighter text-blue-900"
                >
                  {item.name}
                </button>
              ))}
              {session && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                  <button className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/30">
                    Go to Dashboard
                  </button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}