import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookiesConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsent, setHasConsent] = useState(null);

  useEffect(() => {
    // Cek apakah user sudah pernah memberikan consent
    const savedConsent = localStorage.getItem('cookies_consent');
    if (savedConsent === null) {
      // Belum pernah memilih, tampilkan banner
      setIsVisible(true);
    } else {
      setHasConsent(savedConsent === 'accepted');
      setIsVisible(false);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookies_consent', 'accepted');
    setHasConsent(true);
    setIsVisible(false);
    // Trigger event untuk memulai tracking (bisa di App.jsx)
    window.dispatchEvent(new Event('cookiesAccepted'));
  };

  const rejectCookies = () => {
    localStorage.setItem('cookies_consent', 'rejected');
    setHasConsent(false);
    setIsVisible(false);
    // Trigger event untuk menghentikan tracking
    window.dispatchEvent(new Event('cookiesRejected'));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-900/95 backdrop-blur-md border-t border-slate-700 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="text-2xl">🍪</span>
                  <h3 className="font-black text-white text-sm uppercase tracking-wider">
                    Privasi Anda Penting
                  </h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Kami menggunakan cookies untuk meningkatkan pengalaman Anda, menganalisis traffic, 
                  dan memproses pemesanan. Dengan melanjutkan, Anda menyetujui penggunaan cookies 
                  sesuai <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">Kebijakan Privasi</Link> kami.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={rejectCookies}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                >
                  Tolak
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Terima
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}